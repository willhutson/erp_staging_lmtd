import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Settings,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  getMyDelegationProfile,
  getMyDelegations,
  getPotentialDelegates,
  getOrganizationDelegationOverview,
  getAllActiveDelegations,
} from "@/modules/delegation/actions";
import { format, formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DelegationPage() {
  const user = await getStudioUser();

  let profile = null;
  let delegations = { asDelegator: [], asDelegate: [] };
  let potentialDelegates: Awaited<ReturnType<typeof getPotentialDelegates>> = [];
  let overview = null;
  let allDelegations: Awaited<ReturnType<typeof getAllActiveDelegations>> = [];
  let dbError = false;

  try {
    [profile, delegations, potentialDelegates, overview, allDelegations] = await Promise.all([
      getMyDelegationProfile(),
      getMyDelegations(),
      getPotentialDelegates(),
      getOrganizationDelegationOverview(),
      getAllActiveDelegations(),
    ]);
  } catch (error) {
    console.error("Delegation data fetch error:", error);
    dbError = true;
  }

  const isAdmin = ["ADMIN", "LEADERSHIP"].includes(user.permissionLevel);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/team"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Delegation of Authority</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure who covers for you when you're away
          </p>
        </div>
      </div>

      {/* Database Setup Required */}
      {dbError && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  Database Setup Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  The delegation tables haven't been created yet. Run{" "}
                  <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                    prisma db push
                  </code>{" "}
                  to set up the database schema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Overview */}
      {isAdmin && overview && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Delegation Profiles
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalProfiles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Delegations
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overview.activeDelegations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{overview.pendingDelegations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                On Leave
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{overview.usersOnLeave}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Delegation Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              My Delegation Profile
            </CardTitle>
            <CardDescription>
              Configure who handles your work when you're away
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Primary Delegate
                  </p>
                  {profile.primaryDelegate ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {profile.primaryDelegate.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{profile.primaryDelegate.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.primaryDelegate.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No delegate configured</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Scope
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      Clients: {(profile.scope as { clients: string | string[] }).clients === "all" ? "All" : "Selected"}
                    </Badge>
                    <Badge variant="outline">
                      Brief Types: {(profile.scope as { briefTypes: string | string[] }).briefTypes === "all" ? "All" : "Selected"}
                    </Badge>
                    <Badge variant="secondary">
                      {(profile.scope as { authority: string }).authority.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full" disabled>
                  Edit Profile (Coming Soon)
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No Profile Configured</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up your delegation profile to ensure coverage when you're away
                </p>
                <Button disabled>
                  Create Profile (Coming Soon)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Active Delegations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              My Delegations
            </CardTitle>
            <CardDescription>
              Active and pending delegation periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            {delegations.asDelegator.length > 0 || delegations.asDelegate.length > 0 ? (
              <div className="space-y-4">
                {delegations.asDelegator.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      I'm delegating to
                    </p>
                    <div className="space-y-2">
                      {delegations.asDelegator.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{d.delegateName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(d.startDate), "MMM d")} - {format(new Date(d.endDate), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant={d.status === "ACTIVE" ? "default" : "secondary"}>
                            {d.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {delegations.asDelegate.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      I'm covering for
                    </p>
                    <div className="space-y-2">
                      {delegations.asDelegate.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{d.delegatorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(d.startDate), "MMM d")} - {format(new Date(d.endDate), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant={d.status === "ACTIVE" ? "default" : "secondary"}>
                            {d.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p>No active delegations</p>
                <p className="text-sm mt-1">
                  Delegations are created automatically when leave is approved
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Potential Delegates */}
      {potentialDelegates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Delegates</CardTitle>
            <CardDescription>
              Team members who could cover for you based on role and department matching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {potentialDelegates.slice(0, 6).map((delegate) => (
                <div
                  key={delegate.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{delegate.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{delegate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {delegate.role} • {delegate.department}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {delegate.matchScore}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin: All Active Delegations */}
      {isAdmin && allDelegations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Active Delegations</CardTitle>
            <CardDescription>
              Organization-wide view of current delegations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allDelegations.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{d.delegator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{d.delegator.name}</p>
                        <p className="text-xs text-muted-foreground">{d.delegator.department}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{d.delegate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{d.delegate.name}</p>
                        <p className="text-xs text-muted-foreground">{d.delegate.department}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={d.status === "ACTIVE" ? "default" : "secondary"}>
                      {d.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(d.startDate), "MMM d")} - {format(new Date(d.endDate), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
