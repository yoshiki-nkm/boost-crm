# Boost CRM - 要件定義書

## プロジェクト概要

**プロジェクト名**: Boost CRM（営業顧客管理システム）
**バージョン**: 1.0
**最終更新日**: 2025年12月6日
**開発環境**: Replit（Node.js 20、PostgreSQL 16）
**対象ユーザー**: 日本のB2B営業チーム

---

## 1. アプリケーションの目的と主要機能

### 1.1 目的

Boost CRMは、日本の営業チーム向けに開発された包括的な顧客関係管理（CRM）システムです。営業活動の効率化、顧客情報の一元管理、タイムリーなフォローアップを実現し、営業成績の向上を支援します。

### 1.2 主要機能

#### 1.2.1 顧客管理機能

**基本的な顧客管理**
- 顧客企業情報の登録・編集・削除
- 企業ランク（A/B/C）による分類
- ステータス管理（提案中、検討中、来年予算化、見送り、リサイクル、スコープ外）
- 担当者（BC担当者）のアサイン
- リードソースの記録（どこから獲得した顧客か）
- 初回コンタクト日・初回面談日の記録
- 次回面談予定日の管理

**カウンターパート（顧客側担当者）管理**
- 複数のカウンターパートを1顧客に紐付け
- 部署、役職、氏名、ランク（A/B/C）の管理
- 最高ランクのカウンターパート自動判定

**顧客情報の表示機能**
- ソート機能（全カラム対応）
- 多層フィルタリング
  - 担当者別
  - 企業ランク別
  - カウンターパートランク別
  - ステータス別
  - キーワード検索（会社名）
- 優先度ハイライト（条件マッチ時に左ボーダーを赤色表示）
- 新規バッジ表示（初回面談から30日以内）
- 経過日数の自動計算・表示

#### 1.2.2 ネクストアクション管理

- 各顧客に対する次のアクションを登録
- アクション内容、期限日、設定日の記録
- アクティブ/非アクティブ管理
- アクション更新時の自動履歴化
- 経過日数の計算（最終アクション日からの経過）
- 担当者へのアクション通知（Slack連携）

#### 1.2.3 商談記録管理

- 商談日と議事録の記録
- Google DriveリンクとCircle Backリンクの保存
- 記録者（ユーザー）の自動記録
- 時系列での商談履歴表示

#### 1.2.4 KPIダッシュボード

**顧客一覧ページのKPI**
- 今月の新規開拓数（初回面談日ベース）
- 企業ランク別の顧客数（A/B/C）
- BC担当者別の未対応アクション数（7日以上経過した案件）

**ダッシュボードページ**
- 新規面談数推移（過去6ヶ月、バーチャート）
  - 初回面談日ベースで月別集計
  - 各月の具体的な数値をラベル表示
- ステータス分布（過去6ヶ月、スタック型縦棒グラフ）
  - 「スコープ外」を除外した集計
  - 各ステータスの顧客数を可視化
  - 値ラベル付き

#### 1.2.5 CSV/Excel一括取り込み

**特徴**
- Excel（.xlsx）およびCSV（.csv）ファイルに対応
- 日本語エンコーディング自動検出
  - Shift_JIS（Excel日本語CSV）
  - CP932
  - UTF-8
  - EUC-JP
- 手動CSV解析により引用符内のカンマに対応
- バリデーション付き取り込み

**取り込み可能なフィールド**
- **必須**: 企業名
- **オプション**: 企業ランク、ステータス、リードソース、BC担当者、初回面談日、次回面談予定日

**機能**
- テンプレートファイルのダウンロード
- 取り込み結果のレポート表示（成功数、エラー詳細）

#### 1.2.6 設定機能

**メンバー管理**
- ユーザー一覧の表示
- 名前（姓・名）の編集
- メールアドレスの編集
- Slack IDの設定（Slack連携用）

**ステータス管理**
- カスタムステータスの追加・編集・削除
- 表示順の変更（上下矢印ボタン）
- デフォルトステータスの設定
- デフォルト値: 提案中、検討中、来年予算化、見送り、リサイクル、スコープ外

**優先度設定**
- 柔軟な条件ベースの優先度ルール作成
- 条件要素:
  - 企業ランク（A/B/C）
  - カウンターパートランク（A/B/C）
  - 新規フラグ（初回面談から30日以内）
  - 経過日数（最終アクションからの日数）
- AND/OR論理演算のサポート
- 複数ルールの作成・管理
- アクティブ/非アクティブ切り替え

**リマインダー設定**
- Slackリマインダールールの作成・管理
- 条件マッチング（優先度設定と同様の条件システム）
- 実行頻度:
  - 毎日（daily）: 毎日9:00に実行
  - 毎週月曜（weekly_monday）: 毎週月曜9:00に実行
- アクティブ/非アクティブ切り替え

**Slack連携設定**
- 2つの連携方法をサポート:
  - Webhook URL方式
  - Bot Token + Channel ID方式
- テスト通知機能
- アクティブ/非アクティブ切り替え

#### 1.2.7 Slack通知機能

**通知内容**
- 条件にマッチした顧客の情報
- 担当者への@mention（Slack IDベース）
- 顧客名、担当者、ネクストアクション、経過日数

