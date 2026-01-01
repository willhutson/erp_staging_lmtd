import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - List all users
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ department: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
        permissionLevel: true,
        isFreelancer: true,
        isActive: true,
        weeklyCapacity: true,
        skills: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      role,
      department,
      permissionLevel = "STAFF",
      isFreelancer = false,
      weeklyCapacity = 40,
      organizationId,
    } = body;

    if (!name || !email || !role || !department) {
      return NextResponse.json(
        { message: "Name, email, role, and department are required" },
        { status: 400 }
      );
    }

    // Get default organization if not provided
    let orgId = organizationId;
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst({
        orderBy: { createdAt: "asc" },
      });
      if (!defaultOrg) {
        return NextResponse.json(
          { message: "No organization found" },
          { status: 400 }
        );
      }
      orgId = defaultOrg.id;
    }

    // Check if email already exists in organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        organizationId: orgId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email already exists in this organization" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        department,
        permissionLevel: permissionLevel as "ADMIN" | "LEADERSHIP" | "TEAM_LEAD" | "STAFF" | "FREELANCER",
        isFreelancer,
        weeklyCapacity,
        organizationId: orgId,
        isActive: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
