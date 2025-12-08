-- ============================================
-- Boost CRM - データベーススキーマ
-- PostgreSQL 16 / Supabase用
-- ============================================

-- UUID拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. users（ユーザーテーブル）
-- 営業チームのメンバー情報を管理
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "profileImageUrl" VARCHAR(500),
    "slackId" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- インデックス
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- コメント
COMMENT ON TABLE users IS '営業チームのメンバー情報を管理するテーブル';
COMMENT ON COLUMN users.id IS 'ユーザーID（UUID）';
COMMENT ON COLUMN users.email IS 'メールアドレス（ユニーク）';
COMMENT ON COLUMN users."firstName" IS '名';
COMMENT ON COLUMN users."lastName" IS '姓';
COMMENT ON COLUMN users."profileImageUrl" IS 'プロフィール画像URL';
COMMENT ON COLUMN users."slackId" IS 'Slack連携用のユーザーID';
COMMENT ON COLUMN users."createdAt" IS '作成日時';
COMMENT ON COLUMN users."updatedAt" IS '更新日時';

-- ============================================
-- 2. status_master（ステータスマスターテーブル）
-- カスタマイズ可能なステータスを管理
-- ============================================
CREATE TABLE status_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false
);

-- インデックス
CREATE UNIQUE INDEX idx_status_master_name ON status_master(name);

-- デフォルト値の挿入
INSERT INTO status_master (name, "displayOrder", "isDefault") VALUES
    ('提案中', 1, true),
    ('検討中', 2, false),
    ('来年予算化', 3, false),
    ('見送り', 4, false),
    ('リサイクル', 5, false),
    ('スコープ外', 6, false);

-- コメント
COMMENT ON TABLE status_master IS 'カスタマイズ可能なステータスを管理するテーブル';
COMMENT ON COLUMN status_master.id IS 'ステータスID（UUID）';
COMMENT ON COLUMN status_master.name IS 'ステータス名（ユニーク）';
COMMENT ON COLUMN status_master."displayOrder" IS '表示順';
COMMENT ON COLUMN status_master."isDefault" IS 'デフォルトステータスフラグ';

-- ============================================
-- 3. customers（顧客テーブル）
-- 顧客企業の基本情報を管理
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "companyName" VARCHAR(255) NOT NULL,
    "companyRank" VARCHAR(10) CHECK ("companyRank" IN ('A', 'B', 'C')),
    "assigneeId" UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(255),
    "proposedProducts" TEXT,
    "leadSource" VARCHAR(255),
    "firstContactDate" DATE,
    "firstMeetingDate" DATE,
    "nextMeetingDate" DATE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX idx_customers_assignee_id ON customers("assigneeId");
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_company_rank ON customers("companyRank");

-- コメント
COMMENT ON TABLE customers IS '顧客企業の基本情報を管理するテーブル';
COMMENT ON COLUMN customers.id IS '顧客ID（UUID）';
COMMENT ON COLUMN customers."companyName" IS '会社名（必須）';
COMMENT ON COLUMN customers."companyRank" IS '企業ランク（A/B/C）';
COMMENT ON COLUMN customers."assigneeId" IS '担当者ID（usersテーブルへの外部キー）';
COMMENT ON COLUMN customers.status IS 'ステータス';
COMMENT ON COLUMN customers."proposedProducts" IS '提案製品';
COMMENT ON COLUMN customers."leadSource" IS 'リードソース（獲得経路）';
COMMENT ON COLUMN customers."firstContactDate" IS '初回コンタクト日';
COMMENT ON COLUMN customers."firstMeetingDate" IS '初回面談日';
COMMENT ON COLUMN customers."nextMeetingDate" IS '次回面談予定日';
COMMENT ON COLUMN customers."createdAt" IS '作成日時';
COMMENT ON COLUMN customers."updatedAt" IS '更新日時';

-- ============================================
-- 4. counterparts（カウンターパートテーブル）
-- 顧客側の担当者情報を管理（1顧客に対して複数登録可能）
-- ============================================
CREATE TABLE counterparts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customerId" UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    department VARCHAR(255),
    position VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    rank VARCHAR(10) CHECK (rank IN ('A', 'B', 'C'))
);

-- インデックス
CREATE INDEX idx_counterparts_customer_id ON counterparts("customerId");

