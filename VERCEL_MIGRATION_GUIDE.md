# 🚀 Vercel Edge Functions 移行ガイド

## 📋 概要
Gemini APIキーをクライアント側（VITE環境変数）から、Vercel Edge Functions（サーバー側）に移行する手順書です。

## ✅ 完了した作業
1. ✅ `/api/gemini.js` - Vercel Edge Function作成
2. ✅ `vercel.json` - Vercel設定更新
3. ✅ `src/services/geminiService.js` - API呼び出しを更新
4. ✅ `src/services/audio/transcriptionService.js` - API呼び出しを更新

## 📝 必要な作業

### 1. Vercelアカウントのセットアップ

1. [Vercel](https://vercel.com)にアクセスしてアカウント作成
2. GitHubアカウントと連携

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリ（Inukadas-ws）を選択
3. プロジェクト設定：
   - Framework Preset: `Vite`
   - Build Command: `npm run build`（自動検出される）
   - Output Directory: `dist`（自動検出される）

### 3. 環境変数の設定

Vercelダッシュボード → Settings → Environment Variables で以下を追加：

#### 必須の環境変数

```bash
# Gemini API
GEMINI_API_KEY=あなたのGemini_APIキー

# Firebase Admin SDK（Firebase Admin SDKの認証情報）
FIREBASE_PROJECT_ID=あなたのプロジェクトID
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@yourproject.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nあなたのプライベートキー\n-----END PRIVATE KEY-----\n"
```

#### Firebase Admin SDKキーの取得方法

1. [Firebase Console](https://console.firebase.google.com)にアクセス
2. プロジェクト設定 → サービスアカウント
3. 「新しい秘密鍵の生成」をクリック
4. JSONファイルがダウンロードされる
5. JSONから以下の値をコピー：
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

⚠️ **重要**: `FIREBASE_PRIVATE_KEY`の改行文字（\n）はそのまま保持してください

### 4. デプロイ

```bash
# Vercel CLIを使用する場合
npm i -g vercel
vercel

# またはGitHubにpushすると自動デプロイ
git push origin main
```

### 5. ローカル開発環境の設定

開発時はVercel CLIを使用：

```bash
# インストール
npm i -g vercel

# ローカルで実行（.env.localが必要）
vercel dev
```

`.env.local`（Vercel開発用）を作成：
```env
GEMINI_API_KEY=あなたのGemini_APIキー
FIREBASE_PROJECT_ID=あなたのプロジェクトID
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@yourproject.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nあなたのプライベートキー\n-----END PRIVATE KEY-----\n"
```

### 6. 既存の環境変数のクリーンアップ

デプロイが成功したら、元の`.env.local`から以下を削除：
```env
VITE_GEMINI_API_KEY=xxxxx  # ← この行を削除
```

## 🔍 動作確認

1. Vercelにデプロイ後、提供されたURLにアクセス
2. ログイン
3. メモ作成、音声録音、ファイルアップロードをテスト
4. ブラウザの開発者ツールでAPIキーが露出していないことを確認

## 🚨 トラブルシューティング

### CORS エラーが出る場合
- `vercel.json`のheaders設定を確認
- API_ENDPOINTのURLが正しいか確認

### 認証エラーが出る場合
- Firebase Admin SDKの認証情報が正しいか確認
- 環境変数が正しく設定されているか確認

### API呼び出しが失敗する場合
- Vercelダッシュボードの「Functions」タブでログを確認
- 環境変数`GEMINI_API_KEY`が設定されているか確認

## 📚 参考リンク

- [Vercel Edge Functions ドキュメント](https://vercel.com/docs/functions/edge-functions)
- [Firebase Admin SDK セットアップ](https://firebase.google.com/docs/admin/setup)
- [Google Gemini API](https://ai.google.dev/)

## ✅ チェックリスト

- [ ] Vercelアカウント作成
- [ ] GitHubリポジトリ連携
- [ ] 環境変数設定（GEMINI_API_KEY）
- [ ] 環境変数設定（Firebase Admin SDK）
- [ ] デプロイ実行
- [ ] 動作確認
- [ ] 旧環境変数（VITE_GEMINI_API_KEY）削除

---

作成日: 2025年1月29日
最終更新: 2025年1月29日