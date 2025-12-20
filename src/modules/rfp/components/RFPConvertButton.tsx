"use client";

import { useTransition } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { convertRfpToClient } from "@/modules/crm/actions/client-actions";
import { useRouter } from "next/navigation";

interface RFPConvertButtonProps {
  rfpId: string;
}

export function RFPConvertButton({ rfpId }: RFPConvertButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConvert = () => {
    startTransition(async () => {
      try {
        const client = await convertRfpToClient(rfpId);
        router.push(`/clients/${client.id}`);
      } catch (error) {
        console.error("Failed to convert RFP:", error);
      }
    });
  };

  return (
    <button
      onClick={handleConvert}
      disabled={isPending}
      className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#52EDC7] text-gray-900 rounded hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <UserPlus className="w-3 h-3" />
      )}
      Convert to Client
    </button>
  );
}
