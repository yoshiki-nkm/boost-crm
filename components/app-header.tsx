"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
    </header>
  )
}

