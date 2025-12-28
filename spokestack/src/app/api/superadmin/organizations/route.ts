import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }).catch(() => []);

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    // Return empty array on error so client doesn't crash
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, domain } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { message: "An organization with this slug already exists" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        domain,
        settings: {},
        themeSettings: {},
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { message: "Failed to create organization" },
      { status: 500 }
    );
  }
}
