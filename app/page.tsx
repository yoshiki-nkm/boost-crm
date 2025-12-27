"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Customer, User, Counterpart, NextAction, Meeting } from "@/types/database"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CustomerDialog } from "@/components/customer-dialog"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, HelpCircle } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { ja } from "date-fns/locale"
import { STATUS_LABEL_MAP, CUSTOMER_STATUSES } from "@/lib/constants"

// 結合データの型定義
type CustomerWithRelations = Customer & {
  assignee: User | null
  counterparts: Counterpart[]
  next_actions: NextAction[]
  meetings: Meeting[]
}

// 最終活動からの経過日数を計算する関数
// 商談記録、完了アクションの中で最も新しい日付から経過日数を計算
function calculateLastActivity(
  meetings: Meeting[],
  nextActions: NextAction[],
  createdAt: string | null | undefined
): { days: number; displayText: string } {
  const dates: Date[] = []
  const today = new Date()

  // A. 最新の商談日を追加（過去の日付のみ）
  if (meetings && meetings.length > 0) {
    meetings.forEach((meeting) => {
      if (meeting.meetingDate) {
        try {
          const meetingDate = new Date(meeting.meetingDate)
          // 過去の日付のみ追加
          if (meetingDate <= today) {
            dates.push(meetingDate)
          }
        } catch {
          // 無効な日付は無視
        }
      }
    })
  }

  // B. 完了済みアクションの期限日を追加（過去の日付のみ）
  if (nextActions && nextActions.length > 0) {
    const completedActions = nextActions.filter((action) => !action.isActive)
    completedActions.forEach((action) => {
      if (action.dueDate) {
        try {
          const dueDate = new Date(action.dueDate)
          // 過去の日付のみ追加
          if (dueDate <= today) {
            dates.push(dueDate)
          }
        } catch {
          // 無効な日付は無視
        }
      }
    })
  }

  // 日付がない場合
  if (dates.length === 0) {
    return { days: 0, displayText: "-" }
  }

  // 最も新しい日付を取得
  const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  // 経過日数を計算（今日 - 活動日）
  const days = differenceInDays(new Date(), latestDate)

  // マイナスの場合は0にする（念のため）
  const actualDays = Math.max(0, days)

  // 表示テキストを生成
  let displayText = ""
  if (actualDays === 0) {
    displayText = "今日"
  } else if (actualDays === 1) {
    displayText = "1日"
  } else if (actualDays < 7) {
    displayText = `${actualDays}日`
  } else if (actualDays < 30) {
    const weeks = Math.floor(actualDays / 7)
    displayText = `${weeks}週間`
  } else if (actualDays < 365) {
    const months = Math.floor(actualDays / 30)
    displayText = `${months}ヶ月`
  } else {
    const years = Math.floor(actualDays / 365)
    displayText = `${years}年`
  }

  return { days: actualDays, displayText }
}

// 日付フォーマット関数
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-"
  try {
    return format(new Date(dateString), "M/d", { locale: ja })
  } catch {
    return "-"
  }
}

// 初回面談日を取得する関数
// meetings配列から最も古い日付を取得
function getFirstMeetingDate(meetings: Meeting[]): string {
  if (!meetings || meetings.length === 0) {
    return "-"
  }

  const validDates: Date[] = []
  meetings.forEach((meeting) => {
    if (meeting.meetingDate) {
      try {
        validDates.push(new Date(meeting.meetingDate))
      } catch {
        // 無効な日付は無視
      }
    }
  })

  if (validDates.length === 0) {
    return "-"
  }

  // 最も古い日付を取得
  const firstDate = new Date(Math.min(...validDates.map((d) => d.getTime())))
  return formatDate(firstDate.toISOString())
}

// 担当者名を取得する関数
function getAssigneeName(assignee: User | null): string {
  if (!assignee) return "-"
  const lastName = assignee.lastName || ""
  const firstName = assignee.firstName || ""
  return `${lastName} ${firstName}`.trim() || "-"
}

