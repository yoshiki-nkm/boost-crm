# GitHub認証設定

## 方法1: Personal Access Token (PAT) を使用（推奨）

### ステップ1: GitHubでPersonal Access Tokenを作成
1. GitHubにログイン
2. 右上のプロフィール画像をクリック → **Settings**
3. 左サイドバーの一番下にある **Developer settings**
4. **Personal access tokens** → **Tokens (classic)**
5. **Generate new token** → **Generate new token (classic)**
6. Note（メモ）: `boost-crm` など適当な名前を入力
7. Expiration（有効期限）: 適切な期間を選択（例: 90 days）
8. **Select scopes**: `repo` にチェック（リポジトリへの完全なアクセス）
9. **Generate token** をクリック
10. **トークンをコピー**（この画面を閉じると二度と見れません！）

### ステップ2: リモートURLを更新してプッシュ
```bash
# リモートURLを更新（トークンを使用）
git remote set-url origin https://YOUR_TOKEN@github.com/yoshiki-nkm/boost-crm.git

# プッシュ
git push -u origin main
```

または、プッシュ時にトークンを入力する方法：
```bash
# 通常のURLのまま、プッシュ時にユーザー名とトークンを入力
git push -u origin main
# Username: yoshiki-nkm
# Password: [作成したトークンを貼り付け]
```

## 方法2: SSH鍵を使用

### ステップ1: SSH鍵を生成（まだの場合）
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Enterキーを3回押してデフォルト設定で生成
```

### ステップ2: 公開鍵をGitHubに追加
```bash
# 公開鍵をコピー
cat ~/.ssh/id_ed25519.pub
```

1. GitHub → Settings → **SSH and GPG keys**
2. **New SSH key** をクリック
3. Title: `MacBook` など適当な名前
4. Key: コピーした公開鍵を貼り付け
5. **Add SSH key** をクリック

### ステップ3: SSH URLに変更してプッシュ
```bash
# リモートURLをSSHに変更
git remote set-url origin git@github.com:yoshiki-nkm/boost-crm.git

# プッシュ
git push -u origin main
```

## 方法3: GitHub CLIを使用

### ステップ1: GitHub CLIをインストール（まだの場合）
```bash
brew install gh
```

### ステップ2: 認証
```bash
gh auth login
# ブラウザで認証が完了します
```

### ステップ3: プッシュ
```bash
git push -u origin main
```

## 推奨方法
**方法1（PAT）** または **方法2（SSH）** が推奨です。
SSHの方がセキュリティが高く、一度設定すれば使いやすいです。

