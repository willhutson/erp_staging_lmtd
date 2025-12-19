"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { getGoogleAuthUrl, disconnectGoogle } from "../actions/google-auth";

interface GoogleIntegrationCardProps {
  isConnected: boolean;
}

export function GoogleIntegrationCard({ isConnected }: GoogleIntegrationCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const handleConnect = () => {
    startTransition(async () => {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    });
  };

  const handleDisconnect = () => {
    startTransition(async () => {
      await disconnectGoogle();
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Google Workspace</h3>
            <p className="text-sm text-gray-500 mt-1">
              Connect Calendar, Drive, Docs, Sheets, and Slides
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                Calendar
              </span>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                Drive
              </span>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                Docs
              </span>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                Sheets
              </span>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                Slides
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Connected
              </span>
              <button
                onClick={handleDisconnect}
                disabled={isPending}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              Connect
            </button>
          )}
        </div>
      </div>

      {success === "google_connected" && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Google Workspace connected successfully!
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Failed to connect: {error.replace(/_/g, " ")}
        </div>
      )}

      {isConnected && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="font-medium text-gray-900 mb-3">Capabilities</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Create calendar events from video shoots
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Auto-create client/project folder structures
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Generate brief documents from templates
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Create project tracking spreadsheets
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Generate pitch presentations
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
