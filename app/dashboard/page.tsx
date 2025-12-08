"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Customer } from "@/types/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { format, subMonths, startOfMonth, endOfMonth, differenceInMonths } from "date-fns"
import { ja } from "date-fns/locale"
import { STATUS_LABEL_MAP, CHART_COLORS, CUSTOMER_STATUSES } from "@/lib/constants"

// 月次データの型
type MonthlyData = {
  month: string // "7月"、"8月"...
  count: number
}

// ステータス分布の型
type StatusDistributionData = {
  month: string
  アプローチ中: number
  初回アポ取得済: number
  初回面談実施済: number
  提案中: number
  見送り: number
  リサイクル対象: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [newMeetingsData, setNewMeetingsData] = useState<MonthlyData[]>([])
  const [statusDistributionData, setStatusDistributionData] = useState<StatusDistributionData[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // 期間の計算（直近6ヶ月: 5ヶ月前の月初から今月末まで）
      const today = new Date()
      const fiveMonthsAgo = subMonths(today, 5)
      const startDate = startOfMonth(fiveMonthsAgo)
      const endDate = endOfMonth(today)

      // 顧客データを取得（createdAtが6ヶ月前以降のもの + updatedAtも取得）
      const { data: customers, error } = await supabase
        .from("customers")
        .select("id, createdAt, firstMeetingDate, status, updatedAt")
        .gte("createdAt", startDate.toISOString())
        .lte("createdAt", endDate.toISOString())

      if (error) throw error

      // 月のラベルを生成（5ヶ月前から今月まで）
      const months: string[] = []
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i)
        months.push(format(monthDate, "M月", { locale: ja }))
      }

      // 左グラフ用データを作成（新規面談数推移）
      processNewMeetingsData(customers || [], months, startDate, today)

      // 右グラフ用データを作成（ステータス分布推移）
      processStatusDistributionData(customers || [], months, fiveMonthsAgo, today)
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  // 新規面談数推移データを作成
  const processNewMeetingsData = (
    customers: any[],
    months: string[],
    startDate: Date,
    endDate: Date
  ) => {
    const today = new Date()

    // 各月ごとにカウント
    const monthlyCounts: { [key: string]: number } = {}
    months.forEach((month) => {
      monthlyCounts[month] = 0
    })

    customers.forEach((customer) => {
      if (!customer.firstMeetingDate) return

      const meetingDate = new Date(customer.firstMeetingDate)

      // 集計期間内かチェック
      if (meetingDate >= startDate && meetingDate <= endDate) {
        // 月を取得
        const monthLabel = format(meetingDate, "M月", { locale: ja })
        if (monthlyCounts[monthLabel] !== undefined) {
          monthlyCounts[monthLabel]++
        }
      }
    })

    // グラフ用のデータ形式に変換
    const data: MonthlyData[] = months.map((month) => ({
      month,
      count: monthlyCounts[month] || 0,
    }))

    setNewMeetingsData(data)
  }

  // ステータス分布推移データを作成
  const processStatusDistributionData = (
    customers: any[],
    months: string[],
    fiveMonthsAgo: Date,
    today: Date
  ) => {
    // 各月ごとのステータス別カウント
    const monthlyStatusCounts: {
      [month: string]: { [status: string]: number }
    } = {}

    // 定数配列から動的にステータスカウント構造を生成
    months.forEach((month) => {
      monthlyStatusCounts[month] = {}
      CUSTOMER_STATUSES.forEach((status) => {
        monthlyStatusCounts[month][status.label] = 0
      })
    })

    customers.forEach((customer) => {
      if (!customer.createdAt) return

      const createdDate = new Date(customer.createdAt)
      const monthLabel = format(createdDate, "M月", { locale: ja })

      // 受注・失注は除外
      if (customer.status === "受注" || customer.status === "失注") return

      // リサイクル判定ロジック: pendingで3ヶ月以上経過している場合はrecycleとして扱う
      let effectiveStatus = customer.status
      if (customer.status === "pending") {
        const lastActivityDate = customer.updatedAt ? new Date(customer.updatedAt) : new Date(customer.createdAt)
        const monthsSinceLastActivity = differenceInMonths(today, lastActivityDate)

        if (monthsSinceLastActivity >= 3) {
          effectiveStatus = "recycle"
        }
      }

      // ステータスを表示名に変換
      const statusLabel = STATUS_LABEL_MAP[effectiveStatus as keyof typeof STATUS_LABEL_MAP] || effectiveStatus

      // 定義されたステータスのみカウント
      if (monthlyStatusCounts[monthLabel] && monthlyStatusCounts[monthLabel][statusLabel] !== undefined) {
        monthlyStatusCounts[monthLabel][statusLabel]++
      }
    })

    // グラフ用のデータ形式に変換（定数配列から動的に生成）
    const data: StatusDistributionData[] = months.map((month) => {
      const monthData: any = { month }
      CUSTOMER_STATUSES.forEach((status) => {
        monthData[status.label] = monthlyStatusCounts[month]?.[status.label] || 0
      })
      return monthData as StatusDistributionData
    })

    setStatusDistributionData(data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          営業活動の状況を可視化します
        </p>
      </div>

      {/* グラフ */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 左グラフ: 新規面談数推移 */}
        <Card>
          <CardHeader>
            <CardTitle>新規面談数推移（過去6ヶ月）</CardTitle>
            <CardDescription>
              初回面談日ベースで月別集計
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={newMeetingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="新規面談数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 右グラフ: ステータス分布推移 */}
        <Card>
          <CardHeader>
            <CardTitle>ステータス分布（過去6ヶ月）</CardTitle>
            <CardDescription>
              ステータス別顧客数（「受注」「失注」を除外）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={statusDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                {/* CUSTOMER_STATUSES配列をmapで回してBarコンポーネントを動的に生成 */}
                {/* この順序が凡例の順序になります */}
                {CUSTOMER_STATUSES.map((status) => (
                  <Bar
                    key={status.value}
                    dataKey={status.label}
                    name={status.label}
                    stackId="a"
                    fill={status.color}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