**スケジュール実行**
- node-cronによる定期実行
- 毎日9:00: daily頻度のリマインダー実行
- 毎週月曜9:00: weekly_monday頻度のリマインダー実行

#### 1.2.8 認証・セキュリティ

**Replit Auth（OpenID Connect）**
- Passport.jsによるOAuth 2.0統合
- ドメインごとの動的ストラテジー登録
- トークンリフレッシュ機能
- PostgreSQLベースのセッション永続化
- ログイン/ログアウト機能
- 未認証時の自動リダイレクト

#### 1.2.9 UI/UX機能

**テーマ切り替え**
- ライトモード/ダークモード
- システム設定連動オプション

**レスポンシブデザイン**
- モバイル、タブレット、デスクトップ対応
- サイドバーの折りたたみ機能

---

## 2. データベース構造

### 2.1 データベース技術

- **DBMS**: PostgreSQL 16（Neon Serverless）
- **ORM**: Drizzle ORM（型安全）
- **マイグレーション**: Drizzle Kit

### 2.2 テーブル定義

#### 2.2.1 users（ユーザーテーブル）

営業チームのメンバー情報を管理。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | ユーザーID |
| email | VARCHAR | UNIQUE, NOT NULL | メールアドレス |
| firstName | VARCHAR | | 名 |
| lastName | VARCHAR | | 姓 |
| profileImageUrl | VARCHAR | | プロフィール画像URL |
| slackId | VARCHAR | | Slack連携用のユーザーID |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | 更新日時 |

**インデックス**: email（UNIQUE）

#### 2.2.2 customers（顧客テーブル）

顧客企業の基本情報を管理。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 顧客ID |
| companyName | VARCHAR | NOT NULL | 会社名 |
| companyRank | VARCHAR | | 企業ランク（A/B/C） |
| assigneeId | UUID | FOREIGN KEY → users.id | 担当者ID |
| status | VARCHAR | | ステータス |
| proposedProducts | TEXT | | 提案製品 |
| leadSource | VARCHAR | | リードソース（獲得経路） |
| firstContactDate | DATE | | 初回コンタクト日 |
| firstMeetingDate | DATE | | 初回面談日 |
| nextMeetingDate | DATE | | 次回面談予定日 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT now() | 更新日時 |

**外部キー**:
- assigneeId → users.id（ON DELETE SET NULL）

**インデックス**: assigneeId

#### 2.2.3 counterparts（カウンターパートテーブル）

顧客側の担当者情報を管理。1顧客に対して複数登録可能。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | カウンターパートID |
| customerId | UUID | FOREIGN KEY → customers.id, NOT NULL | 顧客ID |
| department | VARCHAR | | 部署 |
| position | VARCHAR | | 役職 |
| name | VARCHAR | NOT NULL | 氏名 |
| rank | VARCHAR | | ランク（A/B/C） |

**外部キー**:
- customerId → customers.id（ON DELETE CASCADE）

**インデックス**: customerId

#### 2.2.4 next_actions（ネクストアクションテーブル）

各顧客に対する次のアクションを管理。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | アクションID |
| customerId | UUID | FOREIGN KEY → customers.id, NOT NULL | 顧客ID |
| content | TEXT | NOT NULL | アクション内容 |
| dueDate | DATE | | 期限日 |
| setDate | DATE | NOT NULL | 設定日 |
| assigneeId | UUID | FOREIGN KEY → users.id | 担当者ID |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | アクティブフラグ |

**外部キー**:
- customerId → customers.id（ON DELETE CASCADE）
- assigneeId → users.id（ON DELETE SET NULL）

**インデックス**: customerId, assigneeId

**ビジネスロジック**: 通常、各顧客につき1つのアクティブなアクション（isActive = true）のみが存在する。

#### 2.2.5 meetings（商談記録テーブル）

商談の議事録とリンクを管理。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 商談ID |
| customerId | UUID | FOREIGN KEY → customers.id, NOT NULL | 顧客ID |
| meetingDate | DATE | NOT NULL | 商談日 |
| minutes | TEXT | | 議事録 |
| googleDriveLink | VARCHAR | | Google DriveリンクURL |
| circleBackLink | VARCHAR | | Circle BackリンクURL |
| recorderId | UUID | FOREIGN KEY → users.id | 記録者ID |

**外部キー**:
- customerId → customers.id（ON DELETE CASCADE）
- recorderId → users.id（ON DELETE SET NULL）

**インデックス**: customerId, recorderId

#### 2.2.6 action_history（アクション履歴テーブル）

過去のアクションの履歴を保存。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 履歴ID |
| customerId | UUID | FOREIGN KEY → customers.id, NOT NULL | 顧客ID |
| content | TEXT | NOT NULL | アクション内容 |
| executionDate | DATE | NOT NULL | 実行日 |
| recorderId | UUID | FOREIGN KEY → users.id | 記録者ID |

**外部キー**:
- customerId → customers.id（ON DELETE CASCADE）
- recorderId → users.id（ON DELETE SET NULL）

**インデックス**: customerId

**ビジネスロジック**: next_actionsが更新される際、古いアクションが自動的にこのテーブルに移動される。

#### 2.2.7 status_master（ステータスマスターテーブル）

