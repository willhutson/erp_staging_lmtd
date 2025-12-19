"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Star, Mail, Phone } from "lucide-react";
import type { ClientContact } from "@prisma/client";
import { deleteContact } from "../actions/contact-actions";
import { ContactForm } from "./ContactForm";

interface ContactListProps {
  contacts: ClientContact[];
  clientId: string;
}

export function ContactList({ contacts, clientId }: ContactListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContact | null>(
    null
  );
  const [, startTransition] = useTransition();

  const handleDelete = (contactId: string) => {
    if (!confirm("Delete this contact?")) return;

    startTransition(async () => {
      try {
        await deleteContact(contactId);
      } catch (error) {
        console.error("Failed to delete contact:", error);
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Contacts</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-sm text-[#1BA098] hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          No contacts added yet
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 flex items-start justify-between group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    {contact.isPrimary && (
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    )}
                    {contact.isDecisionMaker && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded">
                        Decision Maker
                      </span>
                    )}
                  </div>
                  {contact.jobTitle && (
                    <p className="text-sm text-gray-500">{contact.jobTitle}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1BA098]"
                      >
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#1BA098]"
                      >
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button
                  onClick={() => setEditingContact(contact)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editingContact) && (
        <ContactForm
          clientId={clientId}
          contact={editingContact || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
        />
      )}
    </div>
  );
}
