import { PageShell } from "@/components/ltd/patterns/page-shell"
import { KpiTile } from "@/components/ltd/agency/kpi-tile"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <PageShell
      title="Reports"
      actions={
        <LtdButton>
          <Download className="h-4 w-4" />
          Export Report
        </LtdButton>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            label="Total Revenue"
            value="$142,580"
            change={12.5}
            trend="up"
          />
          <KpiTile label="Active Clients" value="24" change={8.3} trend="up" />
          <KpiTile label="Campaign ROI" value="340%" change={15.2} trend="up" />
          <KpiTile
            label="Avg Engagement"
            value="4.2%"
            change={-2.1}
            trend="down"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
              <CardDescription>Ranked by ROI in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Spring Launch 2024", client: "TechCorp", roi: "420%", spend: "$12,500" },
                  { name: "Holiday Campaign", client: "RetailCo", roi: "385%", spend: "$18,200" },
                  { name: "Product Launch", client: "StartupXYZ", roi: "340%", spend: "$8,900" },
                ].map((campaign, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground">{campaign.client}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600 dark:text-green-400">{campaign.roi}</div>
                      <div className="text-sm text-muted-foreground">{campaign.spend}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Activity</CardTitle>
              <CardDescription>Most active clients this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "TechCorp", campaigns: 5, spend: "$42,500", status: "active" },
                  { name: "RetailCo", campaigns: 3, spend: "$28,900", status: "active" },
                  { name: "StartupXYZ", campaigns: 4, spend: "$31,200", status: "active" },
                ].map((client, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.campaigns} campaigns</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{client.spend}</div>
                      <div className="text-xs text-muted-foreground capitalize">{client.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-2">
              {[65, 72, 68, 85, 92, 100].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-ltd-primary rounded-t-md transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-muted-foreground">{["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
