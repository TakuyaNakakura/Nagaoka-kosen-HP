export const DEPARTMENTS = [
  "機械工学科",
  "電気電子システム工学科",
  "電子制御工学科",
  "物質生物工学科",
  "環境都市工学科",
  "一般科",
] as const;

export const INDUSTRIES = [
  "精密機器",
  "DX・ソフトウェア",
  "素材・化学",
  "建設・インフラ",
  "エネルギー",
  "製造支援サービス",
] as const;

export const RESEARCH_FIELDS = [
  "IoT",
  "センシング",
  "AI・データ活用",
  "ロボティクス",
  "材料開発",
  "環境計測",
  "地域インフラ",
  "脱炭素",
] as const;

export const MEMBERSHIP_PLANS = [
  {
    id: "regular",
    name: "正会員",
    fee: "年額 50,000円",
    audience: "共同研究や技術相談を継続的に行いたい企業向け",
    benefits: ["企業ページ掲載", "技術相談受付", "交流会参加", "研究シーズ優先案内"],
  },
  {
    id: "supporter",
    name: "賛助会員",
    fee: "年額 30,000円",
    audience: "情報収集や学校連携を始めたい企業向け",
    benefits: ["企業名掲載", "イベント案内", "資料配布"],
  },
] as const;

export const DOCUMENT_LINKS = [
  { name: "入会案内.txt", path: "/docs/application-guide.txt" },
  { name: "会員規約.txt", path: "/docs/membership-rules.txt" },
  { name: "情報更新申請書.txt", path: "/docs/update-request-form.txt" },
] as const;

export const WORKFLOW_LABELS = {
  DRAFT: "下書き",
  PENDING: "承認待ち",
  APPROVED: "公開中",
  RETURNED: "差戻し",
  REJECTED: "却下",
} as const;

export const INQUIRY_STATUS_LABELS = {
  NEW: "新規",
  IN_PROGRESS: "対応中",
  COMPLETED: "完了",
} as const;

export const MEMBERSHIP_STATUS_LABELS = {
  NEW: "新規",
  REVIEWING: "審査中",
  COMPLETED: "完了",
} as const;

export const MEMBER_SECTIONS = [
  { key: "", label: "マイページ" },
  { key: "edit", label: "自社情報編集" },
  { key: "status", label: "申請状況" },
  { key: "public", label: "公開ページ確認" },
  { key: "inquiries", label: "問い合わせ確認" },
] as const;

export const ADMIN_SECTIONS = [
  { key: "", label: "ダッシュボード" },
  { key: "companies", label: "会員企業管理" },
  { key: "accounts", label: "アカウント管理" },
  { key: "applications", label: "更新申請承認" },
  { key: "faculty", label: "教員管理" },
  { key: "seeds", label: "技術シーズ管理" },
  { key: "news", label: "ニュース管理" },
  { key: "events", label: "イベント管理" },
  { key: "inquiries", label: "問い合わせ管理" },
  { key: "join", label: "入会申請管理" },
  { key: "organization", label: "組織情報管理" },
  { key: "permissions", label: "権限管理" },
  { key: "audit", label: "監査ログ" },
] as const;