カスタマイズ可能なステータスを管理。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | ステータスID |
| name | VARCHAR | UNIQUE, NOT NULL | ステータス名 |
| displayOrder | INTEGER | NOT NULL | 表示順 |
| isDefault | BOOLEAN | NOT NULL, DEFAULT false | デフォルトフラグ |

**インデックス**: name（UNIQUE）

**デフォルト値**:
1. 提案中（displayOrder: 1, isDefault: true）
2. 検討中（displayOrder: 2）
3. 来年予算化（displayOrder: 3）
4. 見送り（displayOrder: 4）
5. リサイクル（displayOrder: 5）
6. スコープ外（displayOrder: 6）

#### 2.2.8 priority_rules（優先度ルールテーブル）

条件ベースの優先度判定ルールを管理。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | ルールID |
| name | VARCHAR | NOT NULL | ルール名 |
| conditions | JSONB | NOT NULL | 条件設定（JSON形式） |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | アクティブフラグ |

**conditions構造**:
```json
[
  {
    "field": "companyRank" | "counterpartRank" | "isNew" | "daysSinceLastAction",
    "operator": "equals" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual",
    "value": "A" | "B" | "C" | true | false | number,
    "logic": "AND" | "OR"
  }
]
```

**例**:
- 「企業ランクがA かつ カウンターパートランクがA」
- 「新規フラグがtrue または 経過日数が7日以上」

#### 2.2.9 slack_reminder_rules（Slackリマインダールールテーブル）

定期的なSlack通知のルールを管理。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | ルールID |
| name | VARCHAR | NOT NULL | ルール名 |
| conditions | JSONB | NOT NULL | 条件設定（priority_rulesと同じ形式） |
| frequency | VARCHAR | NOT NULL | 実行頻度（daily / weekly_monday） |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | アクティブフラグ |

**frequency種別**:
- `daily`: 毎日9:00に実行
- `weekly_monday`: 毎週月曜9:00に実行

#### 2.2.10 slack_settings（Slack設定テーブル）

Slack連携の設定を保存。通常1レコードのみ。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 設定ID |
| webhookUrl | VARCHAR | | Webhook URL（方式1） |
| botToken | VARCHAR | | Bot Token（方式2） |
| channelId | VARCHAR | | Channel ID（方式2） |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | アクティブフラグ |

**設定方式**:
- 方式1: webhookUrlのみ設定
- 方式2: botToken + channelId設定

#### 2.2.11 sessions（セッションテーブル）

ユーザーセッションの永続化（connect-pg-simple使用）。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| sid | VARCHAR | PRIMARY KEY | セッションID |
| sess | JSONB | NOT NULL | セッションデータ |
| expire | TIMESTAMP | NOT NULL | 有効期限 |

**インデックス**: expire

### 2.3 ER図（エンティティ関連図）

```
users (1) ←──────── (*) customers
  ↑                      ↓
  │                      │ (1)
  │                      │
  │ (1)                  ↓ (*)
  │              counterparts
  │
  │ (1)
  │
  ├──────── (*) next_actions → (*) customers
  │
  ├──────── (*) meetings → (*) customers
  │
  └──────── (*) action_history → (*) customers

status_master (独立)
priority_rules (独立)
slack_reminder_rules (独立)
slack_settings (独立、通常1レコード)
sessions (独立)
```

---

## 3. 画面構成とUIの要素

### 3.1 ナビゲーション構造

```
認証前:
  └── /（Landing Page）

認証後:
  ├── /（顧客一覧ページ）← デフォルトページ
  ├── /dashboard（ダッシュボード）
  └── /settings（設定ページ）
```

### 3.2 レイアウト構成

**共通レイアウト**
- **サイドバー**（左側固定）
  - アプリロゴ
  - ナビゲーションメニュー
    - 顧客一覧
    - ダッシュボード
    - 設定
  - 折りたたみ可能
- **ヘッダー**
  - サイドバートグルボタン
  - テーマ切り替えボタン（ライト/ダーク/システム）
- **メインコンテンツエリア**
  - ページごとの内容

### 3.3 各画面の詳細

#### 3.3.1 ランディングページ（/）

**表示タイミング**: 未認証ユーザー

**要素**:
- アプリケーション説明
- ログインボタン（Replit Auth）

#### 3.3.2 顧客一覧ページ（/）

**表示タイミング**: 認証後のデフォルトページ

**画面構成**:

1. **KPIカードセクション**（上部）
   - 3つのカードを横並び表示
   - カード1: 今月の新規開拓数
     - 数値とラベル
   - カード2: 企業ランク別顧客数
     - A/B/Cランクごとの件数
   - カード3: BC担当者別未対応アクション数
     - 7日以上経過した案件数を担当者別に集計

2. **ツールバー**
   - 「顧客を追加」ボタン（プライマリカラー）
   - 「CSV/Excelインポート」ボタン
   - フィルタエリア:
     - 検索ボックス（会社名）
     - 担当者選択ドロップダウン
     - 企業ランク選択ドロップダウン
     - CPランク選択ドロップダウン
     - ステータス選択ドロップダウン

