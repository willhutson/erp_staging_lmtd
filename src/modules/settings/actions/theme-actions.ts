"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ThemeSettings } from "@/lib/theme";

export async function getOrganizationTheme() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    select: {
      themeSettings: true,
      logo: true,
      logoMark: true,
      favicon: true,
    },
  });

  return {
    themeSettings: org?.themeSettings as Partial<ThemeSettings> | null,
    logo: org?.logo,
    logoMark: org?.logoMark,
    favicon: org?.favicon,
  };
}

export async function updateThemeSettings(themeSettings: Partial<ThemeSettings>) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only admins can update theme
  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can update theme settings");
  }

  await db.organization.update({
    where: { id: session.user.organizationId },
    data: {
      themeSettings: themeSettings as object,
    },
  });

  revalidatePath("/settings/branding");
  revalidatePath("/", "layout");
}

export async function updateOrganizationBranding(data: {
  logo?: string;
  logoMark?: string;
  favicon?: string;
  name?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only admins can update branding
  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can update branding");
  }

  await db.organization.update({
    where: { id: session.user.organizationId },
    data: {
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(data.logoMark !== undefined && { logoMark: data.logoMark }),
      ...(data.favicon !== undefined && { favicon: data.favicon }),
      ...(data.name !== undefined && { name: data.name }),
    },
  });

  revalidatePath("/settings/branding");
  revalidatePath("/", "layout");
}
