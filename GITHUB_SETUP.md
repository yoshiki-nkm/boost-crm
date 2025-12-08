# GitHub連携手順

## 方法1: 新しいリポジトリを作成する場合

### ステップ1: GitHubでリポジトリを作成
1. GitHubにログインして、https://github.com/new にアクセス
2. リポジトリ名を入力（例: `boost-crm`）
3. 説明を追加（オプション）
4. **Public** または **Private** を選択
5. **「Initialize this repository with a README」はチェックしない**（既にローカルにコードがあるため）
6. 「Create repository」をクリック

### ステップ2: ローカルで変更をコミット
```bash
# 変更をステージング
git add .

# コミット
git commit -m "Initial commit: Boost CRM setup"

# リモートリポジトリを追加（YOUR_USERNAMEとYOUR_REPO_NAMEを置き換えてください）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# メインブランチをプッシュ
git push -u origin main
```

## 方法2: 既存のリポジトリに接続する場合

### ステップ1: 既存のリポジトリのURLを取得
GitHubのリポジトリページで「Code」ボタンをクリックしてURLをコピー

### ステップ2: ローカルで変更をコミットして接続
```bash
# 変更をステージング
git add .

# コミット
git commit -m "Initial commit: Boost CRM setup"

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# メインブランチをプッシュ
git push -u origin main
```

## 方法3: SSHを使用する場合

### ステップ1: SSH鍵を設定（まだの場合）
```bash
# SSH鍵を生成（まだ持っていない場合）
ssh-keygen -t ed25519 -C "your_email@example.com"

# SSH鍵をGitHubに追加
# 1. 公開鍵をコピー
cat ~/.ssh/id_ed25519.pub

# 2. GitHub > Settings > SSH and GPG keys > New SSH key に貼り付け
```

### ステップ2: SSH URLで接続
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## よくある問題と解決方法

### エラー: "remote origin already exists"
既存のリモートを削除してから追加：
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### エラー: "failed to push some refs"
リモートに既にコミットがある場合：
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## 今後の作業フロー

### 変更をプッシュする場合
```bash
git add .
git commit -m "コミットメッセージ"
git push
```

### 最新の変更を取得する場合
```bash
git pull
```

