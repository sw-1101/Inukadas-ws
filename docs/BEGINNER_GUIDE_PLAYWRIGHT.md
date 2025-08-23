# 🎭 Playwright E2Eテスト 初心者ガイド

## 🎯 Playwrightとは？

**Playwright**は、実際のブラウザを自動操作してWebアプリケーションをテストするツールです。

```
🤖 従来の手動テスト      →    🎭 Playwrightテスト
人間が手でクリック       →    コードで自動クリック
毎回同じ作業を繰り返し    →    一度書けば何度でも実行
見落としが発生          →    確実にチェック
時間がかかる            →    数分で完了
```

### ✨ E2Eテストのメリット

| 利点 | 説明 | 例 |
|------|------|-----|
| 🚀 **自動化** | 手動テストを自動で実行 | ログイン→データ追加→削除の一連の流れ |
| 🔄 **回帰テスト** | 機能追加後の影響を確認 | 新機能で既存機能が壊れていないか |
| 🌐 **クロスブラウザ** | 複数ブラウザで同時テスト | Chrome、Firefox、Safari全てで確認 |
| 📱 **マルチデバイス** | PC・スマホ両方でテスト | デスクトップとモバイルの表示確認 |

---

## 🚀 基本的な使い方

### 1. E2Eテストを実行する

```bash
# すべてのテストを実行
npm run test:e2e

# UIモードで実行（ブラウザが見える）
npm run test:e2e:ui

# テスト結果レポートを表示
npm run test:e2e:report
```

### 2. テスト実行の流れ

```mermaid
flowchart LR
    A[テスト開始] --> B[アプリ起動]
    B --> C[ブラウザ起動]
    C --> D[テスト実行]
    D --> E[結果出力]
    E --> F[アプリ終了]
```

### 3. テスト対象ブラウザ

現在の設定では以下のブラウザでテストが実行されます：

- 🌐 **Chrome** (Chromium)
- 🦊 **Firefox**
- 🧭 **Safari** (WebKit)
- 📱 **Mobile Chrome** (Pixel 5)
- 📱 **Mobile Safari** (iPhone 12)

---

## 🧪 実装されているテスト

### 1. 認証フローテスト (`auth.spec.ts`)

#### ログインページの表示確認
```typescript
test('ログインページが正しく表示される', async ({ page }) => {
  await page.goto('/login')
  
  // 要素が表示されているかチェック
  await expect(page.locator('h1')).toContainText('ログイン')
  await expect(page.locator('input[type="email"]')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toBeVisible()
})
```

#### バリデーションエラーの確認
```typescript
test('空フォームでエラーが表示される', async ({ page }) => {
  await page.goto('/login')
  await page.click('button:has-text("ログイン")')
  
  // エラーメッセージが表示されるかチェック
  await expect(page.locator('text=メールアドレスを入力してください')).toBeVisible()
  await expect(page.locator('text=パスワードを入力してください')).toBeVisible()
})
```

### 2. コンポーネントテスト (`components.spec.ts`)

#### ローディング状態の確認
```typescript
test('ローディングスピナーが表示される', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button:has-text("ログイン")')
  
  // ローディング状態になるかチェック
  await expect(page.locator('button:has-text("ログイン中...")')).toBeVisible()
})
```

### 3. ナビゲーションテスト (`navigation.spec.ts`)

ページ間の移動が正しく動作するかテストします。

---

## 📝 テストの書き方

### 1. 基本的なテストファイル構造

```typescript
// example.spec.ts
import { test, expect } from '@playwright/test'

test.describe('機能名', () => {
  // 各テスト前に実行される処理
  test.beforeEach(async ({ page }) => {
    await page.goto('/target-page')
  })

  test('テストケース名', async ({ page }) => {
    // テストの内容を書く
  })
})
```

### 2. よく使う操作

#### ページの操作
```typescript
// ページに移動
await page.goto('/login')

// 要素をクリック
await page.click('button:has-text("ログイン")')

// テキストを入力
await page.fill('input[type="email"]', 'test@example.com')

// キーボード操作
await page.press('input', 'Enter')
```

#### 要素の確認
```typescript
// 要素が表示されているか
await expect(page.locator('h1')).toBeVisible()

// テキストの内容を確認
await expect(page.locator('h1')).toContainText('ログイン')

// 要素が存在するか
await expect(page.locator('#error-message')).toBeVisible()

// URLの確認
await expect(page).toHaveURL('/dashboard')
```