// すべてのアクティブなネクストアクションを取得する関数
function getActiveActions(nextActions: NextAction[]): NextAction[] {
  if (!nextActions || nextActions.length === 0) return []

  // アクティブなアクションのみフィルタリング
  const activeActions = nextActions.filter(action => action.isActive)

  // dueDateで昇順ソート（期限が近い順）
  return activeActions.sort((a, b) => {
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}

// 期限までの日数を計算し、表示テキストとスタイルを返す関数
function getDaysUntilDeadline(dueDate: string | null | undefined): {
  text: string
  className: string
} {
  if (!dueDate) {
    return { text: "-", className: "" }
  }

  try {
    const deadline = new Date(dueDate)
    const today = new Date()
    const days = differenceInDays(deadline, today)

    if (days < 0) {
      // 期限切れ
      return {
        text: `${Math.abs(days)}日超過`,
        className: "text-red-600 font-bold",
      }
    } else if (days === 0) {
      // 今日
      return {
        text: "今日",
        className: "text-orange-500 font-bold",
      }
    } else {
      // 未来
      return {
        text: `あと${days}日`,
        className: "text-green-600",
      }
    }
  } catch {
    return { text: "-", className: "" }
  }
}

// 最終更新からの経過日数のスタイルを返す関数
function getDaysSinceUpdateStyle(days: number): string {
  if (days >= 30) {
    return "bg-red-50 text-red-700 font-semibold px-2 py-1 rounded"
  }
  return ""
}

export default function Home() {
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(
    undefined
  )

  // 検索・フィルタリング用のState
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRank, setSelectedRank] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all")

  // 新規作成ボタン用
  const handleCreate = () => {
    setSelectedCustomer(undefined)
    setIsDialogOpen(true)
  }

  // 行クリック用
  const handleEdit = (customer: CustomerWithRelations) => {
    // CustomerDialogには基本のCustomer型のみ渡す
    const basicCustomer: Customer = {
      id: customer.id,
      companyName: customer.companyName,
      companyRank: customer.companyRank,
      assigneeId: customer.assigneeId,
      status: customer.status,
      proposedProducts: customer.proposedProducts,
      leadSource: customer.leadSource,
      firstContactDate: customer.firstContactDate,
      firstMeetingDate: customer.firstMeetingDate,
      nextMeetingDate: customer.nextMeetingDate,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }
    setSelectedCustomer(basicCustomer)
    setIsDialogOpen(true)
  }

  // データ取得関数（再利用可能）
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)

      // 顧客データとユーザーデータを並列取得
      const [customersResult, usersResult] = await Promise.all([
        supabase
          .from("customers")
          .select(`
            *,
            assignee:users(*),
            counterparts(*),
            next_actions(*),
            meetings(meetingDate)
          `)
          .order("createdAt", { ascending: false }),
        supabase
          .from("users")
          .select("*")
          .order("lastName", { ascending: true })
      ])

      if (customersResult.error) {
        console.error("Supabase error:", customersResult.error)
        throw customersResult.error
      }

      if (usersResult.error) {
        console.error("Supabase error:", usersResult.error)
        throw usersResult.error
      }

      setCustomers((customersResult.data || []) as CustomerWithRelations[])
      setUsers((usersResult.data || []) as User[])
      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "データの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }, [])

  // 保存成功時のコールバック
  const handleSuccess = useCallback(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // フィルタリング処理
  const filteredCustomers = customers.filter((customer) => {
    // 検索クエリによるフィルタリング（企業名またはPIC名で部分一致）
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesCompanyName = customer.companyName.toLowerCase().includes(query)
      const matchesCounterpartName = customer.counterparts.some((cp) =>
        cp.name.toLowerCase().includes(query)
      )
      if (!matchesCompanyName && !matchesCounterpartName) {
        return false
      }
    }

    // 企業ランクによるフィルタリング
    if (selectedRank !== "all" && customer.companyRank !== selectedRank) {
      return false
    }

    // ステータスによるフィルタリング
    if (selectedStatus !== "all" && customer.status !== selectedStatus) {
      return false
    }

    // BC担当者によるフィルタリング（IDで比較）
    if (selectedAssignee !== "all" && customer.assigneeId !== selectedAssignee) {
      return false
    }

    return true
  })

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">顧客一覧</h1>
          <p className="text-muted-foreground">
            顧客情報を管理します
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          新規顧客追加
        </Button>
      </div>

      {/* 検索・絞り込みツールバー */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        {/* 左側: 検索ボックス */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="企業名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 右側: フィルター */}
        <div className="flex items-center gap-2">
          <Select value={selectedRank} onValueChange={setSelectedRank}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="企業ランク" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全てのランク</SelectItem>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全てのステータス</SelectItem>
              {CUSTOMER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="担当者" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ての担当者</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.lastName} {user.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 件数表示 */}
      {!loading && !error && (
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length}件の顧客が見つかりました
          {filteredCustomers.length !== customers.length && (
            <span className="ml-2">
              （全{customers.length}件中）
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>読み込み中...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center text-destructive">
          <p>エラー: {error}</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>
            {customers.length === 0
              ? "データがありません"
              : "検索条件に一致する顧客が見つかりませんでした"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">企業名</TableHead>
                <TableHead className="text-center text-sm font-bold text-foreground whitespace-nowrap">企業ランク</TableHead>
                <TableHead className="text-center text-sm font-bold text-foreground whitespace-nowrap">PICランク</TableHead>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">PIC</TableHead>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">BC担当者</TableHead>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">ステータス</TableHead>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">リードソース</TableHead>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">初回面談</TableHead>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">次回面談</TableHead>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">アクション</TableHead>
                <TableHead className="text-sm font-bold text-foreground whitespace-nowrap">期限まで</TableHead>
                <TableHead className="text-right text-sm font-bold text-foreground whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-1 cursor-help">
                        最終活動
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        最終商談日、または完了アクションの期限日の中で、
                        <br />
                        最も新しい日付からの経過日数
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const activeActions = getActiveActions(customer.next_actions)
                const lastActivity = calculateLastActivity(
                  customer.meetings || [],
                  customer.next_actions || [],
                  customer.createdAt
                )
                const updateStyle = getDaysSinceUpdateStyle(lastActivity.days)
                const counterparts = customer.counterparts || []

                return (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleEdit(customer)}
                  >
                    <TableCell className="font-medium align-top whitespace-nowrap text-xs py-2">
                      {customer.companyName}
                    </TableCell>
                    <TableCell className="text-center align-top whitespace-nowrap text-xs py-2">
                      {customer.companyRank ? (
                        <Badge
                          variant="outline"
                          className="font-bold"
                        >
                          {customer.companyRank}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center align-top text-xs py-2 whitespace-nowrap">
                      {counterparts.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {counterparts.map((cp, idx) => (
                            <div key={idx} className="h-6 flex items-center justify-center">
                              {cp.rank ? (
                                <Badge
                                  variant="outline"
                                  className="font-bold"
                                >
                                  {cp.rank}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="align-top text-xs py-2 whitespace-nowrap">
                      {counterparts.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {counterparts.map((cp, idx) => (
                            <div key={idx} className="h-6 flex items-center">
                              {cp.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap text-xs py-2">
                      {getAssigneeName(customer.assignee)}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap text-xs py-2">
                      {customer.status ? (
                        <Badge variant="outline">
                          {STATUS_LABEL_MAP[customer.status as keyof typeof STATUS_LABEL_MAP] || customer.status}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap text-xs py-2">{customer.leadSource || "-"}</TableCell>
                    <TableCell className="align-top whitespace-nowrap text-xs py-2">
                      {getFirstMeetingDate(customer.meetings || [])}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap text-xs py-2">
                      {formatDate(customer.nextMeetingDate)}
                    </TableCell>
                    <TableCell className="max-w-[200px] align-top text-xs py-2 whitespace-nowrap">
                      {activeActions.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {activeActions.map((action, idx) => (
                            <div key={idx} className="truncate h-6 flex items-center">
                              {action.content}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="align-top text-xs py-2 whitespace-nowrap">
                      {activeActions.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {activeActions.map((action, idx) => {
                            const deadlineInfo = getDaysUntilDeadline(action.dueDate)
                            return (
                              <div key={idx} className="h-6 flex items-center">
                                <span className={deadlineInfo.className}>
                                  {deadlineInfo.text}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right align-top whitespace-nowrap text-xs py-2">
                      <span className={updateStyle}>
                        {lastActivity.displayText}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
        onSuccess={handleSuccess}
      />
      </div>
    </TooltipProvider>
  )
}
