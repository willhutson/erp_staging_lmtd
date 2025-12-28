import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clearTenantCache } from "@/lib/tenant";

export async function GET() {
  try {
    const instances = await prisma.clientInstance.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json(instances);
  } catch (error) {
    console.error("Error fetching instances:", error);
    return NextResponse.json(
      { message: "Failed to fetch instances" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      organizationId,
      tier = "PRO",
      primaryColor = "#52EDC7",
      secondaryColor = "#1BA098",
      enabledModules = ["admin"],
    } = body;

    if (!name || !slug || !organizationId) {
      return NextResponse.json(
        { message: "Name, slug, and organization are required" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { message: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existing = await prisma.clientInstance.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { message: "An instance with this slug already exists" },
        { status: 400 }
      );
    }

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 400 }
      );
    }

    const instance = await prisma.clientInstance.create({
      data: {
        name,
        slug,
        organizationId,
        tier: tier as "FREE" | "PRO" | "ENTERPRISE",
        primaryColor,
        secondaryColor,
        enabledModules,
        isActive: true,
        settings: {},
        themeConfig: {},
      },
      include: {
        organization: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    console.error("Error creating instance:", error);
    return NextResponse.json(
      { message: "Failed to create instance" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Instance ID is required" },
        { status: 400 }
      );
    }

    const instance = await prisma.clientInstance.update({
      where: { id },
      data: updates,
    });

    // Clear tenant cache for this instance
    clearTenantCache(instance.slug);
    if (instance.customDomain) {
      clearTenantCache(instance.customDomain);
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error("Error updating instance:", error);
    return NextResponse.json(
      { message: "Failed to update instance" },
      { status: 500 }
    );
  }
}
