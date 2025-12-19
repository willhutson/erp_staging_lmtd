"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface CreateContactInput {
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  linkedIn?: string;
  isPrimary?: boolean;
  isDecisionMaker?: boolean;
  isBillingContact?: boolean;
  notes?: string;
}

export async function createContact(input: CreateContactInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify client belongs to user's org
  const client = await db.client.findFirst({
    where: {
      id: input.clientId,
      organizationId: session.user.organizationId,
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // If setting as primary, unset other primary contacts
  if (input.isPrimary) {
    await db.clientContact.updateMany({
      where: { clientId: input.clientId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const contact = await db.clientContact.create({
    data: {
      clientId: input.clientId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      jobTitle: input.jobTitle,
      department: input.department,
      linkedIn: input.linkedIn,
      isPrimary: input.isPrimary ?? false,
      isDecisionMaker: input.isDecisionMaker ?? false,
      isBillingContact: input.isBillingContact ?? false,
      notes: input.notes,
    },
  });

  revalidatePath(`/clients/${input.clientId}`);
  return contact;
}

export async function updateContact(
  contactId: string,
  data: Partial<Omit<CreateContactInput, "clientId">>
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const contact = await db.clientContact.findUnique({
    where: { id: contactId },
    include: { client: true },
  });

  if (!contact || contact.client.organizationId !== session.user.organizationId) {
    throw new Error("Contact not found");
  }

  // If setting as primary, unset other primary contacts
  if (data.isPrimary) {
    await db.clientContact.updateMany({
      where: { clientId: contact.clientId, isPrimary: true, id: { not: contactId } },
      data: { isPrimary: false },
    });
  }

  const updated = await db.clientContact.update({
    where: { id: contactId },
    data,
  });

  revalidatePath(`/clients/${contact.clientId}`);
  return updated;
}

export async function deleteContact(contactId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const contact = await db.clientContact.findUnique({
    where: { id: contactId },
    include: { client: true },
  });

  if (!contact || contact.client.organizationId !== session.user.organizationId) {
    throw new Error("Contact not found");
  }

  await db.clientContact.delete({
    where: { id: contactId },
  });

  revalidatePath(`/clients/${contact.clientId}`);
}
