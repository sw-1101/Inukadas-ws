# Vercelへのデプロイ設定・実行ガイド

このガイドでは、ReactアプリケーションをVercelにデプロイする方法を初学者向けに分かりやすく説明します。

## 目次

1. [Vercelとは](#vercelとは)
2. [事前準備](#事前準備)
3. [Vercelアカウントの作成](#vercelアカウントの作成)
4. [プロジェクトの設定](#プロジェクトの設定)
5. [デプロイ方法](#デプロイ方法)
6. [環境変数の設定](#環境変数の設定)
7. [デプロイ後の確認方法](#デプロイ後の確認方法)
8. [トラブルシューティング](#トラブルシューティング)

---

## Vercelとは

Vercelは、Webアプリケーションを簡単にデプロイできるクラウドプラットフォームです。主な特徴：

- **高速デプロイ**: GitHubと連携して自動デプロイ
- **CDN対応**: 世界中に高速配信
- **プレビュー機能**: プルリクエストごとに専用URL
- **無料プラン**: 個人・小規模プロジェクトに最適

---

## 事前準備

### 必要なもの

- GitHubアカウント
- プロジェクトがGitHubリポジトリにプッシュされていること
- Node.jsがインストールされていること（開発環境）

### プロジェクトの確認

以下のファイルが存在することを確認してください：

```
プロジェクトルート/
├── package.json          # ビルドスクリプトが含まれている
├── vercel.json           # Vercel設定ファイル（今回のプロジェクトでは既に存在）
└── src/                  # ソースコード
```

---

## Vercelアカウントの作成

### 1. Vercel公式サイトにアクセス

[https://vercel.com](https://vercel.com) にアクセスします。

### 2. アカウント作成

1. 「Continue with GitHub」をクリック
2. GitHubアカウントでログイン
3. Vercelからのアクセス許可を承認

---

## プロジェクトの設定

### 1. 新しいプロジェクトの作成

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリ一覧から対象のリポジトリを選択
3. 「Import」をクリック

### 2. ビルド設定の確認

Vercelが自動的に検出する設定：

```json
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

これらの設定は、プロジェクト内の`vercel.json`で既に定義されています：

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci"
}
```

### 3. ブランチ設定

`vercel.json`で以下のブランチがデプロイ対象として設定されています：

- `main`: プロダクション環境
- `develop`: 開発・プレビュー環境

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

---

## デプロイ方法

### 方法1: GitHubプッシュによる自動デプロイ（推奨）

1. **メインブランチへのプッシュ**
   ```bash
   git checkout main
   git add .
   git commit -m "デプロイ用のコミット"
   git push origin main
   ```

2. **開発ブランチへのプッシュ**
   ```bash
   git checkout develop
   git add .
   git commit -m "開発版のデプロイ"
   git push origin develop
   ```

### 方法2: Vercel CLIを使った手動デプロイ

1. **Vercel CLIのインストール**
   ```bash
   npm i -g vercel
   ```

2. **ログイン**
   ```bash
   vercel login
   ```

3. **デプロイ実行**
   ```bash
   # プレビューデプロイ
   vercel

   # プロダクションデプロイ
   vercel --prod
   ```

---

## 環境変数の設定

このプロジェクトでは以下の環境変数が必要です：

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_FIREBASE_API_KEY` | Firebase API キー | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase認証ドメイン | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | FirebaseプロジェクトID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebaseストレージバケット | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebaseメッセージング送信者ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase アプリID | `1:123...:web:abc...` |
| `VITE_GEMINI_API_KEY` | Gemini API キー | `AIzaSyD...` |

### Vercelでの環境変数設定手順

1. **Vercelダッシュボードでプロジェクトを選択**

2. **Settings タブをクリック**

3. **Environment Variables セクションに移動**

4. **環境変数を追加**
   - Name: 変数名（例: `VITE_FIREBASE_API_KEY`）
   - Value: 実際の値
   - Environment: 
     - `Production` (mainブランチ用)
     - `Preview` (developブランチ用)
     - `Development` (ローカル開発用)

5. **Save をクリック**

### 環境別設定

`vercel.json`では環境別の設定も可能です：

```json
{
  "preview": {
    "develop": {
      "env": {
        "VITE_FIREBASE_API_KEY": "@vite-firebase-api-key-dev",
        "VITE_FIREBASE_AUTH_DOMAIN": "@vite-firebase-auth-domain-dev",
        "VITE_FIREBASE_PROJECT_ID": "@vite-firebase-project-id-dev"
      }
    }
  }
}
```

---

## デプロイ後の確認方法

### 1. デプロイステータスの確認

1. **Vercelダッシュボード**で「Deployments」タブを確認
2. **ステータス表示**:
   - ✅ Ready: デプロイ成功
   - 🔄 Building: ビルド中
   - ❌ Error: エラー発生

### 2. デプロイされたサイトの確認

1. **プロダクション環境** (mainブランチ)
   - `https://your-project-name.vercel.app`

2. **プレビュー環境** (developブランチ)
   - `https://your-project-name-git-develop-username.vercel.app`

### 3. 機能テスト

デプロイ後、以下の機能が正常に動作することを確認：

- [ ] ユーザー認証（ログイン・登録）
- [ ] Firebase連携
- [ ] 音声録音・再生機能
- [ ] メモの作成・表示
- [ ] レスポンシブデザイン

---

## トラブルシューティング

### よくあるエラーと解決方法

#### 1. ビルドエラー

**エラー**: `Module not found` または `Command failed`

**解決方法**:
```bash
# ローカルでビルドテスト
npm run build

# 依存関係の更新
npm ci
```

#### 2. 環境変数エラー

**エラー**: `Firebase: No Firebase App '[DEFAULT]' has been created`

**解決方法**:
1. Vercelダッシュボードで環境変数が正しく設定されているか確認
2. 変数名が`VITE_`で始まっているか確認
3. プロダクション/プレビューの両方に設定されているか確認

#### 3. 404エラー（ページが見つからない）

**エラー**: ルーティングで404エラー

**解決方法**:
`vercel.json`にリライトルールが設定されているか確認：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 4. デプロイが開始されない

**原因と解決方法**:

1. **GitHubとの連携確認**
   - Vercelダッシュボード → Settings → Git Integration

2. **ブランチ設定確認**
   - `vercel.json`の`deploymentEnabled`設定を確認

3. **手動デプロイ**
   ```bash
   vercel --prod
   ```

### パフォーマンス最適化

#### 1. ビルドサイズの確認

```bash
npm run build
```

`dist`フォルダのサイズを確認し、不要なファイルがないかチェック。

#### 2. プレビューでの動作確認

```bash
npm run preview
```

ローカルでプロダクションビルドをテスト。

---

## まとめ

このガイドに従うことで：

1. ✅ Vercelアカウントの作成・設定
2. ✅ GitHubとの連携による自動デプロイ
3. ✅ 環境変数の適切な設定
4. ✅ プロダクション・プレビュー環境の構築
5. ✅ トラブルシューティング方法の習得

が可能になります。

### 次のステップ

- [GitHub Actions CI/CDガイド](./GITHUB_ACTIONS_CICD_GUIDE.md) でさらに高度な自動化を学習
- Vercelの分析機能を使ったパフォーマンス監視
- カスタムドメインの設定

---

## 関連リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Viteデプロイガイド](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Firebase + Vercel連携](https://firebase.google.com/docs/hosting/vercel-integration)