### 3. 実際のテスト例

```typescript
test('ユーザー登録フロー', async ({ page }) => {
  // 1. 登録ページに移動
  await page.goto('/register')
  
  // 2. フォームに入力
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.fill('input[name="confirmPassword"]', 'password123')
  
  // 3. 登録ボタンをクリック
  await page.click('button:has-text("登録")')
  
  // 4. 成功した場合の確認
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('text=登録が完了しました')).toBeVisible()
})
```

---

## 🎮 UIモードで視覚的にテストする

### UIモードの使い方

```bash
# UIモードでテスト実行
npm run test:e2e:ui
```

UIモードでは以下ができます：

```
┌─────────────────────────────────────────────┐
│ 📋 テスト一覧（左）    │ 🖥️ ブラウザ画面（右）  │
│                      │                      │
│ ✅ auth.spec.ts      │  ┌─────────────────┐  │
│   ├── ログイン確認    │  │                 │  │
│   ├── バリデーション  │  │   実際のWebページ  │  │
│   └── ...           │  │                 │  │
│ ⏸️ components.spec.ts │  └─────────────────┘  │
│   ├── ローディング    │                      │
│   └── ...           │  🎮 操作コントロール    │
│                      │  ステップ実行・巻き戻し │
└─────────────────────────────────────────────┘
```

### デバッグ機能

- **⏯️ ステップ実行**: テストを一歩ずつ実行
- **⏪ 巻き戻し**: 前の状態に戻す
- **📸 スクリーンショット**: 各ステップの画面を保存
- **🔍 要素検査**: クリックした要素をハイライト

---

## 🔧 設定ファイルの理解

### `playwright.config.ts` の主要設定

```typescript
export default defineConfig({
  testDir: './e2e',                    // テストファイルの場所
  fullyParallel: true,                 // 並列実行で高速化
  retries: process.env.CI ? 2 : 0,     // 失敗時の再試行回数
  workers: process.env.CI ? 1 : undefined, // 並列実行数
  
  use: {
    baseURL: 'http://localhost:5173',  // テスト対象のURL
    trace: 'on-first-retry',           // トレース記録
    screenshot: 'only-on-failure',     // スクリーンショット撮影
  },
  
  webServer: {
    command: 'npm run dev',            // 自動でアプリを起動
    port: 5173,
  },
})
```

---

## 📊 テスト結果の見方

### 1. コンソール出力

```bash
Running 15 tests using 3 workers

  ✓ auth.spec.ts:8:3 › should display login page (2s)
  ✓ auth.spec.ts:15:3 › should show validation errors (1s)
  ✗ auth.spec.ts:21:3 › should navigate to register (3s)

  1 failed
    auth.spec.ts:21:3 › should navigate to register
    Error: expect(locator).toBeVisible()
    Expected: visible
    Received: hidden
```

### 2. HTMLレポート

```bash
# レポートを表示
npm run test:e2e:report
```

HTMLレポートでは以下が確認できます：

- 📊 **テスト結果サマリー**: 成功/失敗の統計
- 📸 **失敗時スクリーンショット**: エラー発生時の画面
- 🎬 **トレース動画**: テスト実行の録画
- 📋 **詳細ログ**: 各ステップの実行内容

---

## 🛠️ 実際のテスト作成例

### 新しいテストファイルを作る

```bash
# 新しいテストファイル作成
touch e2e/user-profile.spec.ts
```

```typescript
// e2e/user-profile.spec.ts
import { test, expect } from '@playwright/test'

test.describe('ユーザープロフィール', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン済み状態からスタート
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("ログイン")')
    await page.waitForURL('/dashboard')
  })

  test('プロフィール編集', async ({ page }) => {
    // プロフィールページに移動
    await page.click('a:has-text("プロフィール")')
    await expect(page).toHaveURL('/profile')
    
    // 名前を変更
    await page.fill('input[name="name"]', '新しい名前')
    await page.click('button:has-text("保存")')
    
    // 成功メッセージの確認
    await expect(page.locator('text=保存しました')).toBeVisible()
  })
})
```

---

## 💡 実践的なTips

### 1. 待機の使い方

```typescript
// 要素が表示されるまで待機
await page.waitForSelector('button:has-text("保存")')

// ページが読み込まれるまで待機
await page.waitForLoadState('networkidle')

// URLが変わるまで待機
await page.waitForURL('/dashboard')

// 特定の時間だけ待機（非推奨）
await page.waitForTimeout(1000)
```

