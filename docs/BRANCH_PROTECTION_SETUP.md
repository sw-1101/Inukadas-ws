# ブランチ保護設定ガイド

## 🎯 目的

mainブランチへの直接プッシュを防ぎ、すべての変更をプルリクエスト経由で行うことで、コード品質を確保します。

---

## 🛡️ ブランチ保護ルールの設定

### Step 1: GitHub リポジトリ設定にアクセス

1. GitHubリポジトリページを開く
2. **Settings** タブをクリック
3. 左メニューから **Branches** をクリック

### Step 2: mainブランチ保護ルール追加

1. **Add rule** ボタンをクリック
2. **Branch name pattern** に `main` を入力

### Step 3: 保護設定の詳細設定

以下の項目にチェックを入れてください：

#### 🔒 基本保護設定
- ☑️ **Require a pull request before merging**
  - ☑️ **Require approvals**: `1` (最低1人の承認が必要)
  - ☑️ **Dismiss stale reviews when new commits are pushed** (新しいコミット時に古いレビューを無効化)
  - ☑️ **Require review from code owners** (コードオーナーからのレビューが必要)

#### ✅ ステータスチェック設定
- ☑️ **Require status checks to pass before merging**
  - ☑️ **Require branches to be up to date before merging**
  - **必須ステータスチェック項目**を追加:
    - `📝 Static Analysis`
    - `🧪 Unit Tests` 
    - `📚 Component Tests (Storybook)`
    - `🎭 E2E Tests (Playwright)`
    - `🔒 Security Scan`

#### 🚫 追加制限
- ☑️ **Restrict pushes that create files** (mainブランチへの直接プッシュを制限)
- ☑️ **Require linear history** (マージコミットを避け、リニアな履歴を維持)
- ☑️ **Include administrators** (管理者にもルールを適用)

### Step 4: 設定保存

1. **Create** ボタンをクリックして保護ルールを作成

---

## 📋 ブランチ保護で有効化される機能

### ✅ 自動チェック項目

| チェック項目 | 説明 | 失敗時の動作 |
|-------------|------|-------------|
| **Static Analysis** | TypeScript型チェック + ESLint | マージブロック |
| **Unit Tests** | ユニットテストの実行 | マージブロック |
| **Component Tests** | Storybookビルド確認 | マージブロック |
| **E2E Tests** | Playwright E2Eテスト | マージブロック |
| **Security Scan** | 脆弱性スキャン | 警告表示 |

### 🔄 ワークフロー

1. **Feature ブランチ作成**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **開発・コミット**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

3. **プルリクエスト作成**
   - GitHub UI でプルリクエストを作成
   - 自動的に5つのステータスチェックが開始

4. **チェック結果待ち**
   - ✅ すべて成功 → レビュー可能
   - ❌ 1つでも失敗 → マージ不可

5. **コードレビュー**
   - 最低1人の承認が必要
   - コードオーナーの承認が必要

6. **マージ**
   - すべての条件満了後にマージ可能

---

## 🚨 ブランチ保護回避 (緊急時のみ)

### 管理者による一時的な保護解除

緊急事態でブランチ保護を一時的に回避する必要がある場合：

1. **Settings** → **Branches** → **main** ルール
2. **Include administrators** のチェックを一時的に外す
3. 緊急対応後、必ずチェックを戻す

⚠️ **警告**: この操作は緊急時のみ使用し、対応後は必ず元に戻してください。

---

## 🔧 トラブルシューティング

### よくある問題と解決法

#### 問題1: ステータスチェックが見つからない
```
Error: Required status check "Static Analysis" not found
```

**解決法**:
1. プルリクエストを作成する前に、ワークフローが一度実行されている必要があります
2. `.github/workflows/branch-protection.yml` をmainブランチにマージしてください

#### 問題2: E2Eテストが失敗する
```
Error: Playwright tests failed
```

**解決法**:
1. ローカルでE2Eテストを実行して確認:
   ```bash
   npm run test:e2e
   ```
2. Firebase設定の環境変数を確認
3. テストコードの修正

#### 問題3: Storybookビルドが失敗する
```
Error: Storybook build failed
```

**解決法**:
1. ローカルでStorybookビルドを確認:
   ```bash
   npm run build-storybook
   ```
2. ストーリーファイルの構文エラーを修正
3. 依存関係の問題を解決

---

## 📊 ブランチ保護の効果測定

### メトリクス

- **バグ検出率**: プルリクエスト段階での問題発見
- **コード品質**: ESLint, TypeScript エラーの減少
- **セキュリティ**: 脆弱性の早期発見
- **テストカバレッジ**: 自動テストによる品質保証

### レポート確認方法

1. **GitHub Actions** タブで実行履歴を確認
2. **Insights** → **Pulse** で開発活動を監視
3. **Security** → **Dependabot alerts** で脆弱性状況を確認

---

## ✅ セットアップ完了チェックリスト

- [ ] ブランチ保護ルールが設定済み
- [ ] 必須ステータスチェックが5つ設定済み
- [ ] プルリクエスト承認が必須設定済み
- [ ] 管理者にもルールが適用設定済み
- [ ] テストプルリクエストで動作確認済み

### 🎉 セットアップ完了

ブランチ保護が正常に設定されました！
これで、mainブランチの品質が自動的に保護されます。