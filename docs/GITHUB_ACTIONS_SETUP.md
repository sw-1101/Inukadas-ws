# GitHub Actions セットアップ完全ガイド

## 🎯 このガイドの目的

GitHub Actions を使用して以下を自動化します：
- ✅ コード品質チェック（TypeScript + ESLint）
- ✅ 自動テスト実行
- ✅ 自動ビルド
- ✅ Firebase Hosting への自動デプロイ
- ✅ プレビュー環境の自動構築

---

## 📋 前提条件

### 必要なもの
- [x] GitHub アカウント
- [x] Firebase プロジェクト
- [x] Firebase CLI インストール済み
- [x] 本React プロジェクト

### 確認方法
```bash
# Firebase CLI がインストールされているか確認
firebase --version

# プロジェクトが正常にビルドできるか確認
npm run build
```

---

## 🔥 Step 1: Firebase プロジェクト設定

### 1.1 Firebase プロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. **「プロジェクトを追加」** をクリック
3. プロジェクト名を入力（例: `react-firebase-cicd-test`）
4. Google Analytics は **無効** に設定（学習用のため）

### 1.2 Authentication 設定
```bash
Firebase Console → Authentication → 始める → Sign-in method
→ メール/パスワード を有効化
```

### 1.3 Firestore 設定
```bash
Firebase Console → Firestore Database → データベース作成
→ テストモードで開始 → ロケーション: asia-northeast1
```

### 1.4 Web アプリ追加
```bash
Firebase Console → プロジェクト設定（⚙️） → アプリ
→ アプリを追加 → Web（</>） → アプリ名入力 → アプリを登録
```

**⚠️ 重要**: 表示される設定情報をコピーして保存
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",              // ← この値をコピー
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",      // ← この値をコピー
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",    // ← この値をコピー
  appId: "1:123456789:web:abcdef"    // ← この値をコピー
};
```

---

## 🔑 Step 2: Firebase Service Account 作成

### 2.1 サービスアカウント作成
```bash
# Firebase にログイン
firebase login

# プロジェクト一覧確認
firebase projects:list

# 使用するプロジェクトを設定
firebase use your-project-id

# Hosting を初期化
firebase init hosting
```

**初期化設定値**:
```bash
? What do you want to use as your public directory? dist
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? No
? File dist/index.html already exists. Overwrite? No
```

### 2.2 GitHub Actions用サービスアカウント生成
```bash
# Firebase Console にアクセス
# プロジェクト設定 → サービスアカウント → 「新しい秘密鍵の生成」

# または CLI で生成
firebase projects:list
# プロジェクトIDを確認してから以下実行
```

**手動での取得方法**:
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 該当プロジェクトを選択
3. **IAM と管理** → **サービス アカウント**
4. **サービス アカウントを作成**
5. 名前: `github-actions-deployer`
6. 役割: **Firebase Hosting 管理者** を追加
7. **キーを作成** → **JSON** → ダウンロード

---

## 🔐 Step 3: GitHub Secrets 設定

### 3.1 GitHub リポジトリでSecrets設定
GitHub リポジトリページで：
```
Settings → Secrets and variables → Actions → New repository secret
```

### 3.2 設定する Secrets 一覧

| Secret 名 | 値の取得場所 | 例 |
|-----------|-------------|-----|
| `VITE_FIREBASE_API_KEY` | Firebase設定 > apiKey | `AIzaSyC_example_key` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase設定 > authDomain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase設定 > projectId | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase設定 > storageBucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase設定 > messagingSenderId | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase設定 > appId | `1:123456789:web:abcdef` |
| `FIREBASE_PROJECT_ID` | プロジェクトID（上と同じ） | `your-project-id` |
| `FIREBASE_SERVICE_ACCOUNT` | サービスアカウントJSON | JSON全体をコピー |

### 3.3 Secrets 設定手順（詳細）

#### 3.3.1 Firebase設定値のSecrets
```bash
# 各設定値を1つずつ追加
Name: VITE_FIREBASE_API_KEY
Secret: AIzaSyC_your_actual_api_key

Name: VITE_FIREBASE_AUTH_DOMAIN  
Secret: your-project.firebaseapp.com

# 以下同様に全て設定...
```

#### 3.3.2 サービスアカウントJSON の設定
```bash
Name: FIREBASE_SERVICE_ACCOUNT
Secret: 
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**⚠️ 注意**: JSON全体をそのままコピーペーストしてください。

---

## 🚀 Step 4: GitHub Actions 動作確認

### 4.1 初回テスト実行
```bash
# ローカルでファイルをコミット・プッシュ
git add .
git commit -m "feat: add GitHub Actions CI/CD pipeline"
git push origin main
```

### 4.2 GitHub Actions 確認
1. GitHub リポジトリページ
2. **Actions** タブをクリック
3. **CI/CD Pipeline** ワークフローを確認

### 4.3 期待される結果

**✅ 成功パターン**:
```
🧪 Test & Build (18.x) ✅
🧪 Test & Build (20.x) ✅  
🚀 Deploy to Production ✅
```

