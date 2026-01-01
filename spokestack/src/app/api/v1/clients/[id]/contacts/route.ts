/**
 * GET /api/v1/clients/:id/contacts - List client contacts
 * POST /api/v1/clients/:id/contacts - Add a contact to client
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  created,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const CreateContactSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  linkedIn: z.string().url().optional().nullable(),
  isPrimary: z.boolean().default(false),
  isDecisionMaker: z.boolean().default(false),
  isBillingContact: z.boolean().default(false),
  isContractOwner: z.boolean().default(false),
  isProcurementPoc: z.boolean().default(false),
  isFinancePoc: z.boolean().default(false),
  isNpsDesignee: z.boolean().default(false),
  notes: z.string().max(2000).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: clientId } = await params;
    const context = await getAuthContext();

    // Verify client belongs to org
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    if (!client) {
      throw ApiError.notFound("Client");
    }

    const contacts = await prisma.clientContact.findMany({
      where: {
        clientId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        jobTitle: true,
        department: true,
        linkedIn: true,
        isPrimary: true,
        isDecisionMaker: true,
        isBillingContact: true,
        isContractOwner: true,
        isProcurementPoc: true,
        isFinancePoc: true,
        isNpsDesignee: true,
        notes: true,
        createdAt: true,
      },
      orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    });

    return success(contacts);
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: clientId } = await params;
    const context = await getAuthContext();

    const data = await validateBody(request, CreateContactSchema);

    // Verify client belongs to org
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    if (!client) {
      throw ApiError.notFound("Client");
    }

    // If setting as primary, unset other primary contacts
    if (data.isPrimary) {
      await prisma.clientContact.updateMany({
        where: {
          clientId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.clientContact.create({
      data: {
        ...data,
        clientId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        jobTitle: true,
        department: true,
        linkedIn: true,
        isPrimary: true,
        isDecisionMaker: true,
        isBillingContact: true,
        isContractOwner: true,
        createdAt: true,
      },
    });

    return created(contact);
  });
}