3. **顧客一覧テーブル**
   - カラム:
     - 企業名（ソート可）
     - 企業ランク（ソート可、A/B/C）
     - BC担当者（ソート可）
     - ステータス（ソート可、バッジ表示）
     - ネクストアクション（ソート可）
     - CP名（カウンターパート名）
     - CPランク（ソート可、A/B/C）
     - 次回MTG（次回面談予定日、ソート可）
     - 経過日数（ソート可、最終アクションからの日数）
   - 各行の機能:
     - クリックで顧客詳細ダイアログを開く
     - 優先度マッチ時に左ボーダーが赤色
     - 新規顧客（30日以内）に「New」バッジ表示
   - ソート機能: 各カラムヘッダーをクリック
   - レスポンシブ対応: モバイルではスクロール可能

4. **顧客詳細ダイアログ**（モーダル）
   - 5つのタブ構成:
     - **基本情報タブ**:
       - 会社名（必須）
       - 企業ランク（A/B/C選択）
       - BC担当者（ドロップダウン）
       - ステータス（ドロップダウン）
       - 提案製品（テキストエリア）
       - リードソース（テキスト）
       - 初回コンタクト日（日付ピッカー）
       - 初回面談日（日付ピッカー）
       - 次回面談予定日（日付ピッカー）
     - **カウンターパートタブ**:
       - カウンターパート一覧（テーブル）
       - 「カウンターパートを追加」ボタン
       - 各カウンターパート:
         - 部署
         - 役職
         - 氏名（必須）
         - ランク（A/B/C）
         - 削除ボタン
     - **ネクストアクションタブ**:
       - アクション内容（テキストエリア、必須）
       - 期限日（日付ピッカー）
       - 設定日（日付ピッカー、必須）
       - 担当者（ドロップダウン）
       - 「更新」ボタン
       - 既存のアクティブなアクションは自動的に履歴化される
     - **商談記録タブ**:
       - 商談記録一覧（時系列表示）
       - 「商談記録を追加」ボタン
       - 追加ダイアログ:
         - 商談日（日付ピッカー、必須）
         - 議事録（テキストエリア）
         - Google DriveリンクURL
         - Circle BackリンクURL
     - **アクション履歴タブ**:
       - 過去のアクション一覧（時系列表示）
       - 各履歴: 実行日、内容、記録者
   - ダイアログ下部:
     - 「保存」ボタン
     - 「削除」ボタン（既存顧客の場合）
     - 「キャンセル」ボタン

5. **CSV/Excelインポートダイアログ**（モーダル）
   - ファイル選択エリア（ドラッグ&ドロップ対応）
   - 「テンプレートをダウンロード」ボタン
   - 「インポート」ボタン
   - 結果表示エリア:
     - 成功件数
     - エラー詳細（行番号、エラー内容）

#### 3.3.3 ダッシュボードページ（/dashboard）

**画面構成**:

1. **ページヘッダー**
   - タイトル: 「ダッシュボード」

2. **グラフエリア**（2列レイアウト）

   **左列: 新規面談数推移グラフ**
   - タイトル: 「新規面談数推移（過去6ヶ月）」
   - グラフタイプ: バーチャート（縦棒グラフ）
   - X軸: 月（YYYY年M月形式）
   - Y軸: 面談数
   - データ: 初回面談日ベースで月別集計
   - 各バーに数値ラベル表示
   - プライマリカラー（Deep Green）

   **右列: ステータス分布グラフ**
   - タイトル: 「ステータス分布（過去6ヶ月）」
   - グラフタイプ: スタック型縦棒グラフ
   - X軸: 月（YYYY年M月形式）
   - Y軸: 顧客数
   - データ: ステータス別顧客数（「スコープ外」を除外）
   - 各ステータスに異なる色
   - 各セグメントに数値ラベル表示
   - 凡例表示

3. **レスポンシブ対応**
   - デスクトップ: 2列並び
   - タブレット: 1列縦積み

#### 3.3.4 設定ページ（/settings）

**画面構成**:

1. **ページヘッダー**
   - タイトル: 「設定」

2. **タブナビゲーション**（5つのタブ）
   - メンバー管理
   - ステータス管理
   - 優先度設定
   - リマインダー設定
   - Slack連携

3. **メンバー管理タブ**
   - ユーザー一覧テーブル
     - カラム: 名前、メールアドレス、Slack ID、アクション
     - 各行に「編集」ボタン
   - 編集ダイアログ:
     - 姓（テキスト）
     - 名（テキスト）
     - メールアドレス（テキスト、読み取り専用）
     - Slack ID（テキスト）
     - 「保存」「キャンセル」ボタン

4. **ステータス管理タブ**
   - 「新しいステータスを追加」ボタン
   - ステータス一覧テーブル
     - カラム: ステータス名、表示順、デフォルト、アクション
     - 各行:
       - 上矢印ボタン（表示順を上げる）
       - 下矢印ボタン（表示順を下げる）
       - 「編集」ボタン
       - 「削除」ボタン
   - 追加/編集ダイアログ:
     - ステータス名（テキスト、必須）
     - デフォルトステータスにする（チェックボックス）
     - 「保存」「キャンセル」ボタン

