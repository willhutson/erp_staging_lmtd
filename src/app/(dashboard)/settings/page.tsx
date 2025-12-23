"use client"

import { useState, useEffect } from "react"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import {
  setDensity as setDensityMode,
  getDensity,
  type DensityMode,
} from "@/lib/design/modes"

export default function SettingsPage() {
  const [density, setDensity] = useState<DensityMode>("standard")

  useEffect(() => {
    setDensity(getDensity())
  }, [])

  const handleDensityChange = (mode: DensityMode) => {
    setDensity(mode)
    setDensityMode(mode)
  }

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    approvals: true,
    mentions: true,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">General</h2>
        <LtdButton>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </LtdButton>
      </div>

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
    </div>
  )
}
