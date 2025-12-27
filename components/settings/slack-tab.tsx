"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

const STORAGE_KEY = "boost_crm_slack_url"

export function SlackTab() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null)

  // ページロード時にlocalStorageから読み込み
  useEffect(() => {
    const savedUrl = localStorage.getItem(STORAGE_KEY)
    if (savedUrl) {
      setWebhookUrl(savedUrl)
    }
  }, [])

  const handleSave = () => {
    try {
      setSaving(true)
      setSaveStatus(null)

      // バリデーション
      if (webhookUrl.trim() && !webhookUrl.startsWith("https://hooks.slack.com/")) {
        alert("有効なSlack Webhook URLを入力してください（https://hooks.slack.com/ で始まる必要があります）")
        return
      }

      // localStorageに保存
      if (webhookUrl.trim()) {
        localStorage.setItem(STORAGE_KEY, webhookUrl.trim())
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }

      setSaveStatus("success")

      // 3秒後にステータスをクリア
      setTimeout(() => {
        setSaveStatus(null)
      }, 3000)
    } catch (error) {
      console.error("Error saving Slack URL:", error)
      setSaveStatus("error")
      alert("保存に失敗しました: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!webhookUrl.trim()) {
      alert("Webhook URLを入力してください")
      return
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "🚀 Boost CRM テスト通知\n\nSlack連携が正常に動作しています！",
        }),
      })

      if (response.ok) {
        alert("✅ テスト通知を送信しました。Slackを確認してください。")
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      alert("❌ テスト通知の送信に失敗しました: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Slack連携</h2>
        <p className="text-sm text-muted-foreground">
          Slack通知機能の設定
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incoming Webhook URL</CardTitle>
          <CardDescription>
            SlackのIncoming Webhook URLを設定すると、重要なイベントをSlackに通知できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Slackアプリの設定画面から「Incoming Webhooks」を有効にして、URLを取得してください。
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : "設定を保存"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!webhookUrl.trim()}
            >
              テスト通知を送信
            </Button>
          </div>

          {saveStatus === "success" && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                設定を保存しました
              </AlertDescription>
            </Alert>
          )}

          {saveStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                保存に失敗しました
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook URLの取得方法</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="font-semibold">1. Slackアプリの作成</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
              <li><a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://api.slack.com/apps</a> にアクセス</li>
              <li>「Create New App」をクリック</li>
              <li>「From scratch」を選択</li>
              <li>アプリ名を入力（例: Boost CRM）</li>
              <li>ワークスペースを選択</li>
            </ul>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">2. Incoming Webhooksの有効化</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
              <li>左メニューから「Incoming Webhooks」を選択</li>
              <li>「Activate Incoming Webhooks」をONにする</li>
              <li>「Add New Webhook to Workspace」をクリック</li>
              <li>通知を投稿するチャンネルを選択</li>
              <li>表示されたWebhook URLをコピー</li>
            </ul>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">3. URLを設定</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
              <li>コピーしたWebhook URLを上記のフォームに貼り付け</li>
              <li>「設定を保存」をクリック</li>
              <li>「テスト通知を送信」で動作確認</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>通知されるイベント</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>新規顧客の登録</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>重要なステータス変更（提案中→受注、など）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>ネクストアクションの期限切れ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>長期間活動のない顧客のリマインド</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            ※ 通知機能は今後のアップデートで実装予定です
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
