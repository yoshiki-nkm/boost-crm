"use client"

import * as React from "react"
import type { Customer, Counterpart, NextAction, User, Meeting } from "@/types/database"
import { supabase } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Plus, Check, Link, Calendar, ChevronDown, ChevronUp, Pencil, X, Save, MessageCircle, CheckCircle2 } from "lucide-react"
import { CUSTOMER_STATUSES } from "@/lib/constants"

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
  onSuccess?: () => void
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDialogProps) {
  const [companyName, setCompanyName] = React.useState(
    customer?.companyName || ""
  )
  const [companyRank, setCompanyRank] = React.useState(
    customer?.companyRank || ""
  )
  const [status, setStatus] = React.useState(customer?.status || "")
  const [leadSource, setLeadSource] = React.useState(
    customer?.leadSource || ""
  )
  const [assigneeId, setAssigneeId] = React.useState(
    customer?.assigneeId || "unassigned"
  )
  const [saving, setSaving] = React.useState(false)

  // メンバーリスト
  const [users, setUsers] = React.useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = React.useState(false)

  // カウンターパート関連の状態
  const [counterparts, setCounterparts] = React.useState<Counterpart[]>([])
  const [loadingCounterparts, setLoadingCounterparts] = React.useState(false)
  const [newCounterpart, setNewCounterpart] = React.useState({
    name: "",
    department: "",
    position: "",
    rank: "" as "A" | "B" | "C" | "",
  })

  // ネクストアクション関連の状態
  const [nextActions, setNextActions] = React.useState<NextAction[]>([])
  const [loadingNextActions, setLoadingNextActions] = React.useState(false)
  const [newNextAction, setNewNextAction] = React.useState({
    content: "",
    dueDate: new Date().toISOString().split("T")[0], // 今日の日付（YYYY-MM-DD）
  })

  // 商談記録関連の状態
  const [meetings, setMeetings] = React.useState<Meeting[]>([])
  const [loadingMeetings, setLoadingMeetings] = React.useState(false)
  const [newMeeting, setNewMeeting] = React.useState({
    meetingDate: new Date().toISOString().split("T")[0],
    minutes: "",
    googleDriveLink: "",
    circleBackLink: "",
    recorderId: "",
  })
  const [expandedMeetingId, setExpandedMeetingId] = React.useState<string | null>(null)
  const [editingMeetingId, setEditingMeetingId] = React.useState<string | null>(null)
  const [editingMeetingData, setEditingMeetingData] = React.useState({
    meetingDate: "",
    minutes: "",
    googleDriveLink: "",
    circleBackLink: "",
    recorderId: "",
  })

  // アクション履歴関連の状態
  type TimelineItem = {
    id: string
    type: "meeting" | "action"
    date: string
    content: string
    recorderId?: string | null
    assigneeId?: string | null
  }
  const [timeline, setTimeline] = React.useState<TimelineItem[]>([])
  const [loadingTimeline, setLoadingTimeline] = React.useState(false)

  // メンバーリストを取得
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("lastName", { ascending: true })

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // ダイアログが開かれたらメンバーリストを取得
  React.useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  // customerが変更されたら、フォームの値を更新
  React.useEffect(() => {
    if (customer) {
      setCompanyName(customer.companyName || "")
      setCompanyRank(customer.companyRank || "")
      setStatus(customer.status || "")
      setLeadSource(customer.leadSource || "")
      setAssigneeId(customer.assigneeId || "unassigned")
      // カウンターパートデータを取得
      fetchCounterparts()
      // ネクストアクションデータを取得
      fetchNextActions()
      // 商談記録データを取得
      fetchMeetings()
      // アクション履歴データを取得
      fetchTimelineHistory()
    } else {
      // 新規作成時はフォームをクリア
      setCompanyName("")
      setCompanyRank("")
      setStatus("")
      setLeadSource("")
      setAssigneeId("unassigned")
      setCounterparts([])
      setNextActions([])
      setMeetings([])
      setTimeline([])
    }
  }, [customer])

  // カウンターパートデータを取得
  const fetchCounterparts = async () => {
    if (!customer?.id) return

    try {
      setLoadingCounterparts(true)
      const { data, error } = await supabase
        .from("counterparts")
        .select("*")
        .eq("customerId", customer.id)
        .order("name", { ascending: true })

      if (error) throw error

      setCounterparts(data || [])
    } catch (error) {
      console.error("カウンターパート取得エラー:", error)
      alert("カウンターパートの取得に失敗しました")
    } finally {
      setLoadingCounterparts(false)
    }
  }

  // カウンターパートを追加
  const handleAddCounterpart = async () => {
    if (!customer?.id) return
    if (!newCounterpart.name.trim()) {
      alert("氏名は必須です")
      return
    }

    try {
      const { error } = await supabase.from("counterparts").insert({
        customerId: customer.id,
        name: newCounterpart.name.trim(),
        department: newCounterpart.department.trim() || null,
        position: newCounterpart.position.trim() || null,
        rank: newCounterpart.rank || null,
      })

      if (error) throw error

      // フォームをクリア
      setNewCounterpart({
        name: "",
        department: "",
        position: "",
        rank: "",
      })

      // リストを更新
      fetchCounterparts()
    } catch (error) {
      console.error("カウンターパート追加エラー:", error)
      alert("カウンターパートの追加に失敗しました")
    }
  }

  // カウンターパートを削除
  const handleDeleteCounterpart = async (id: string) => {
    if (!confirm("このカウンターパートを削除しますか？")) return

    try {
      const { error } = await supabase
        .from("counterparts")
        .delete()
        .eq("id", id)

      if (error) throw error

      // リストを更新
      fetchCounterparts()
    } catch (error) {
      console.error("カウンターパート削除エラー:", error)
      alert("カウンターパートの削除に失敗しました")
    }
  }

  // ネクストアクションデータを取得
  const fetchNextActions = async () => {
    if (!customer?.id) return

    try {
      setLoadingNextActions(true)
      const { data, error } = await supabase
        .from("next_actions")
        .select("*")
        .eq("customerId", customer.id)
        .eq("isActive", true) // アクティブなアクションのみ
        .order("dueDate", { ascending: true, nullsFirst: false })

      if (error) throw error

      setNextActions(data || [])
    } catch (error) {
      console.error("ネクストアクション取得エラー:", error)
      alert("ネクストアクションの取得に失敗しました")
    } finally {
      setLoadingNextActions(false)
    }
  }

  // ネクストアクションを追加
  const handleAddNextAction = async () => {
    if (!customer?.id) return
    if (!newNextAction.content.trim()) {
      alert("内容は必須です")
      return
    }

    try {
      const { error } = await supabase.from("next_actions").insert({
        customerId: customer.id,
        content: newNextAction.content.trim(),
        dueDate: newNextAction.dueDate || null,
        setDate: new Date().toISOString(),
        isActive: true,
      })

      if (error) throw error

      // フォームをクリア
      setNewNextAction({
        content: "",
        dueDate: new Date().toISOString().split("T")[0],
      })

      // リストを更新
      fetchNextActions()
    } catch (error) {
      console.error("ネクストアクション追加エラー:", error)
      alert("ネクストアクションの追加に失敗しました")
    }
  }

  // ネクストアクションを完了（削除）
  const handleCompleteNextAction = async (id: string) => {
    if (!confirm("このアクションを完了しますか？")) return

    try {
      // isActiveをfalseに更新（履歴として残す）
      const { error } = await supabase
        .from("next_actions")
        .update({ isActive: false })
        .eq("id", id)

      if (error) throw error

      // リストを更新
      fetchNextActions()
    } catch (error) {
      console.error("ネクストアクション完了エラー:", error)
      alert("ネクストアクションの完了に失敗しました")
    }
  }

  // 商談記録データを取得
  const fetchMeetings = async () => {
    if (!customer?.id) return

    try {
      setLoadingMeetings(true)
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("customerId", customer.id)
        .order("meetingDate", { ascending: false })

      if (error) throw error

      setMeetings(data || [])
    } catch (error) {
      console.error("商談記録取得エラー:", error)
      alert("商談記録の取得に失敗しました")
    } finally {
      setLoadingMeetings(false)
    }
  }

  // 商談記録を追加
  const handleAddMeeting = async () => {
    if (!customer?.id) return
    if (!newMeeting.meetingDate) {
      alert("商談日は必須です")
      return
    }

    try {
      const { error } = await supabase.from("meetings").insert({
        customerId: customer.id,
        meetingDate: newMeeting.meetingDate,
        minutes: newMeeting.minutes.trim() || null,
        googleDriveLink: newMeeting.googleDriveLink.trim() || null,
        circleBackLink: newMeeting.circleBackLink.trim() || null,
        recorderId: newMeeting.recorderId === "unassigned" ? null : newMeeting.recorderId || null,
      })

      if (error) throw error

      // フォームをクリア
      setNewMeeting({
        meetingDate: new Date().toISOString().split("T")[0],
        minutes: "",
        googleDriveLink: "",
        circleBackLink: "",
        recorderId: assigneeId || "unassigned",
      })

      // リストを更新
      fetchMeetings()
    } catch (error) {
      console.error("商談記録追加エラー:", error)
      alert("商談記録の追加に失敗しました")
    }
  }

  // 商談記録を削除
  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("この商談記録を削除しますか？")) return

    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id)

      if (error) throw error

      // リストを更新
      fetchMeetings()
    } catch (error) {
      console.error("商談記録削除エラー:", error)
      alert("商談記録の削除に失敗しました")
    }
  }

  // 商談記録の編集を開始
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeetingId(meeting.id)
    setEditingMeetingData({
      meetingDate: meeting.meetingDate,
      minutes: meeting.minutes || "",
      googleDriveLink: meeting.googleDriveLink || "",
      circleBackLink: meeting.circleBackLink || "",
      recorderId: meeting.recorderId || "unassigned",
    })
    // 編集モードに入ったら展開状態をクリア
    setExpandedMeetingId(null)
  }

  // 商談記録の編集をキャンセル
  const handleCancelEditMeeting = () => {
    setEditingMeetingId(null)
    setEditingMeetingData({
      meetingDate: "",
      minutes: "",
      googleDriveLink: "",
      circleBackLink: "",
      recorderId: "",
    })
  }

  // 商談記録を更新
  const handleUpdateMeeting = async () => {
    if (!editingMeetingId) return
    if (!editingMeetingData.meetingDate) {
      alert("商談日は必須です")
      return
    }

    try {
      const { error } = await supabase
        .from("meetings")
        .update({
          meetingDate: editingMeetingData.meetingDate,
          minutes: editingMeetingData.minutes.trim() || null,
          googleDriveLink: editingMeetingData.googleDriveLink.trim() || null,
          circleBackLink: editingMeetingData.circleBackLink.trim() || null,
          recorderId: editingMeetingData.recorderId === "unassigned" ? null : editingMeetingData.recorderId || null,
        })
        .eq("id", editingMeetingId)

      if (error) throw error

      // 編集モードを終了
      handleCancelEditMeeting()

      // リストを更新
      fetchMeetings()
    } catch (error) {
      console.error("商談記録更新エラー:", error)
      alert("商談記録の更新に失敗しました")
    }
  }

  // 記録者の名前を取得
  const getRecorderName = (recorderId: string | null) => {
    if (!recorderId) return "未設定"
    const user = users.find((u) => u.id === recorderId)
    return user ? `${user.lastName} ${user.firstName}` : "不明"
  }

  // アクション履歴（タイムライン）データを取得
  const fetchTimelineHistory = async () => {
    if (!customer?.id) return

    try {
      setLoadingTimeline(true)

      // 商談記録を取得
      const { data: meetingsData, error: meetingsError } = await supabase
        .from("meetings")
        .select("*")
        .eq("customerId", customer.id)

      if (meetingsError) throw meetingsError

      // 完了済みアクションを取得
      const { data: actionsData, error: actionsError } = await supabase
        .from("next_actions")
        .select("*")
        .eq("customerId", customer.id)
        .eq("isActive", false)

      if (actionsError) throw actionsError

      // タイムラインアイテムに変換
      const timelineItems: TimelineItem[] = []

      // 商談記録を追加
      if (meetingsData) {
        meetingsData.forEach((meeting) => {
          timelineItems.push({
            id: meeting.id,
            type: "meeting",
            date: meeting.meetingDate,
            content: meeting.minutes || "（議事録なし）",
            recorderId: meeting.recorderId,
          })
        })
      }

      // 完了アクションを追加
      if (actionsData) {
        actionsData.forEach((action) => {
          timelineItems.push({
            id: action.id,
            type: "action",
            date: action.dueDate || action.setDate,
            content: action.content,
            assigneeId: action.assigneeId,
          })
        })
      }

      // 日付で降順にソート（新しい順）
      timelineItems.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })

      setTimeline(timelineItems)
    } catch (error) {
      console.error("アクション履歴取得エラー:", error)
      alert("アクション履歴の取得に失敗しました")
    } finally {
      setLoadingTimeline(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // バリデーション: 企業名は必須
      if (!companyName.trim()) {
        alert("企業名は必須です")
        return
      }

      const customerData = {
        companyName: companyName.trim(),
        companyRank: companyRank || null,
        assigneeId: assigneeId === "unassigned" ? null : assigneeId || null,
        status: status || null,
        leadSource: leadSource || null,
        updatedAt: new Date().toISOString(),
      }

      if (customer?.id) {
        // 編集の場合: update
        const { error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", customer.id)

        if (error) throw error
      } else {
        // 新規の場合: insert
        const { error } = await supabase
          .from("customers")
          .insert({
            ...customerData,
            createdAt: new Date().toISOString(),
          })

        if (error) throw error
      }

      // 保存成功
      if (onSuccess) {
        onSuccess()
      }
      onOpenChange(false)
    } catch (error) {
      console.error("保存エラー:", error)
      alert(
        `保存に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "顧客情報を編集" : "新規顧客を登録"}
          </DialogTitle>
          <DialogDescription>
            顧客情報を入力してください。必須項目は * で示されています。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="counterparts">カウンターパート</TabsTrigger>
            <TabsTrigger value="next-actions">ネクストアクション</TabsTrigger>
            <TabsTrigger value="meetings">商談記録</TabsTrigger>
            <TabsTrigger value="history">アクション履歴</TabsTrigger>
          </TabsList>

          {/* 基本情報タブ */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">
                  企業名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="株式会社〇〇"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyRank">企業ランク</Label>
                <Select value={companyRank} onValueChange={setCompanyRank}>
                  <SelectTrigger id="companyRank">
                    <SelectValue placeholder="ランクを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assigneeId">BC担当者</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger id="assigneeId">
                    <SelectValue placeholder="担当者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">未設定</SelectItem>
                    {loadingUsers ? (
                      <SelectItem value="loading" disabled>
                        読み込み中...
                      </SelectItem>
                    ) : users.length === 0 ? (
                      <SelectItem value="no-members" disabled>
                        メンバーが登録されていません
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.lastName} {user.firstName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">ステータス</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_STATUSES.map((statusDef) => (
                      <SelectItem key={statusDef.value} value={statusDef.value}>
                        {statusDef.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="leadSource">リードソース</Label>
                <Input
                  id="leadSource"
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  placeholder="例: Webサイト、紹介、展示会など"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </TabsContent>

          {/* カウンターパートタブ */}
          <TabsContent value="counterparts" className="mt-4 space-y-4">
            {!customer?.id ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <p>まずは基本情報を保存してください</p>
              </div>
            ) : (
              <>
                {/* 既存のカウンターパート一覧 */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    カウンターパート一覧
                  </h3>
                  {loadingCounterparts ? (
                    <div className="text-sm text-muted-foreground">
                      読み込み中...
                    </div>
                  ) : counterparts.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      カウンターパートが登録されていません
                    </div>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>氏名</TableHead>
                            <TableHead>部署</TableHead>
                            <TableHead>役職</TableHead>
                            <TableHead className="text-center">ランク</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {counterparts.map((cp) => (
                            <TableRow key={cp.id}>
                              <TableCell className="font-medium">
                                {cp.name}
                              </TableCell>
                              <TableCell>{cp.department || "-"}</TableCell>
                              <TableCell>{cp.position || "-"}</TableCell>
                              <TableCell className="text-center">
                                {cp.rank || "-"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCounterpart(cp.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* 新規カウンターパート追加フォーム */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-semibold">
                    カウンターパートを追加
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cp-name">
                        氏名 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="cp-name"
                        value={newCounterpart.name}
                        onChange={(e) =>
                          setNewCounterpart({
                            ...newCounterpart,
                            name: e.target.value,
                          })
                        }
                        placeholder="山田 太郎"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cp-department">部署</Label>
                      <Input
                        id="cp-department"
                        value={newCounterpart.department}
                        onChange={(e) =>
                          setNewCounterpart({
                            ...newCounterpart,
                            department: e.target.value,
                          })
                        }
                        placeholder="営業部"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cp-position">役職</Label>
                      <Input
                        id="cp-position"
                        value={newCounterpart.position}
                        onChange={(e) =>
                          setNewCounterpart({
                            ...newCounterpart,
                            position: e.target.value,
                          })
                        }
                        placeholder="部長"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="cp-rank">ランク</Label>
                      <Select
                        value={newCounterpart.rank}
                        onValueChange={(value: "A" | "B" | "C" | "") =>
                          setNewCounterpart({
                            ...newCounterpart,
                            rank: value,
                          })
                        }
                      >
                        <SelectTrigger id="cp-rank">
                          <SelectValue placeholder="ランクを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleAddCounterpart}>
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* ネクストアクションタブ */}
          <TabsContent value="next-actions" className="mt-4 space-y-4">
            {!customer?.id ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <p>まずは基本情報を保存してください</p>
              </div>
            ) : (
              <>
                {/* 新規アクション追加フォーム */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">
                    ネクストアクションを追加
                  </h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="action-content">
                        内容 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="action-content"
                        value={newNextAction.content}
                        onChange={(e) =>
                          setNewNextAction({
                            ...newNextAction,
                            content: e.target.value,
                          })
                        }
                        placeholder="例: 見積もりを送付する"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="action-dueDate">期限日</Label>
                      <Input
                        id="action-dueDate"
                        type="date"
                        value={newNextAction.dueDate}
                        onChange={(e) =>
                          setNewNextAction({
                            ...newNextAction,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleAddNextAction}>
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </Button>
                  </div>
                </div>

                {/* 既存のアクション一覧 */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-semibold">アクション一覧</h3>
                  {loadingNextActions ? (
                    <div className="text-sm text-muted-foreground">
                      読み込み中...
                    </div>
                  ) : nextActions.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      アクションが登録されていません
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {nextActions.map((action) => (
                        <div
                          key={action.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{action.content}</p>
                            {action.dueDate && (
                              <p className="text-sm text-muted-foreground">
                                期限:{" "}
                                {new Date(action.dueDate).toLocaleDateString(
                                  "ja-JP"
                                )}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCompleteNextAction(action.id)
                            }
                          >
                            <Check className="h-4 w-4 mr-1" />
                            完了
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* 商談記録タブ */}
          <TabsContent value="meetings" className="mt-4 space-y-4">
            {!customer?.id ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <p>まずは基本情報を保存してください</p>
              </div>
            ) : (
              <>
                {/* 新規商談記録追加フォーム */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">商談記録を追加</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="meeting-date">
                        商談日 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="meeting-date"
                        type="date"
                        value={newMeeting.meetingDate}
                        onChange={(e) =>
                          setNewMeeting({
                            ...newMeeting,
                            meetingDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="meeting-recorder">記録者</Label>
                      <Select
                        value={newMeeting.recorderId || assigneeId || "unassigned"}
                        onValueChange={(value) =>
                          setNewMeeting({
                            ...newMeeting,
                            recorderId: value,
                          })
                        }
                      >
                        <SelectTrigger id="meeting-recorder">
                          <SelectValue placeholder="記録者を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">未設定</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.lastName} {user.firstName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="meeting-minutes">議事録</Label>
                      <Textarea
                        id="meeting-minutes"
                        value={newMeeting.minutes}
                        onChange={(e) =>
                          setNewMeeting({
                            ...newMeeting,
                            minutes: e.target.value,
                          })
                        }
                        placeholder="商談の内容をメモしてください"
                        rows={4}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="meeting-gdrive">
                        Google Driveリンク
                      </Label>
                      <Input
                        id="meeting-gdrive"
                        type="url"
                        value={newMeeting.googleDriveLink}
                        onChange={(e) =>
                          setNewMeeting({
                            ...newMeeting,
                            googleDriveLink: e.target.value,
                          })
                        }
                        placeholder="https://drive.google.com/..."
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="meeting-circleback">
                        Circle Backリンク
                      </Label>
                      <Input
                        id="meeting-circleback"
                        type="url"
                        value={newMeeting.circleBackLink}
                        onChange={(e) =>
                          setNewMeeting({
                            ...newMeeting,
                            circleBackLink: e.target.value,
                          })
                        }
                        placeholder="https://circleback.ai/..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleAddMeeting}>
                      <Plus className="h-4 w-4 mr-2" />
                      記録を追加
                    </Button>
                  </div>
                </div>

                {/* 既存の商談記録一覧 */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-semibold">商談履歴</h3>
                  {loadingMeetings ? (
                    <div className="text-sm text-muted-foreground">
                      読み込み中...
                    </div>
                  ) : meetings.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      商談記録が登録されていません
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meetings.map((meeting) => {
                        const isEditing = editingMeetingId === meeting.id
                        const isExpanded = expandedMeetingId === meeting.id
                        const minutesPreview = meeting.minutes
                          ? meeting.minutes.split("\n").slice(0, 3).join("\n")
                          : ""
                        const hasMoreContent =
                          meeting.minutes &&
                          meeting.minutes.split("\n").length > 3

                        return (
                          <div
                            key={meeting.id}
                            className="rounded-lg border p-4 space-y-2"
                          >
                            {isEditing ? (
                              /* 編集モード */
                              <>
                                <div className="space-y-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor={`edit-meeting-date-${meeting.id}`}>
                                      商談日 <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                      id={`edit-meeting-date-${meeting.id}`}
                                      type="date"
                                      value={editingMeetingData.meetingDate}
                                      onChange={(e) =>
                                        setEditingMeetingData({
                                          ...editingMeetingData,
                                          meetingDate: e.target.value,
                                        })
                                      }
                                    />
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor={`edit-meeting-recorder-${meeting.id}`}>
                                      記録者
                                    </Label>
                                    <Select
                                      value={editingMeetingData.recorderId}
                                      onValueChange={(value) =>
                                        setEditingMeetingData({
                                          ...editingMeetingData,
                                          recorderId: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger id={`edit-meeting-recorder-${meeting.id}`}>
                                        <SelectValue placeholder="記録者を選択" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="unassigned">未設定</SelectItem>
                                        {users.map((user) => (
                                          <SelectItem key={user.id} value={user.id}>
                                            {user.lastName} {user.firstName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor={`edit-meeting-minutes-${meeting.id}`}>
                                      議事録
                                    </Label>
                                    <Textarea
                                      id={`edit-meeting-minutes-${meeting.id}`}
                                      value={editingMeetingData.minutes}
                                      onChange={(e) =>
                                        setEditingMeetingData({
                                          ...editingMeetingData,
                                          minutes: e.target.value,
                                        })
                                      }
                                      placeholder="商談の内容をメモしてください"
                                      rows={4}
                                    />
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor={`edit-meeting-gdrive-${meeting.id}`}>
                                      Google Driveリンク
                                    </Label>
                                    <Input
                                      id={`edit-meeting-gdrive-${meeting.id}`}
                                      type="url"
                                      value={editingMeetingData.googleDriveLink}
                                      onChange={(e) =>
                                        setEditingMeetingData({
                                          ...editingMeetingData,
                                          googleDriveLink: e.target.value,
                                        })
                                      }
                                      placeholder="https://drive.google.com/..."
                                    />
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor={`edit-meeting-circleback-${meeting.id}`}>
                                      Circle Backリンク
                                    </Label>
                                    <Input
                                      id={`edit-meeting-circleback-${meeting.id}`}
                                      type="url"
                                      value={editingMeetingData.circleBackLink}
                                      onChange={(e) =>
                                        setEditingMeetingData({
                                          ...editingMeetingData,
                                          circleBackLink: e.target.value,
                                        })
                                      }
                                      placeholder="https://circleback.ai/..."
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCancelEditMeeting}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      キャンセル
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleUpdateMeeting}
                                    >
                                      <Save className="h-4 w-4 mr-1" />
                                      保存
                                    </Button>
                                  </div>
                                </div>
                              </>
                            ) : (
                              /* 表示モード */
                              <>
                                {/* ヘッダー部分 */}
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-semibold">
                                        {new Date(
                                          meeting.meetingDate
                                        ).toLocaleDateString("ja-JP", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      記録者: {getRecorderName(meeting.recorderId)}
                                    </p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditMeeting(meeting)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteMeeting(meeting.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>

                                {/* 議事録 */}
                                {meeting.minutes && (
                                  <div className="space-y-2">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {isExpanded ? meeting.minutes : minutesPreview}
                                    </p>
                                    {hasMoreContent && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          setExpandedMeetingId(
                                            isExpanded ? null : meeting.id
                                          )
                                        }
                                        className="h-auto p-0 text-xs"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3 w-3 mr-1" />
                                            閉じる
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3 w-3 mr-1" />
                                            もっと見る
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                )}

                                {/* リンク */}
                                {(meeting.googleDriveLink ||
                                  meeting.circleBackLink) && (
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {meeting.googleDriveLink && (
                                      <a
                                        href={meeting.googleDriveLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                      >
                                        <Link className="h-3 w-3" />
                                        Google Drive
                                      </a>
                                    )}
                                    {meeting.circleBackLink && (
                                      <a
                                        href={meeting.circleBackLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                      >
                                        <Link className="h-3 w-3" />
                                        Circle Back
                                      </a>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* アクション履歴タブ */}
          <TabsContent value="history" className="mt-4">
            {!customer?.id ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <p>まずは基本情報を保存してください</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">
                  顧客とのアクション履歴
                </h3>
                {loadingTimeline ? (
                  <div className="text-sm text-muted-foreground">
                    読み込み中...
                  </div>
                ) : timeline.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    アクション履歴がありません
                  </div>
                ) : (
                  <div className="relative space-y-4">
                    {/* タイムライン線 */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                    {timeline.map((item) => (
                      <div key={item.id} className="relative flex gap-4 pl-2">
                        {/* アイコン */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                              item.type === "meeting"
                                ? "border-blue-500 bg-blue-50"
                                : "border-green-500 bg-green-50"
                            }`}
                          >
                            {item.type === "meeting" ? (
                              <MessageCircle
                                className={`h-5 w-5 ${
                                  item.type === "meeting"
                                    ? "text-blue-600"
                                    : "text-green-600"
                                }`}
                              />
                            ) : (
                              <CheckCircle2
                                className={`h-5 w-5 ${
                                  item.type === "meeting"
                                    ? "text-blue-600"
                                    : "text-green-600"
                                }`}
                              />
                            )}
                          </div>
                        </div>

                        {/* コンテンツ */}
                        <div className="flex-1 rounded-lg border bg-card p-4 shadow-sm">
                          <div className="space-y-2">
                            {/* ヘッダー */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                      item.type === "meeting"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {item.type === "meeting"
                                      ? "商談記録"
                                      : "完了アクション"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(item.date).toLocaleDateString(
                                      "ja-JP",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {item.type === "meeting"
                                    ? `記録者: ${getRecorderName(
                                        item.recorderId
                                      )}`
                                    : `担当者: ${getRecorderName(
                                        item.assigneeId
                                      )}`}
                                </p>
                              </div>
                            </div>

                            {/* 内容 */}
                            <div className="mt-2">
                              <p className="text-sm whitespace-pre-wrap">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
