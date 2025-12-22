"use client"

import { useState, useEffect } from "react"
import { PageShell } from "@/components/ltd/patterns/page-shell"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, User, Palette, Bell, Shield } from "lucide-react"
import {
  setDensity as setDensityMode,
  setSurface as setSurfaceMode,
  getDensity,
  getSurface,
  type DensityMode,
  type SurfaceMode
} from "@/lib/design/modes"

export default function SettingsPage() {
  const [density, setDensity] = useState<DensityMode>("standard")
  const [surface, setSurface] = useState<SurfaceMode>("internal")

  useEffect(() => {
    setDensity(getDensity())
    setSurface(getSurface())
  }, [])

  const handleDensityChange = (mode: DensityMode) => {
    setDensity(mode)
    setDensityMode(mode)
  }

  const handleSurfaceChange = (mode: SurfaceMode) => {
    setSurface(mode)
    setSurfaceMode(mode)
  }
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    approvals: true,
    mentions: true,
  })

  return (
    <PageShell
      title="Settings"
      actions={
        <LtdButton>
          <Save className="h-4 w-4" />
          Save Changes
        </LtdButton>
      }
    >
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Density</CardTitle>
              <CardDescription>Control how much information is displayed in tables and lists</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact</Label>
                  <p className="text-sm text-muted-foreground">Show more data in less space</p>
                </div>
                <Switch
                  checked={density === "compact"}
                  onCheckedChange={(checked) => checked && handleDensityChange("compact")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Standard (Default)</Label>
                  <p className="text-sm text-muted-foreground">Balanced information density</p>
                </div>
                <Switch
                  checked={density === "standard"}
                  onCheckedChange={(checked) => checked && handleDensityChange("standard")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comfortable</Label>
                  <p className="text-sm text-muted-foreground">More spacing for easier reading</p>
                </div>
                <Switch
                  checked={density === "comfortable"}
                  onCheckedChange={(checked) => checked && handleDensityChange("comfortable")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Surface Style</CardTitle>
              <CardDescription>Choose how components and cards are displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Internal (Flat)</Label>
                  <p className="text-sm text-muted-foreground">Minimal borders and shadows</p>
                </div>
                <Switch
                  checked={surface === "internal"}
                  onCheckedChange={(checked) => checked && handleSurfaceChange("internal")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Client (Elevated)</Label>
                  <p className="text-sm text-muted-foreground">Cards with shadows and depth</p>
                </div>
                <Switch checked={surface === "client"} onCheckedChange={(checked) => checked && handleSurfaceChange("client")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Approval Requests</Label>
                  <p className="text-sm text-muted-foreground">When items need your approval</p>
                </div>
                <Switch
                  checked={notifications.approvals}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, approvals: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mentions</Label>
                  <p className="text-sm text-muted-foreground">When someone mentions you</p>
                </div>
                <Switch
                  checked={notifications.mentions}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, mentions: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Account management features coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Security settings coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
