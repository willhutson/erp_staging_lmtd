"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Tab {
  value: string
  label: string
}

interface LtdTabsProps {
  defaultValue: string
  tabs: Tab[]
  children: React.ReactNode
  className?: string
}

export function LtdTabs({ defaultValue, tabs, children, className }: LtdTabsProps) {
  const childrenArray = React.Children.toArray(children)

  return (
    <Tabs defaultValue={defaultValue} className={cn("space-y-4", className)}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => {
        const content = childrenArray.find((child) => {
          if (React.isValidElement(child)) {
            return child.props["data-tab"] === tab.value
          }
          return false
        })

        return (
          <TabsContent key={tab.value} value={tab.value}>
            {content}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