5. **優先度設定タブ**
   - 「新しい優先度ルールを追加」ボタン
   - 優先度ルール一覧テーブル
     - カラム: ルール名、条件、アクティブ、アクション
     - 各行:
       - アクティブ切り替えスイッチ
       - 「編集」ボタン
       - 「削除」ボタン
   - 追加/編集ダイアログ:
     - ルール名（テキスト、必須）
     - 条件設定エリア:
       - フィールド選択（企業ランク/CPランク/新規フラグ/経過日数）
       - 演算子選択（equals/greaterThan/lessThan等）
       - 値入力
       - 論理演算子（AND/OR）
       - 「条件を追加」ボタン
     - 「保存」「キャンセル」ボタン

6. **リマインダー設定タブ**
   - 「新しいリマインダールールを追加」ボタン
   - リマインダールール一覧テーブル
     - カラム: ルール名、条件、頻度、アクティブ、アクション
     - 各行:
       - アクティブ切り替えスイッチ
       - 「編集」ボタン
       - 「削除」ボタン
   - 追加/編集ダイアログ:
     - ルール名（テキスト、必須）
     - 条件設定エリア（優先度設定と同じ）
     - 実行頻度（ラジオボタン: 毎日 / 毎週月曜）
     - 「保存」「キャンセル」ボタン

7. **Slack連携タブ**
   - 「テスト通知を送信」ボタン
   - Slack設定フォーム:
     - Webhook URL（テキスト）
     - または
     - Bot Token（テキスト）
     - Channel ID（テキスト）
     - アクティブ（スイッチ）
     - 「保存」ボタン

### 3.4 UIコンポーネント

**使用ライブラリ**:
- Shadcn/UI（47個のコンポーネント）
- Radix UI（アクセシブルなプリミティブ）
- Lucide React（アイコン）

**主要コンポーネント**:
- Button（ボタン）
- Input（テキスト入力）
- Select（ドロップダウン）
- Dialog（モーダルダイアログ）
- Table（テーブル）
- Card（カード）
- Badge（バッジ）
- Tabs（タブ）
- Switch（スイッチ）
- Calendar（カレンダー）
- Popover（ポップオーバー）
- Toast（通知トースト）
- Sidebar（サイドバー）

### 3.5 デザインシステム

**カラーパレット**:
- **プライマリカラー**: Deep Green（HSL 152, 68%, 28%）
- **セカンダリカラー**: システムデフォルト
- **ステータスカラー**: 8色のカスタムパレット

**タイポグラフィ**:
- フォントファミリー: Inter → Noto Sans JP
- モノスペース: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas

**スペーシング**:
- Tailwind CSSデフォルトスケール（4px単位）

**レスポンシブブレークポイント**:
- モバイル: < 640px
- タブレット: 640px - 1024px
- デスクトップ: > 1024px

**テーマ**:
- ライトモード
- ダークモード
- システム設定連動

**デザイン原則**:
- Material Design準拠
- アクセシビリティ重視（Radix UI）
- 一貫性のあるスペーシング
- 明確な視覚的ヒエラルキー

---

## 4. 技術的な改善点（Replit特有のコードなど）

### 4.1 Replit特有の実装

#### 4.1.1 Replit Auth（OpenID Connect）

**現在の実装**:
- Passport.jsでOpenID Connect統合
- ドメインごとに動的ストラテジー登録
- セッションをPostgreSQLに永続化（connect-pg-simple）
- トークンリフレッシュ機能実装

**実装ファイル**: `server/replitAuth.ts`

**特徴**:
- Replit環境専用の認証システム
- 環境変数 `REPLIT_DEPLOYMENT` でプロダクション判定
- `REPL_ID`、`REPL_OWNER`、`REPL_SLUG` からコールバックURL生成

**課題と改善点**:
1. **環境依存**:
   - Replit外では動作しない
   - 他のホスティング環境への移行が困難
   - **改善案**: 汎用的なOAuth 2.0プロバイダー（Auth0、Firebase Auth等）への移行を検討

2. **環境変数管理**:
   - `.env`ファイルがなく、Replit Secretsに依存
   - ローカル開発が困難
   - **改善案**: `.env.example` ファイルを作成し、環境変数の一覧を文書化

3. **CSRF対策不足**:
   - セッションベース認証だが、CSRFトークン未実装
   - **改善案**: `csurf` パッケージを使用してCSRF対策を実装

#### 4.1.2 Replit開発環境設定

**設定ファイル**: `.replit`

```toml
[run]
command = "npm run dev"

[deployment]
run = ["npm", "run", "build"]
deploymentTarget = "cloudrun"
```

**Vite設定**: `vite.config.ts`

Replitプラグインの使用:
```typescript
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import devBanner from "@replit/vite-plugin-dev-banner";
import cartographer from "@replit/vite-plugin-cartographer";
```

**プラグインの機能**:
- **runtime-error-modal**: ランタイムエラーをモーダルで表示
- **dev-banner**: 開発環境であることを示すバナー
- **cartographer**: コードマップ機能

**課題と改善点**:
1. **本番環境での不要なコード**:
   - Replitプラグインは開発環境専用
   - 本番ビルドに含めるべきでない
   - **改善案**: 環境変数で条件分岐し、開発環境のみでプラグインを有効化
   ```typescript
   plugins: [
     ...(process.env.NODE_ENV === 'development'
       ? [runtimeErrorModal(), devBanner(), cartographer()]
       : [])
   ]
   ```