-- コメント
COMMENT ON TABLE counterparts IS '顧客側の担当者情報を管理するテーブル（1顧客に対して複数登録可能）';
COMMENT ON COLUMN counterparts.id IS 'カウンターパートID（UUID）';
COMMENT ON COLUMN counterparts."customerId" IS '顧客ID（customersテーブルへの外部キー、CASCADE削除）';
COMMENT ON COLUMN counterparts.department IS '部署';
COMMENT ON COLUMN counterparts.position IS '役職';
COMMENT ON COLUMN counterparts.name IS '氏名（必須）';
COMMENT ON COLUMN counterparts.rank IS 'ランク（A/B/C）';

-- ============================================
-- 5. next_actions（ネクストアクションテーブル）
-- 各顧客に対する次のアクションを管理
-- ============================================
CREATE TABLE next_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customerId" UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "dueDate" DATE,
    "setDate" DATE NOT NULL,
    "assigneeId" UUID REFERENCES users(id) ON DELETE SET NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- インデックス
CREATE INDEX idx_next_actions_customer_id ON next_actions("customerId");
CREATE INDEX idx_next_actions_assignee_id ON next_actions("assigneeId");
CREATE INDEX idx_next_actions_is_active ON next_actions("isActive");

-- コメント
COMMENT ON TABLE next_actions IS '各顧客に対する次のアクションを管理するテーブル';
COMMENT ON COLUMN next_actions.id IS 'アクションID（UUID）';
COMMENT ON COLUMN next_actions."customerId" IS '顧客ID（customersテーブルへの外部キー、CASCADE削除）';
COMMENT ON COLUMN next_actions.content IS 'アクション内容（必須）';
COMMENT ON COLUMN next_actions."dueDate" IS '期限日';
COMMENT ON COLUMN next_actions."setDate" IS '設定日（必須）';
COMMENT ON COLUMN next_actions."assigneeId" IS '担当者ID（usersテーブルへの外部キー）';
COMMENT ON COLUMN next_actions."isActive" IS 'アクティブフラグ（通常、各顧客につき1つのアクティブなアクションのみ）';

-- ============================================
-- 6. meetings（商談記録テーブル）
-- 商談の議事録とリンクを管理
-- ============================================
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customerId" UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    "meetingDate" DATE NOT NULL,
    minutes TEXT,
    "googleDriveLink" VARCHAR(500),
    "circleBackLink" VARCHAR(500),
    "recorderId" UUID REFERENCES users(id) ON DELETE SET NULL
);

-- インデックス
CREATE INDEX idx_meetings_customer_id ON meetings("customerId");
CREATE INDEX idx_meetings_recorder_id ON meetings("recorderId");
CREATE INDEX idx_meetings_meeting_date ON meetings("meetingDate");

-- コメント
COMMENT ON TABLE meetings IS '商談の議事録とリンクを管理するテーブル';
COMMENT ON COLUMN meetings.id IS '商談ID（UUID）';
COMMENT ON COLUMN meetings."customerId" IS '顧客ID（customersテーブルへの外部キー、CASCADE削除）';
COMMENT ON COLUMN meetings."meetingDate" IS '商談日（必須）';
COMMENT ON COLUMN meetings.minutes IS '議事録';
COMMENT ON COLUMN meetings."googleDriveLink" IS 'Google DriveリンクURL';
COMMENT ON COLUMN meetings."circleBackLink" IS 'Circle BackリンクURL';
COMMENT ON COLUMN meetings."recorderId" IS '記録者ID（usersテーブルへの外部キー）';

-- ============================================
-- 7. action_history（アクション履歴テーブル）
-- 過去のアクションの履歴を保存
-- ============================================
CREATE TABLE action_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customerId" UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "executionDate" DATE NOT NULL,
    "recorderId" UUID REFERENCES users(id) ON DELETE SET NULL
);

-- インデックス
CREATE INDEX idx_action_history_customer_id ON action_history("customerId");
CREATE INDEX idx_action_history_execution_date ON action_history("executionDate");

-- コメント
COMMENT ON TABLE action_history IS '過去のアクションの履歴を保存するテーブル（next_actionsが更新される際、古いアクションが自動的に移動される）';
COMMENT ON COLUMN action_history.id IS '履歴ID（UUID）';
COMMENT ON COLUMN action_history."customerId" IS '顧客ID（customersテーブルへの外部キー、CASCADE削除）';
COMMENT ON COLUMN action_history.content IS 'アクション内容（必須）';
COMMENT ON COLUMN action_history."executionDate" IS '実行日（必須）';
COMMENT ON COLUMN action_history."recorderId" IS '記録者ID（usersテーブルへの外部キー）';

