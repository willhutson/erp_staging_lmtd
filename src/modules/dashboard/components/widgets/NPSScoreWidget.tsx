import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";

export async function NPSScoreWidget() {
  const session = await auth();
  if (!session?.user) return null;

  // Get this year's NPS responses
  const currentYear = new Date().getFullYear();

  const responses = await db.nPSResponse.findMany({
    where: {
      survey: {
        organizationId: session.user.organizationId,
        year: currentYear,
      },
    },
    select: {
      score: true,
      category: true,
    },
  });

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-3xl font-bold text-gray-300">--</p>
        <p className="text-xs text-gray-400 mt-1">No responses</p>
        <Link
          href="/nps"
          className="text-xs text-[#52EDC7] hover:text-[#1BA098] mt-2"
        >
          Send survey
        </Link>
      </div>
    );
  }

  const promoters = responses.filter((r) => r.category === "PROMOTER").length;
  const detractors = responses.filter((r) => r.category === "DETRACTOR").length;
  const npsScore = Math.round(
    ((promoters - detractors) / responses.length) * 100
  );

  const scoreColor =
    npsScore >= 50
      ? "text-green-600"
      : npsScore >= 0
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <p className={`text-3xl font-bold ${scoreColor}`}>{npsScore}</p>
      <p className="text-xs text-gray-400 mt-1">NPS Score</p>
      <p className="text-[10px] text-gray-400 mt-1">
        {responses.length} responses
      </p>
      <Link
        href="/nps"
        className="text-xs text-[#52EDC7] hover:text-[#1BA098] mt-2"
      >
        View details
      </Link>
    </div>
  );
}
