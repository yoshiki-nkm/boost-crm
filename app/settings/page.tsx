"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersTab } from "@/components/settings/members-tab"
import { StatusTab } from "@/components/settings/status-tab"
import { SlackTab } from "@/components/settings/slack-tab"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">
          システムの各種設定を管理します
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">メンバー管理</TabsTrigger>
          <TabsTrigger value="status">ステータス管理</TabsTrigger>
          <TabsTrigger value="slack">Slack連携</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <MembersTab />
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <StatusTab />
        </TabsContent>

        <TabsContent value="slack" className="space-y-4">
          <SlackTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
