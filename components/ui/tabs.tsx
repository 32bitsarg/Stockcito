"use client"

import * as React from "react"
import { Tabs as ArkTabs } from "@ark-ui/react/tabs"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  React.ComponentRef<typeof ArkTabs.Root>,
  React.ComponentPropsWithoutRef<typeof ArkTabs.Root>
>(({ className, ...props }, ref) => (
  <ArkTabs.Root
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  React.ComponentRef<typeof ArkTabs.List>,
  React.ComponentPropsWithoutRef<typeof ArkTabs.List>
>(({ className, ...props }, ref) => (
  <ArkTabs.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof ArkTabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof ArkTabs.Trigger>
>(({ className, ...props }, ref) => (
  <ArkTabs.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-background data-[selected]:text-foreground data-[selected]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof ArkTabs.Content>,
  React.ComponentPropsWithoutRef<typeof ArkTabs.Content>
>(({ className, ...props }, ref) => (
  <ArkTabs.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
