"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createContact, updateContact } from "../actions/contact-actions";
import type { ClientContact } from "@prisma/client";

interface ContactFormProps {
  clientId: string;
  contact?: ClientContact;
  onClose: () => void;
}

export function ContactForm({ clientId, contact, onClose }: ContactFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(contact?.name || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [phone, setPhone] = useState(contact?.phone || "");
  const [jobTitle, setJobTitle] = useState(contact?.jobTitle || "");
  const [department, setDepartment] = useState(contact?.department || "");
  const [isPrimary, setIsPrimary] = useState(contact?.isPrimary || false);
  const [isDecisionMaker, setIsDecisionMaker] = useState(
    contact?.isDecisionMaker || false
  );
  const [isBillingContact, setIsBillingContact] = useState(
    contact?.isBillingContact || false
  );
  const [notes, setNotes] = useState(contact?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (contact) {
          await updateContact(contact.id, {
            name,
            email: email || undefined,
            phone: phone || undefined,
            jobTitle: jobTitle || undefined,
            department: department || undefined,
            isPrimary,
            isDecisionMaker,
            isBillingContact,
            notes: notes || undefined,
          });
        } else {
          await createContact({
            clientId,
            name,
            email: email || undefined,
            phone: phone || undefined,
            jobTitle: jobTitle || undefined,
            department: department || undefined,
            isPrimary,
            isDecisionMaker,
            isBillingContact,
            notes: notes || undefined,
          });
        }
        router.refresh();
        onClose();
      } catch (error) {
        console.error("Failed to save contact:", error);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {contact ? "Edit Contact" : "Add Contact"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., CEO, Marketing Director"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Marketing"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#52EDC7] focus:ring-[#52EDC7]"
              />
              <span className="text-sm text-gray-700">Primary contact</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDecisionMaker}
                onChange={(e) => setIsDecisionMaker(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#52EDC7] focus:ring-[#52EDC7]"
              />
              <span className="text-sm text-gray-700">Decision maker</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isBillingContact}
                onChange={(e) => setIsBillingContact(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#52EDC7] focus:ring-[#52EDC7]"
              />
              <span className="text-sm text-gray-700">Billing contact</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name}
              className="flex-1 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : contact ? "Update" : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