### 2. データテストIDの活用

```typescript
// HTMLでdata-testid属性を設定
<button data-testid="login-button">ログイン</button>

// テストでは以下で取得
await page.click('[data-testid="login-button"]')
```

### 3. 環境別設定

```typescript
// 開発環境とテスト環境でURLを切り替え
const baseURL = process.env.CI 
  ? 'https://test-app.example.com' 
  : 'http://localhost:5173'
```

---

## 🚨 よくある問題と解決法

### Q1: テストが失敗する

```bash
# 詳細なログを出力
npm run test:e2e -- --debug

# 特定のテストだけ実行
npm run test:e2e -- auth.spec.ts

# UIモードでステップ実行
npm run test:e2e:ui
```

### Q2: 要素が見つからない

```typescript
// より具体的なセレクターを使う
// ❌ 曖昧
await page.click('button')

// ✅ 具体的
await page.click('button:has-text("ログイン")')
await page.click('[data-testid="login-button"]')
```

### Q3: タイムアウトエラー

```typescript
// タイムアウト時間を延長
await expect(page.locator('#slow-element')).toBeVisible({ timeout: 10000 })

// 代替案：要素の状態を確認してから操作
await page.waitForSelector('#slow-element')
await page.click('#slow-element')
```

### Q4: 非同期処理の待機

```typescript
// APIコール完了を待つ
await page.click('button:has-text("データ取得")')
await page.waitForResponse('**/api/data')
await expect(page.locator('#data-list')).toBeVisible()
```

---

## 📈 テスト品質向上のコツ

### 1. テストの独立性

```typescript
// ✅ 良い例：各テストが独立
test('テスト1', async ({ page }) => {
  await page.goto('/start')
  // テスト内容
})

test('テスト2', async ({ page }) => {
  await page.goto('/start') // 毎回同じ状態から開始
  // テスト内容
})
```

### 2. 明確なテスト名

```typescript
// ❌ 曖昧
test('ボタンテスト', async ({ page }) => {})

// ✅ 具体的
test('ログインボタンをクリックするとダッシュボードに移動する', async ({ page }) => {})
```

### 3. 適切なアサーション

```typescript
// 単一の確認だけでなく、複数の確認を組み合わせる
test('データ保存機能', async ({ page }) => {
  await page.click('button:has-text("保存")')
  
  // 複数の観点で成功を確認
  await expect(page.locator('text=保存しました')).toBeVisible()      // 成功メッセージ
  await expect(page.locator('#save-button')).not.toBeDisabled()    // ボタン状態
  await expect(page).toHaveURL(/.*dashboard.*/)                    // URL変化
})
```

---

## 🎯 継続的インテグレーション(CI)での活用

### GitHub Actionsでの自動実行

プロジェクトではプルリクエスト作成時に自動でE2Eテストが実行されます：

```yaml
# .github/workflows/ci.yml (一部)
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### CI環境での特別設定

```typescript
// CI環境では以下の最適化が適用されます
retries: process.env.CI ? 2 : 0,        // 失敗時2回まで再試行
workers: process.env.CI ? 1 : undefined, // CI環境では並列度を制限
```

---

## 🎉 まとめ

E2Eテストを活用することで：

1. 🤖 **手動テストの自動化** - 繰り返し作業から解放
2. 🔄 **回帰テストの確実な実行** - 新機能追加時の安心感
3. 🌐 **クロスブラウザ対応** - 複数環境での品質保証
4. 📱 **マルチデバイス対応** - PC・モバイル両方の確認

継続的にE2Eテストを書いて、高品質なアプリケーションを開発していきましょう！

---

## 🎓 次のステップ

1. **既存テストを実行してみる** - `npm run test:e2e:ui`
2. **UIモードでテストを観察** - どんな操作をしているか確認
3. **簡単なテストを書いてみる** - 新しいページのテストを追加
4. **失敗テストをデバッグ** - 問題解決のスキルを身につける

---

## 📞 困ったときは

- 🎭 [Playwright公式ドキュメント](https://playwright.dev/docs) - 詳細な使い方
- 📋 [プロジェクトREADME](../README.md) - 全体的な開発ガイド
- 💬 チームに質問 - 分からないことは遠慮なく聞いてください！