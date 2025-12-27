"use client"

import { CUSTOMER_STATUSES } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StatusTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">ステータス管理</h2>
        <p className="text-sm text-muted-foreground">
          現在定義されているステータスの一覧
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ステータス定義</CardTitle>
          <CardDescription>
            現在、以下のステータスが定義されています。これらは `lib/constants.ts` で管理されています。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CUSTOMER_STATUSES.map((status, index) => (
              <div
                key={status.value}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm" style={{ backgroundColor: status.color }}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{status.label}</p>
                    <p className="text-xs text-muted-foreground">
                      値: <code className="px-1.5 py-0.5 bg-muted rounded text-xs">{status.value}</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-xs"
                    style={{
                      backgroundColor: status.color + "20",
                      borderColor: status.color,
                      color: status.color,
                    }}
                  >
                    {status.color}
                  </Badge>
                  <div
                    className="w-8 h-8 rounded border-2"
                    style={{ backgroundColor: status.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              <strong>注意:</strong> ステータスの追加・編集・削除は <code>lib/constants.ts</code> ファイルで行ってください。
              変更後は自動的にシステム全体に反映されます。
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