-- ============================================
-- 8. priority_rules（優先度ルールテーブル）
-- 条件ベースの優先度判定ルールを管理
-- ============================================
CREATE TABLE priority_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- インデックス
CREATE INDEX idx_priority_rules_is_active ON priority_rules("isActive");

-- コメント
COMMENT ON TABLE priority_rules IS '条件ベースの優先度判定ルールを管理するテーブル';
COMMENT ON COLUMN priority_rules.id IS 'ルールID（UUID）';
COMMENT ON COLUMN priority_rules.name IS 'ルール名（必須）';
COMMENT ON COLUMN priority_rules.conditions IS '条件設定（JSON形式）';
COMMENT ON COLUMN priority_rules."isActive" IS 'アクティブフラグ';

-- conditions構造の説明
COMMENT ON COLUMN priority_rules.conditions IS 'JSON形式: [{"field": "companyRank|counterpartRank|isNew|daysSinceLastAction", "operator": "equals|greaterThan|lessThan|greaterThanOrEqual|lessThanOrEqual", "value": "A|B|C|true|false|number", "logic": "AND|OR"}]';

-- ============================================
-- 9. slack_reminder_rules（Slackリマインダールールテーブル）
-- 定期的なSlack通知のルールを管理
-- ============================================
CREATE TABLE slack_reminder_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly_monday')),
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- インデックス
CREATE INDEX idx_slack_reminder_rules_is_active ON slack_reminder_rules("isActive");
CREATE INDEX idx_slack_reminder_rules_frequency ON slack_reminder_rules(frequency);

-- コメント
COMMENT ON TABLE slack_reminder_rules IS '定期的なSlack通知のルールを管理するテーブル';
COMMENT ON COLUMN slack_reminder_rules.id IS 'ルールID（UUID）';
COMMENT ON COLUMN slack_reminder_rules.name IS 'ルール名（必須）';
COMMENT ON COLUMN slack_reminder_rules.conditions IS '条件設定（priority_rulesと同じ形式、JSON形式）';
COMMENT ON COLUMN slack_reminder_rules.frequency IS '実行頻度（daily: 毎日9:00 / weekly_monday: 毎週月曜9:00）';
COMMENT ON COLUMN slack_reminder_rules."isActive" IS 'アクティブフラグ';

-- ============================================
-- 10. slack_settings（Slack設定テーブル）
-- Slack連携の設定を保存（通常1レコードのみ）
-- ============================================
CREATE TABLE slack_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "webhookUrl" VARCHAR(500),
    "botToken" VARCHAR(500),
    "channelId" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- コメント
COMMENT ON TABLE slack_settings IS 'Slack連携の設定を保存するテーブル（通常1レコードのみ）';
COMMENT ON COLUMN slack_settings.id IS '設定ID（UUID）';
COMMENT ON COLUMN slack_settings."webhookUrl" IS 'Webhook URL（方式1: webhookUrlのみ設定）';
COMMENT ON COLUMN slack_settings."botToken" IS 'Bot Token（方式2: botToken + channelId設定）';
COMMENT ON COLUMN slack_settings."channelId" IS 'Channel ID（方式2: botToken + channelId設定）';
COMMENT ON COLUMN slack_settings."isActive" IS 'アクティブフラグ';

-- ============================================
-- 11. sessions（セッションテーブル）
-- ユーザーセッションの永続化（connect-pg-simple使用）
-- ============================================
CREATE TABLE sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- インデックス
CREATE INDEX idx_sessions_expire ON sessions(expire);

-- コメント
COMMENT ON TABLE sessions IS 'ユーザーセッションの永続化テーブル（connect-pg-simple使用）';
COMMENT ON COLUMN sessions.sid IS 'セッションID（主キー）';
COMMENT ON COLUMN sessions.sess IS 'セッションデータ（JSON形式）';
COMMENT ON COLUMN sessions.expire IS '有効期限';

-- ============================================
-- 更新日時自動更新のトリガー関数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- usersテーブルのupdatedAt自動更新トリガー
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- customersテーブルのupdatedAt自動更新トリガー
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Boost CRM データベーススキーマの作成が完了しました。';
    RAISE NOTICE '作成されたテーブル: users, status_master, customers, counterparts, next_actions, meetings, action_history, priority_rules, slack_reminder_rules, slack_settings, sessions';
END $$;