**❌ 失敗パターンと対処法**:

| エラー | 原因 | 対処法 |
|--------|------|--------|
| `VITE_FIREBASE_API_KEY is not defined` | Secrets設定不足 | Step 3を再確認 |
| `Permission denied` | サービスアカウント権限不足 | Firebase Console で権限追加 |
| `Build failed` | TypeScriptエラー | `npm run type-check` で確認 |
| `Firebase project not found` | PROJECT_ID間違い | Firebase Console で確認 |

---

## 🔍 Step 5: プルリクエストでのテスト

### 5.1 テスト用ブランチ作成
```bash
# 新しいブランチを作成
git checkout -b feature/test-ci-cd

# 軽微な変更を加える
echo "# CI/CD Test" >> TEST.md
git add TEST.md
git commit -m "test: add test file for CI/CD verification"
git push origin feature/test-ci-cd
```

### 5.2 プルリクエスト作成
1. GitHub でプルリクエストを作成
2. **base: main** ← **compare: feature/test-ci-cd**
3. タイトル: `test: CI/CD pipeline verification`

### 5.3 期待される動作確認

**プルリクエスト作成後に実行されるべき項目**:
- ✅ TypeScript型チェック
- ✅ ESLint 実行
- ✅ テスト実行
- ✅ ビルド確認
- ✅ セキュリティスキャン
- ✅ プレビュー環境デプロイ
- ✅ プレビューURL の自動コメント

**プレビューコメント例**:
```markdown
## 🌐 プレビュー環境デプロイ完了

**プレビューURL**: https://your-project--pr-1-abcd1234.web.app

### 📋 確認項目
- [ ] ログイン・ログアウト機能
- [ ] データ作成・編集・削除
- [ ] プロフィール更新
- [ ] レスポンシブデザイン
- [ ] パフォーマンス

> このプレビューは7日後に自動削除されます
```

---

## 📊 Step 6: 動作確認チェックリスト

### 6.1 CI/CD パイプライン確認
- [ ] **main ブランチプッシュ時**
  - [ ] テスト実行 ✅
  - [ ] ビルド成功 ✅
  - [ ] 本番デプロイ ✅
  - [ ] デプロイURL アクセス可能 ✅

- [ ] **プルリクエスト時**  
  - [ ] テスト実行 ✅
  - [ ] ビルド成功 ✅
  - [ ] セキュリティスキャン ✅
  - [ ] プレビューデプロイ ✅
  - [ ] プレビューURL コメント ✅

### 6.2 Firebase Hosting 確認
```bash
# デプロイされたサイトにアクセス
https://your-project-id.firebaseapp.com

# 以下の機能が正常動作するか確認
1. ユーザー登録
2. ログイン・ログアウト
3. データ作成・編集
4. レスポンシブデザイン
```

### 6.3 パフォーマンス確認
```bash
# 実行時間の目安
- TypeScript チェック: 30秒以内
- ESLint: 15秒以内  
- ビルド: 1分以内
- デプロイ: 2分以内
- 全体: 5分以内
```

---

## 🔧 トラブルシューティング

### よくある問題と解決法

#### 問題1: Firebase Authentication エラー
```bash
エラー: FirebaseError: Firebase: Error (auth/project-not-found)
```
**解決法**:
```bash
1. Firebase Console でプロジェクトID確認
2. VITE_FIREBASE_PROJECT_ID の値を確認
3. Authentication が有効化されているか確認
```

#### 問題2: Secrets アクセスエラー
```bash
エラー: Error: Input required and not supplied: firebaseServiceAccount
```
**解決法**:
```bash
1. GitHub Secrets でFIREBASE_SERVICE_ACCOUNT確認
2. JSON フォーマットが正しいか確認
3. サービスアカウントの権限確認
```

#### 問題3: ビルドエラー
```bash
エラー: TypeScript error in src/components/...
```
**解決法**:
```bash
# ローカルで事前チェック
npm run type-check
npm run lint
npm run build

# エラー修正後再プッシュ
```

#### 問題4: デプロイ権限エラー
```bash
エラー: Error: HTTP Error: 403, The caller does not have permission
```
**解決法**:
```bash
1. Firebase Console → IAM で権限確認
2. サービスアカウントに「Firebase Hosting 管理者」権限追加
3. 新しいサービスアカウントキー生成・設定
```

---

## 🎉 セットアップ完了！

### ✅ 完了確認項目
- [ ] Firebase プロジェクト作成・設定完了
- [ ] GitHub Secrets 全設定完了
- [ ] CI/CD パイプライン動作確認
- [ ] 本番環境デプロイ成功
- [ ] プレビュー環境動作確認

### 🚀 次のステップ

**Task #16 完了** → **Task #17 開始**

次は Storybook を使ったコンポーネントテスト環境を構築します！

### 📞 サポート

問題が発生した場合：
1. [GitHub Actions ログ](https://github.com/your-repo/actions) を確認
2. [Firebase Console](https://console.firebase.google.com/) でプロジェクト状況確認  
3. 本ドキュメントのトラブルシューティング参照

CI/CD環境の基盤が完成しました！🎉