2. **静的アセット配信**:
   - `server/static.ts` で手動実装
   - **改善案**: Expressの `express.static` ミドルウェアで十分

### 4.2 データベース・ORM関連

#### 4.2.1 Drizzle ORM

**現在の実装**:
- 型安全なクエリビルダー
- マイグレーション管理（Drizzle Kit）
- Neon Serverless PostgreSQL接続

**課題と改善点**:
1. **N+1問題の可能性**:
   - `server/storage.ts` の `getAllCustomers` で、リレーションデータを個別取得
   ```typescript
   for (const customer of customers) {
     const assignee = await this.getUserById(customer.assigneeId);
     const counterparts = await this.getCounterpartsByCustomerId(customer.id);
     // ...
   }
   ```
   - 顧客数が増えるとクエリ数が爆発的に増加
   - **改善案**: Drizzle ORMのJOIN機能を使用して1回のクエリで取得
   ```typescript
   const customersWithDetails = await db
     .select()
     .from(customers)
     .leftJoin(users, eq(customers.assigneeId, users.id))
     .leftJoin(counterparts, eq(counterparts.customerId, customers.id))
     .leftJoin(nextActions, and(
       eq(nextActions.customerId, customers.id),
       eq(nextActions.isActive, true)
     ));
   ```

2. **ページネーション未実装**:
   - 顧客一覧を全件取得
   - 大量データ時にパフォーマンス問題
   - **改善案**: ページネーションまたは無限スクロール実装
   ```typescript
   .limit(pageSize)
   .offset(page * pageSize)
   ```

3. **インデックス最適化**:
   - 現在の実装で基本的なインデックスは設定済み
   - **改善案**: 頻繁に使用されるフィルタ条件（status、companyRankなど）に複合インデックスを検討

#### 4.2.2 データベース接続

