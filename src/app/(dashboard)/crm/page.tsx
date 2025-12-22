import { Suspense } from "react";
import Link from "next/link";
import { Users, TrendingUp, DollarSign, AlertCircle, Plus, ArrowRight } from "lucide-react";
import { getCRMStats, getContacts, getDeals } from "@/modules/crm/actions/crm-actions";

async function CRMStats() {
  const stats = await getCRMStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Users className="w-4 h-4" />
          Total Contacts
        </div>
        <p className="text-2xl font-bold mt-1">{stats.contacts}</p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <TrendingUp className="w-4 h-4" />
          Active Deals
        </div>
        <p className="text-2xl font-bold mt-1">{stats.activeDeals}</p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <DollarSign className="w-4 h-4" />
          Pipeline Value
        </div>
        <p className="text-2xl font-bold mt-1">
          ${Number(stats.pipelineValue).toLocaleString()}
        </p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          Overdue Tasks
        </div>
        <p className="text-2xl font-bold mt-1">{stats.overdueTasks}</p>
      </div>
    </div>
  );
}

async function RecentContacts() {
  const contacts = await getContacts({ limit: 5 });

  type Contact = Awaited<ReturnType<typeof getContacts>>[number];

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Contacts</h3>
        <Link href="/crm/contacts" className="text-sm text-[#52EDC7] hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contacts yet. Add your first contact to get started.
          </div>
        ) : (
          contacts.map((contact: Contact) => (
            <Link
              key={contact.id}
              href={`/crm/contacts/${contact.id}`}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                {contact.firstName[0]}{contact.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {contact.firstName} {contact.lastName}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {contact.email || contact.companyName || "No email"}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                {contact.contactType}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

async function RecentDeals() {
  const deals = await getDeals({ limit: 5 });

  type Deal = Awaited<ReturnType<typeof getDeals>>[number];

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Active Deals</h3>
        <Link href="/crm/deals" className="text-sm text-[#52EDC7] hover:underline flex items-center gap-1">
          View pipeline <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y">
        {deals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No deals yet. Create your first deal to track opportunities.
          </div>
        ) : (
          deals.map((deal: Deal) => (
            <Link
              key={deal.id}
              href={`/crm/deals/${deal.id}`}
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{deal.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {deal.client?.name || "No client"}
                </p>
              </div>
              <div className="text-right">
                {deal.amount && (
                  <p className="font-semibold text-gray-900">
                    ${Number(deal.amount).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-500">{deal.pipeline.name}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default function CRMPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="text-gray-500 mt-1">Manage contacts, deals, and sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/crm/contacts/new"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </Link>
          <Link
            href="/crm/deals/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Deal
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="bg-white rounded-lg border p-4 h-24 animate-pulse" />)}</div>}>
        <CRMStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="bg-white rounded-lg border h-80 animate-pulse" />}>
          <RecentContacts />
        </Suspense>
        <Suspense fallback={<div className="bg-white rounded-lg border h-80 animate-pulse" />}>
          <RecentDeals />
        </Suspense>
      </div>
    </div>
  );
}
