import { redirect } from "next/navigation";
import { verifyToken } from "../actions";
import Link from "next/link";
import { XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <ErrorPage
        title="Invalid Link"
        message="This login link is invalid or has expired."
      />
    );
  }

  const result = await verifyToken(token);

  if (result.success) {
    // Redirect to portal dashboard
    redirect("/portal/dashboard");
  }

  return (
    <ErrorPage
      title="Unable to Sign In"
      message={result.error || "This login link is invalid or has expired."}
    />
  );
}

function ErrorPage({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 mb-6">{message}</p>
          <Link
            href="/portal/auth"
            className="inline-block px-6 py-3 bg-[#52EDC7] text-gray-900 font-semibold rounded-lg hover:bg-[#3dd4b0] transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    </div>
  );
}