**現在の実装**: `server/db.ts`

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
```

**課題と改善点**:
1. **コネクションプーリング**:
   - Neon Serverlessは自動でプーリングするが、設定が見えない
   - **改善案**: 明示的なプール設定の追加を検討

2. **環境変数の検証**:
   - `process.env.DATABASE_URL!` で非nullアサーション
   - 起動時にエラーチェックがない
   - **改善案**: 起動時に環境変数の存在を検証
   ```typescript
   if (!process.env.DATABASE_URL) {
     throw new Error("DATABASE_URL is not defined");
   }
   ```

### 4.3 APIエンドポイント・ルーティング

#### 4.3.1 routes.ts（735行）

**課題と改善点**:
1. **ファイルサイズが大きすぎる**:
   - 1ファイルに全エンドポイントを定義
   - 保守性が低い
   - **改善案**: エンドポイントごとにファイル分割
   ```
   server/
   ├── routes/
   │   ├── customers.ts
   │   ├── users.ts
   │   ├── statuses.ts
   │   ├── priorityRules.ts
   │   ├── slackReminders.ts
   │   └── slackSettings.ts
   └── index.ts（ルーターを統合）
   ```

2. **エラーハンドリングの一貫性**:
   - try-catchブロックが各エンドポイントに重複
   - **改善案**: 非同期エラーハンドリングミドルウェアの導入
   ```typescript
   const asyncHandler = (fn) => (req, res, next) => {
     Promise.resolve(fn(req, res, next)).catch(next);
   };
   ```

3. **バリデーション**:
   - 一部のエンドポイントでZodバリデーション実装
   - 統一性がない
   - **改善案**: すべてのPOST/PATCH/DELETEエンドポイントにZodバリデーションを適用

### 4.4 フロントエンド関連

#### 4.4.1 customer-dialog.tsx（30KB、800行以上）

**課題と改善点**:
1. **コンポーネントが大きすぎる**:
   - 1ファイルに全タブの実装
   - 可読性・保守性が低い
   - **改善案**: タブごとにサブコンポーネント化
   ```typescript
   components/
   ├── customer-dialog/
   │   ├── index.tsx（メインダイアログ）
   │   ├── BasicInfoTab.tsx
   │   ├── CounterpartsTab.tsx
   │   ├── NextActionTab.tsx
   │   ├── MeetingsTab.tsx
   │   └── ActionHistoryTab.tsx
   ```

2. **状態管理の複雑さ**:
   - React Hook Formと複数のuseStateが混在
   - **改善案**: 状態管理ライブラリ（Zustand等）の導入検討

#### 4.4.2 settings.tsx

**課題と改善点**:
1. **タブごとのファイル分割**:
   - 現在は1ファイルに5つのタブ
   - **改善案**: 各タブを別ファイルに分離
   ```typescript
   pages/
   ├── settings/
   │   ├── index.tsx（メインページ）
   │   ├── MembersTab.tsx
   │   ├── StatusesTab.tsx
   │   ├── PriorityRulesTab.tsx
   │   ├── RemindersTab.tsx
   │   └── SlackSettingsTab.tsx
   ```

#### 4.4.3 データフェッチング

**現在の実装**: TanStack Query（React Query）

**課題と改善点**:
1. **キャッシュ戦略の最適化**:
   - 現在はデフォルトのstaleTime（0ms）
   - 頻繁なリフェッチが発生する可能性
   - **改善案**: 適切なstaleTimeとcacheTimeの設定
   ```typescript
   queryClient.setQueryDefaults(['customers'], {
     staleTime: 5 * 60 * 1000, // 5分
     cacheTime: 10 * 60 * 1000, // 10分
   });
   ```

2. **楽観的更新**:
   - 現在は全データの再フェッチ
   - UX改善の余地あり
   - **改善案**: 楽観的更新（Optimistic Updates）の実装

### 4.5 セキュリティ

#### 4.5.1 認証・認可

**課題と改善点**:
1. **CSRF対策**:
   - セッションベース認証だがCSRFトークン未実装
   - **改善案**: `csurf`ミドルウェアの追加

2. **認可（Authorization）**:
   - 全ての認証済みユーザーが全データにアクセス可能
   - ロールベースのアクセス制御（RBAC）なし
   - **改善案**: ユーザーロール（管理者、メンバー等）の実装

3. **セッションセキュリティ**:
   - セッション設定は実装済み
   - **改善点**: セッションタイムアウトの適切な設定確認

#### 4.5.2 ファイルアップロード

**現在の実装**: multer（サイズ制限5MB）

**課題と改善点**:
1. **ファイルタイプ検証**:
   - 拡張子チェックのみ
   - **改善案**: MIMEタイプとファイル内容の検証

2. **ファイル保存場所**:
   - メモリバッファ（`.buffer`）使用
   - 大量アップロード時のメモリ圧迫
   - **改善案**: 現在の実装で問題ないが、将来的にはストリーム処理を検討

### 4.6 パフォーマンス

#### 4.6.1 バンドルサイズ

**課題と改善点**:
1. **コード分割**:
   - 現在は全ページを1つのバンドルに
   - **改善案**: Viteの動的インポートでページごとに分割
   ```typescript
   const Dashboard = lazy(() => import('./pages/dashboard'));
   ```

2. **依存関係の最適化**:
   - 大きなライブラリ（Rechartsなど）の遅延ロード

#### 4.6.2 レンダリング最適化

**課題と改善点**:
1. **テーブルの仮想化**:
   - 大量データ時のレンダリングパフォーマンス
   - **改善案**: react-virtual等の仮想スクロールライブラリの導入

2. **メモ化**:
   - 重い計算（経過日数、優先度判定など）のメモ化
   - **改善案**: `useMemo`、`useCallback`の適切な使用

### 4.7 テスト

**現在の状況**: テストコード未実装

**改善案**:
1. **ユニットテスト**:
   - Vitest（Viteと統合）
   - ユーティリティ関数、計算ロジックのテスト

2. **統合テスト**:
   - Testing Library（React Testing Library）
   - コンポーネントの動作テスト

3. **E2Eテスト**:
   - Playwright
   - ユーザーフロー全体のテスト

4. **APIテスト**:
   - Supertest
   - エンドポイントの動作確認

### 4.8 エラーハンドリング・ロギング

**現在の実装**:
- グローバルエラーハンドラー実装済み
- コンソールログのみ

**改善案**:
1. **構造化ロギング**:
   - Winston、Pinoなどのロガー導入
   - ログレベル（error、warn、info、debug）の適切な使用

2. **エラートラッキング**:
   - Sentry等のエラートラッキングサービス導入
   - 本番環境でのエラー監視

3. **監視・アラート**:
   - アプリケーションメトリクスの収集
   - 異常検知とアラート

### 4.9 ドキュメンテーション

**現在の状況**:
- `replit.md`: 詳細なプロジェクト説明（178行）
- `design_guidelines.md`: デザインガイドライン（141行）

**改善案**:
1. **APIドキュメント**:
   - OpenAPI（Swagger）仕様の作成
   - 自動生成されたAPIドキュメント

2. **コンポーネントドキュメント**:
   - Storybookの導入
   - UIコンポーネントのカタログ化

3. **開発者向けドキュメント**:
   - セットアップ手順
   - 開発ワークフロー
   - コーディング規約

### 4.10 CSV取り込み機能

**現在の実装**:
- 日本語エンコーディング自動検出（Shift_JIS、UTF-8、EUC-JP）
- 手動CSV解析（引用符対応）

**特筆すべき実装**:
```typescript
// エンコーディング検出
const encodings = ['Shift_JIS', 'CP932', 'UTF-8', 'EUC-JP'];
const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

