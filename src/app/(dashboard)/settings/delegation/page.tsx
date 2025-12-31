import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getMyDelegationProfile,
  getMyDelegations,
  getPotentialDelegates,
  getActiveDelegationsForMe,
} from "@/modules/delegation/actions";
import { DelegationSettingsView } from "./DelegationSettingsView";

export default async function DelegationSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [profile, delegations, potentialDelegates, coveringFor] =
    await Promise.all([
      getMyDelegationProfile(),
      getMyDelegations(),
      getPotentialDelegates(),
      getActiveDelegationsForMe(),
    ]);

  return (
    <DelegationSettingsView
      currentProfile={profile}
      delegations={delegations}
      potentialDelegates={potentialDelegates}
      coveringFor={coveringFor}
    />
  );
}
