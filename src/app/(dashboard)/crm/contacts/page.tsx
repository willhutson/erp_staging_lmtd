import { Suspense } from "react";
import Link from "next/link";
import { Plus, Users, Search, Filter, Building2, Mail, Phone } from "lucide-react";
import { getContacts } from "@/modules/crm/actions/crm-actions";
import type { ContactType, ContactStatus } from "@/modules/crm/actions/crm-actions";
import { cn } from "@/lib/utils";

const contactTypeColors: Record<ContactType, string> = {
  PROSPECT: "bg-gray-100 text-gray-700",
  LEAD: "bg-blue-100 text-blue-700",
  CUSTOMER: "bg-green-100 text-green-700",
  PARTNER: "bg-purple-100 text-purple-700",
  VENDOR: "bg-orange-100 text-orange-700",
  INFLUENCER: "bg-pink-100 text-pink-700",
  PRESS: "bg-indigo-100 text-indigo-700",
  INVESTOR: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-600",
};

const statusColors: Record<ContactStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  UNSUBSCRIBED: "bg-yellow-100 text-yellow-700",
  BOUNCED: "bg-red-100 text-red-700",
  DO_NOT_CONTACT: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

async function ContactsList() {
  const contacts = await getContacts();

  type Contact = Awaited<ReturnType<typeof getContacts>>[number];

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No contacts yet</h3>
        <p className="text-gray-500 mt-1 mb-4">
          Start building your CRM by adding your first contact.
        </p>
        <Link
          href="/crm/contacts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deals
            </th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {contacts.map((contact: Contact) => (
            <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/crm/contacts/${contact.id}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                    {contact.firstName[0]}{contact.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 hover:text-[#52EDC7] transition-colors">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3">
                {contact.company ? (
                  <Link
                    href={`/clients/${contact.company.id}`}
                    className="flex items-center gap-1 text-gray-700 hover:text-[#52EDC7]"
                  >
                    <Building2 className="w-4 h-4" />
                    {contact.company.name}
                  </Link>
                ) : contact.companyName ? (
                  <span className="text-gray-500">{contact.companyName}</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", contactTypeColors[contact.contactType as ContactType])}>
                  {contact.contactType}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", statusColors[contact.status as ContactStatus])}>
                  {contact.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {contact._count.deals}
              </td>
              <td className="px-4 py-3">
                {contact.owner ? (
                  <span className="text-gray-700">{contact.owner.name}</span>
                ) : (
                  <span className="text-gray-400">Unassigned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function ContactsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your CRM contacts and leads</p>
        </div>
        <Link
          href="/crm/contacts/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 bg-white rounded-lg border p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-lg border p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        }
      >
        <ContactsList />
      </Suspense>
    </div>
  );
}