for (const encoding of encodings) {
  const decoded = iconv.decode(buffer, encoding);
  if (japanesePattern.test(decoded)) {
    csvContent = decoded;
    break;
  }
}
```

**課題と改善点**:
1. **エンコーディング検出の精度**:
   - 現在はヒューリスティック（日本語文字の有無）
   - **改善案**: `chardet`等の文字コード検出ライブラリの使用

2. **大容量ファイル対応**:
   - 現在はメモリに全データをロード
   - **改善案**: ストリーム処理の実装

3. **バリデーションエラーの詳細化**:
   - エラーメッセージの改善
   - どのフィールドがなぜ失敗したかの明確化

### 4.11 Slack連携

**現在の実装**:
- Webhook URLまたはBot Token方式
- node-cronで定期実行（毎日9:00、毎週月曜9:00）

**課題と改善点**:
1. **エラーハンドリング**:
   - Slack API呼び出し失敗時の処理
   - **改善案**: リトライ機構の実装

2. **通知の制御**:
   - 通知頻度の細かい制御
   - **改善案**: より柔軟な頻度設定（毎時、カスタムcron式など）

3. **通知内容のカスタマイズ**:
   - 現在はハードコードされたフォーマット
   - **改善案**: テンプレート機能の追加

### 4.12 TypeScript型安全性

**現在の実装**:
- フルスタックTypeScript
- Zodによるランタイム型検証
- Drizzle ORMの型安全なクエリ

**改善案**:
1. **strictモードの徹底**:
   - `tsconfig.json`で`strict: true`を確認
   - `any`型の使用を最小限に

2. **型定義の共有**:
   - `shared/schema.ts`で共有
   - API型定義の自動生成検討（tRPC等）

3. **Zodスキーマの一元管理**:
   - 重複したスキーマ定義の統合

---

## 5. 技術スタックサマリー

### 5.1 フロントエンド
- **React 18**: UIライブラリ
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **Wouter**: 軽量ルーティング
- **TanStack Query**: データフェッチング・キャッシング
- **Shadcn/UI + Radix UI**: アクセシブルなUIコンポーネント
- **Tailwind CSS**: ユーティリティファーストCSS
- **Lucide React**: アイコン
- **React Hook Form + Zod**: フォーム管理とバリデーション
- **Recharts**: データビジュアライゼーション
- **date-fns**: 日付操作

### 5.2 バックエンド
- **Node.js 20**: ランタイム
- **Express**: Webフレームワーク
- **TypeScript**: 型安全な開発
- **Drizzle ORM**: 型安全なORM
- **PostgreSQL 16**: データベース（Neon Serverless）
- **Passport.js**: 認証（OpenID Connect）
- **express-session + connect-pg-simple**: セッション管理
- **node-cron**: スケジュールタスク
- **@slack/web-api**: Slack連携
- **multer**: ファイルアップロード
- **xlsx**: Excel処理
- **iconv-lite**: 文字エンコーディング変換

### 5.3 開発ツール
- **Replit**: ホスティング環境
- **Drizzle Kit**: マイグレーション管理
- **esbuild**: 高速トランスパイラー
- **Replit Vite Plugins**: 開発体験向上

---

## 6. 将来の拡張性

### 6.1 短期的な改善（3ヶ月以内）
1. N+1問題の解決（JOIN最適化）
2. ページネーション実装
3. routes.ts、customer-dialog.tsxのリファクタリング
4. CSRF対策の実装
5. ユニットテストの導入

### 6.2 中期的な改善（6ヶ月以内）
1. ロールベースアクセス制御（RBAC）
2. E2Eテストの実装
3. エラートラッキング（Sentry等）の導入
4. パフォーマンス監視の実装
5. OpenAPI仕様の作成

### 6.3 長期的な拡張（1年以内）
1. モバイルアプリ（React Native等）
2. 他の認証プロバイダーのサポート（Auth0、Firebase等）
3. 高度な分析機能（予測分析、レポート生成）
4. 他ツールとの連携（Salesforce、HubSpot等）
5. マルチテナント対応

---

## 7. 制約事項

### 7.1 技術的制約
- **Replit環境依存**: 他のホスティング環境への移行には認証システムの変更が必要
- **Neon Serverless**: PostgreSQLのServerless制約（コネクション数、レイテンシなど）
- **ファイルストレージ**: 添付ファイルはローカル保存（スケールしない）

### 7.2 機能的制約
- **ロール管理なし**: 全ユーザーが全データにアクセス可能
- **削除の復元不可**: ソフトデリートなし、物理削除のみ
- **監査ログなし**: 変更履歴の完全な記録なし
- **多言語非対応**: 日本語のみ

### 7.3 パフォーマンス制約
- **ページネーションなし**: 大量データ時にパフォーマンス低下
- **N+1問題**: リレーションデータの取得が非効率
- **キャッシュ戦略**: デフォルト設定のみ

---

## 8. まとめ

Boost CRMは、日本の営業チーム向けに開発された包括的なCRMシステムです。モダンな技術スタック（React、TypeScript、Drizzle ORM）を使用し、Replit環境に最適化されています。

### 主な強み
1. **フルスタックTypeScript**: 型安全性が高く保守性に優れる
2. **日本語完全対応**: UI、CSV取り込み、エンコーディング処理
3. **柔軟な優先度・リマインダーシステム**: 条件ベースの強力なルールエンジン
4. **包括的な機能**: 顧客管理、商談記録、KPI、Slack連携など
5. **詳細なドキュメント**: プロジェクト理解が容易

### 主な改善点
1. **コードの分割**: 大きなファイル（routes.ts、customer-dialog.tsx）のリファクタリング
2. **パフォーマンス最適化**: N+1問題の解決、ページネーション実装
3. **セキュリティ強化**: CSRF対策、RBAC実装
4. **テストカバレッジ**: ユニット、統合、E2Eテストの追加
5. **環境依存の軽減**: Replit以外の環境への移行可能性の向上

このシステムは、営業チームの日常業務を効率化し、顧客フォローアップの漏れを防ぎ、データに基づいた意思決定を支援する強力なツールとなっています。
