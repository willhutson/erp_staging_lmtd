"use client"

import { useState } from "react"
import { setDensity, setSurface, setDir, type DensityMode, type SurfaceMode } from "@/lib/design/modes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export default function DesignModesDemo() {
  const [density, setDensityState] = useState<DensityMode>("standard")
  const [surface, setSurfaceState] = useState<SurfaceMode>("internal")
  const [direction, setDirectionState] = useState<"ltr" | "rtl">("ltr")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [focusDemo, setFocusDemo] = useState(false)

  const handleDensityChange = (mode: DensityMode) => {
    setDensity(mode)
    setDensityState(mode)
  }

  const handleSurfaceChange = (mode: SurfaceMode) => {
    setSurface(mode)
    setSurfaceState(mode)
  }

  const handleDirectionChange = (dir: "ltr" | "rtl") => {
    setDir(dir)
    setDirectionState(dir)
  }

  return (
    <div className="min-h-screen bg-ltd-surface-1 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-ltd-text-1">LMTD Design System Demo</h1>
          <p className="text-lg text-ltd-text-2">
            Token-based design system with density modes, surface modes, and RTL support
          </p>
        </div>

        {/* Mode Controls */}
        <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
          <h2 className="text-xl font-semibold text-ltd-text-1 mb-6">Design Mode Controls</h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Density Mode */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-ltd-text-1 mb-2">Density Mode</h3>
                <p className="text-sm text-ltd-text-2 mb-4">Controls spacing, sizing, and visual density</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleDensityChange("compact")}
                  variant={density === "compact" ? "default" : "outline"}
                  className="justify-start"
                >
                  Compact
                </Button>
                <Button
                  onClick={() => handleDensityChange("standard")}
                  variant={density === "standard" ? "default" : "outline"}
                  className="justify-start"
                >
                  Standard
                </Button>
                <Button
                  onClick={() => handleDensityChange("comfortable")}
                  variant={density === "comfortable" ? "default" : "outline"}
                  className="justify-start"
                >
                  Comfortable
                </Button>
              </div>
            </div>

            {/* Surface Mode */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-ltd-text-1 mb-2">Surface Mode</h3>
                <p className="text-sm text-ltd-text-2 mb-4">Internal (bright) or Client (softer) surfaces</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleSurfaceChange("internal")}
                  variant={surface === "internal" ? "default" : "outline"}
                  className="justify-start"
                >
                  Internal
                </Button>
                <Button
                  onClick={() => handleSurfaceChange("client")}
                  variant={surface === "client" ? "default" : "outline"}
                  className="justify-start"
                >
                  Client
                </Button>
              </div>
            </div>

            {/* Direction Mode */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-ltd-text-1 mb-2">Text Direction</h3>
                <p className="text-sm text-ltd-text-2 mb-4">Left-to-right or right-to-left rendering</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleDirectionChange("ltr")}
                  variant={direction === "ltr" ? "default" : "outline"}
                  className="justify-start"
                >
                  LTR (Left to Right)
                </Button>
                <Button
                  onClick={() => handleDirectionChange("rtl")}
                  variant={direction === "rtl" ? "default" : "outline"}
                  className="justify-start"
                >
                  RTL (Right to Left)
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Component Examples */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Form Elements */}
          <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">Form Elements</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  className="h-[var(--ltd-density-control-height)] px-[var(--ltd-density-control-paddingX)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-[var(--ltd-density-control-height)] px-[var(--ltd-density-control-paddingX)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications" className="text-sm">
                  Enable notifications
                </Label>
              </div>
              <Button className="w-full h-[var(--ltd-density-control-height)]">Submit Form</Button>
            </div>
          </Card>

          {/* Status Badges */}
          <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">Status Indicators</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-ltd-success text-white">Success</Badge>
                <Badge className="bg-ltd-warning text-ltd-text-1">Warning</Badge>
                <Badge className="bg-ltd-error text-white">Error</Badge>
                <Badge className="bg-ltd-info text-white">Info</Badge>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-ltd-success-bg border border-ltd-success rounded-[var(--ltd-radius-sm)] text-sm">
                  Success: Operation completed successfully
                </div>
                <div className="p-3 bg-ltd-warning-bg border border-ltd-warning rounded-[var(--ltd-radius-sm)] text-sm">
                  Warning: Please review your input
                </div>
                <div className="p-3 bg-ltd-error-bg border border-ltd-error rounded-[var(--ltd-radius-sm)] text-sm">
                  Error: Something went wrong
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Focus Visible Demo */}
        <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
          <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">Focus Visible States (Keyboard Navigation)</h3>
          <p className="text-sm text-ltd-text-2 mb-4">
            Press Tab to navigate through these elements. Focus rings only appear with keyboard navigation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary Button</Button>
            <Button variant="outline">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Input placeholder="Focusable input" className="max-w-xs" />
            <Switch />
          </div>
        </Card>

        {/* Table Demo */}
        <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)] overflow-hidden">
          <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">Table Pattern</h3>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead className="bg-ltd-table-header border-b border-ltd-table-border">
                <tr>
                  <th className="px-6 py-3 text-start text-sm font-medium text-ltd-text-1">Campaign</th>
                  <th className="px-6 py-3 text-start text-sm font-medium text-ltd-text-1">Status</th>
                  <th className="px-6 py-3 text-end text-sm font-medium text-ltd-text-1">Spend</th>
                  <th className="px-6 py-3 text-end text-sm font-medium text-ltd-text-1">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ltd-table-border">
                {[
                  { name: "Summer Campaign", status: "Active", spend: "$12,450", roas: "3.2x" },
                  { name: "Product Launch", status: "Draft", spend: "$0", roas: "—" },
                  { name: "Brand Awareness", status: "Completed", spend: "$45,200", roas: "2.8x" },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="h-[var(--ltd-density-table-row)] hover:bg-ltd-table-row-hover transition-colors"
                  >
                    <td className="px-6 text-sm font-medium text-ltd-text-1">{row.name}</td>
                    <td className="px-6">
                      <Badge variant="outline" className="text-xs">
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 text-end text-sm text-ltd-text-1 tabular-nums">{row.spend}</td>
                    <td className="px-6 text-end text-sm text-ltd-text-1 tabular-nums">{row.roas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Token Reference */}
        <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
          <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">Current Mode Configuration</h3>
          <div className="grid gap-4 md:grid-cols-3 font-mono text-sm">
            <div>
              <div className="text-ltd-text-2 mb-1">Density</div>
              <div className="font-semibold text-ltd-text-1">{density}</div>
            </div>
            <div>
              <div className="text-ltd-text-2 mb-1">Surface</div>
              <div className="font-semibold text-ltd-text-1">{surface}</div>
            </div>
            <div>
              <div className="text-ltd-text-2 mb-1">Direction</div>
              <div className="font-semibold text-ltd-text-1">{direction}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
