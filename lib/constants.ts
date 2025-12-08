// ステータス定義の一元管理

export type StatusValue =
  | "approach"
  | "appointment"
  | "meeting_done"
  | "proposal"
  | "pending"
  | "recycle"

export type StatusDefinition = {
  value: StatusValue
  label: string
  color: string // Hex color code for graphs
}

// ステータス定義配列（この並び順が「正」となる）
// この順序がグラフの積み上げ順と凡例順になります
export const CUSTOMER_STATUSES: StatusDefinition[] = [
  {
    value: "approach",
    label: "アプローチ中",
    color: "#86efac", // emerald-300 (薄い緑)
  },
  {
    value: "appointment",
    label: "初回アポ取得済",
    color: "#34d399", // emerald-400 (中間の緑)
  },
  {
    value: "meeting_done",
    label: "初回面談実施済",
    color: "#10b981", // emerald-500 (濃い緑)
  },
  {
    value: "proposal",
    label: "提案中",
    color: "#047857", // emerald-700 (最も濃い緑)
  },
  {
    value: "recycle",
    label: "リサイクル対象",
    color: "#f97316", // orange-500 (オレンジ)
  },
  {
    value: "pending",
    label: "見送り",
    color: "#4b5563", // gray-600 (ダークグレー)
  },
]

// ステータスのvalueからlabelを取得するマップ
export const STATUS_LABEL_MAP: Record<StatusValue, string> =
  CUSTOMER_STATUSES.reduce((acc, status) => {
    acc[status.value] = status.label
    return acc
  }, {} as Record<StatusValue, string>)

// ステータスのvalueからcolorを取得するマップ
export const STATUS_COLOR_MAP: Record<StatusValue, string> =
  CUSTOMER_STATUSES.reduce((acc, status) => {
    acc[status.value] = status.color
    return acc
  }, {} as Record<StatusValue, string>)

// グラフ用の色定義（CUSTOMER_STATUSESから動的に生成）
export const CHART_COLORS: Record<string, string> =
  CUSTOMER_STATUSES.reduce((acc, status) => {
    acc[status.label] = status.color
    return acc
  }, {} as Record<string, string>)
