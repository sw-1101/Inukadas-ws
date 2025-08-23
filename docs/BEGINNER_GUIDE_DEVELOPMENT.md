# 🚀 開発手順・注意点ガイド

## 🎯 このガイドについて

新しいコンポーネントや機能を開発する際の手順と、気をつけるべきポイントを初心者向けに説明します。

```
📋 計画 → 🛠️ 開発 → 🧪 テスト → 📝 ドキュメント → 🚀 リリース
```

---

## 🏁 開発開始前の準備

### 1. 環境構築チェック

```bash
# Node.js バージョン確認
node --version  # v18以上推奨

# 依存関係インストール
npm install

# 環境変数設定確認
cat .env.local  # Firebase設定が正しいか確認
```

### 2. 開発環境起動

```bash
# アプリケーション起動
npm run dev
# → http://localhost:5173

# Storybook起動（別ターミナル）
npm run storybook
# → http://localhost:6006
```

### 3. 品質チェックツール動作確認

```bash
# TypeScript型チェック
npm run type-check

# コードスタイルチェック
npm run lint

# E2Eテスト実行
npm run test:e2e
```

---

## 🛠️ 新しいコンポーネント開発手順

### Step 1: 設計・計画 📋

#### 1.1 要件整理
```
✅ 何を作るか？         - 例：ユーザー評価表示コンポーネント
✅ どこで使うか？       - 例：商品詳細ページ、ユーザープロフィール
✅ どんな状態がある？   - 例：評価なし、1-5星、読み込み中
✅ どんなデータが必要？ - 例：rating: number, maxRating: number
```

#### 1.2 コンポーネント設計
```typescript
// 型定義を先に決める
interface RatingProps {
  rating: number;          // 現在の評価値
  maxRating: number;       // 最大評価値
  readonly?: boolean;      // 読み取り専用か
  size?: 'small' | 'medium' | 'large';
  onRatingChange?: (rating: number) => void;
}
```

### Step 2: ディレクトリ構造作成 📁

```bash
# 適切な場所にディレクトリ作成
mkdir -p src/components/common/Rating

# 必要ファイル作成
touch src/components/common/Rating/Rating.tsx
touch src/components/common/Rating/Rating.stories.tsx
touch src/components/common/Rating/Rating.test.tsx
touch src/components/common/Rating/index.ts
```

### Step 3: コンポーネント実装 ⚛️

#### 3.1 基本コンポーネント作成

```tsx
// src/components/common/Rating/Rating.tsx
import React from 'react'
import { Star, StarBorder } from '@mui/icons-material'

export interface RatingProps {
  /** 現在の評価値 (0-maxRating) */
  rating: number
  /** 最大評価値 */
  maxRating?: number
  /** 読み取り専用モード */
  readonly?: boolean
  /** サイズ */
  size?: 'small' | 'medium' | 'large'
  /** 評価変更時のコールバック */
  onRatingChange?: (rating: number) => void
}

const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  readonly = false,
  size = 'medium',
  onRatingChange,
}) => {
  const handleStarClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const iconSize = {
    small: 16,
    medium: 24,
    large: 32,
  }[size]

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= rating
        
        return (
          <button
            key={index}
            onClick={() => handleStarClick(starValue)}
            disabled={readonly}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: readonly ? 'default' : 'pointer',
              padding: 0,
            }}
          >
            {isFilled ? (
              <Star sx={{ fontSize: iconSize, color: '#ffc107' }} />
            ) : (
              <StarBorder sx={{ fontSize: iconSize, color: '#e0e0e0' }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Rating
```

#### 3.2 エクスポートファイル作成

```typescript
// src/components/common/Rating/index.ts
export { default } from './Rating'
export type { RatingProps } from './Rating'
```

### Step 4: Storybookストーリー作成 📚

```typescript
// src/components/common/Rating/Rating.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import Rating from './Rating'

const meta: Meta<typeof Rating> = {
  title: 'Common/Rating',
  component: Rating,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '星評価を表示・入力するためのコンポーネントです。'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'range', min: 0, max: 5, step: 0.5 },
      description: '現在の評価値'
    },
    maxRating: {
      control: { type: 'range', min: 3, max: 10 },
      description: '最大評価値'
    },
    readonly: {
      control: 'boolean',
      description: '読み取り専用モード'
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '星のサイズ'
    },
    onRatingChange: {
      action: 'rating-changed',
      description: '評価変更時のコールバック'
    }
  },
}

export default meta
type Story = StoryObj<typeof meta>

// 基本表示
export const Default: Story = {
  args: {
    rating: 3,
  },
}

// サイズバリエーション
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Rating rating={4} size="small" readonly />
      <Rating rating={4} size="medium" readonly />
      <Rating rating={4} size="large" readonly />
    </div>
  ),
}

// インタラクティブ
export const Interactive: Story = {
  args: {
    rating: 0,
    onRatingChange: (rating) => console.log('評価:', rating),
  },
}

// 読み取り専用
export const ReadOnly: Story = {
  args: {
    rating: 4.5,
    readonly: true,
  },
}

// カスタム最大値
export const CustomMax: Story = {
  args: {
    rating: 7,
    maxRating: 10,
  },
}
```

### Step 5: テスト作成 🧪

```typescript
// src/components/common/Rating/Rating.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Rating from './Rating'

describe('Rating Component', () => {
  it('指定された評価値で星が表示される', () => {
    render(<Rating rating={3} maxRating={5} />)
    
    const stars = screen.getAllByRole('button')
    expect(stars).toHaveLength(5)
  })

  it('クリックで評価値が変更される', () => {
    const handleRatingChange = vi.fn()
    render(<Rating rating={2} onRatingChange={handleRatingChange} />)
    
    const stars = screen.getAllByRole('button')
    fireEvent.click(stars[3]) // 4番目の星をクリック
    
    expect(handleRatingChange).toHaveBeenCalledWith(4)
  })

  it('読み取り専用モードではクリックできない', () => {
    const handleRatingChange = vi.fn()
    render(<Rating rating={2} readonly onRatingChange={handleRatingChange} />)
    
    const stars = screen.getAllByRole('button')
    fireEvent.click(stars[3])
    
    expect(handleRatingChange).not.toHaveBeenCalled()
  })
})
```

### Step 6: 動作確認 ✅

```bash
# Storybookで見た目確認
npm run storybook

# テスト実行
npm run test

# 型チェック
npm run type-check

# リント確認
npm run lint
```

---

## 🚨 開発時の注意点

### 1. TypeScript関連

#### ✅ 適切な型定義
```typescript
// ✅ 良い例：具体的で分かりやすい型
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

// ❌ 悪い例：any型の使用
interface BadProps {
  config: any  // 型安全性がない
  data: any    // 何でも入ってしまう
}
```

#### ✅ 適切なprops設計
```typescript
// ✅ 良い例：オプショナルとデフォルト値の明確化
const Component: React.FC<Props> = ({
  size = 'medium',     // デフォルト値を明示
  disabled = false,
  children,            // 必須項目は明確に
}) => {
  // ...
}

// ❌ 悪い例：すべてオプショナル
interface BadProps {
  text?: string      // 必須なのにオプショナル
  onClick?: () => void
}
```

### 2. Material-UI活用

#### ✅ 既存コンポーネントの拡張
```typescript
// ✅ 良い例：Material-UIを拡張
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'

interface CustomButtonProps extends Omit<MuiButtonProps, 'size'> {
  size: 'small' | 'medium' | 'large'  // カスタムサイズ定義
  loading?: boolean                    // 独自プロパティ追加
}
```

#### ✅ テーマの活用
```typescript
// ✅ 良い例：テーマカラーの使用
import { useTheme } from '@mui/material/styles'

const Component = () => {
  const theme = useTheme()
  
  return (
    <div style={{ 
      backgroundColor: theme.palette.primary.main,  // テーマ色を使用
      color: theme.palette.primary.contrastText,
    }}>
      コンテンツ
    </div>
  )
}
```

### 3. パフォーマンス対策

#### ✅ 適切なmemo化
```typescript
// ✅ 良い例：重い計算のmemo化
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: heavyCalculation(item)
    }))
  }, [data])

  return <div>{/* レンダリング */}</div>
})
```

#### ✅ 適切なstate設計
```typescript
// ✅ 良い例：状態の分離
const [user, setUser] = useState<User | null>(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// ❌ 悪い例：すべてをひとつのstateに
const [state, setState] = useState({
  user: null,
  loading: false,
  error: null,
  random: 0,  // 関係ない状態も混在
})
```

### 4. Firebase連携

#### ✅ 適切なエラーハンドリング
```typescript
// ✅ 良い例：詳細なエラーハンドリング
const saveData = async (data: UserData) => {
  try {
    setLoading(true)
    await addDoc(collection(db, 'users'), data)
    setError(null)
  } catch (error) {
    console.error('データ保存エラー:', error)
    if (error instanceof FirebaseError) {
      setError(`保存に失敗しました: ${error.message}`)
    } else {
      setError('予期しないエラーが発生しました')
    }
  } finally {
    setLoading(false)
  }
}
```

### 5. アクセシビリティ

#### ✅ セマンティックHTML
```typescript
// ✅ 良い例：適切なHTML要素の使用
<button onClick={handleClick} aria-label="商品をお気に入りに追加">
  <FavoriteIcon />
</button>

// ❌ 悪い例：divでボタンを作る
<div onClick={handleClick}>
  <FavoriteIcon />
</div>
```

#### ✅ フォームのラベル
```typescript
// ✅ 良い例：labelとinputの関連付け
<label htmlFor="email">メールアドレス</label>
<input 
  id="email" 
  type="email" 
  required 
  aria-describedby="email-help"
/>
<div id="email-help">有効なメールアドレスを入力してください</div>
```

---

## 🎯 コードレビューのポイント

### 自分でチェックすべき項目

#### コード品質
- [ ] TypeScript型エラーがない (`npm run type-check`)
- [ ] ESLintエラーがない (`npm run lint`)
- [ ] Storybookが正しく表示される
- [ ] テストが通る (`npm run test`)
- [ ] E2Eテストが壊れていない (`npm run test:e2e`)

#### 設計・実装
- [ ] コンポーネントが単一責任を持っている
- [ ] propsの型定義が適切
- [ ] デフォルト値が設定されている
- [ ] エラーハンドリングが適切
- [ ] パフォーマンスに問題がない

#### ドキュメント
- [ ] Storybookストーリーが充実している
- [ ] コンポーネントの使用方法が明確
- [ ] 型定義にコメントがある
- [ ] 複雑なロジックにコメントがある

---

## 🔄 開発フロー（Git）

### 1. ブランチ作成

```bash
# メインブランチから最新を取得
git checkout main
git pull origin main

# 機能ブランチ作成
git checkout -b feature/rating-component
```

### 2. 開発・コミット

```bash
# 変更をステージング
git add .

# コミット（わかりやすいメッセージ）
git commit -m "feat: Rating コンポーネント実装

- 星評価表示・入力機能
- サイズバリエーション対応
- 読み取り専用モード
- Storybookストーリー追加"
```

### 3. プルリクエスト

```bash
# リモートにプッシュ
git push origin feature/rating-component

# GitHubでPR作成
gh pr create --title "feat: Rating コンポーネント実装" --body "
## 概要
星評価を表示・入力するためのコンポーネントを実装

## 変更内容
- Rating コンポーネント実装
- Storybookストーリー追加
- テストコード追加

## 確認事項
- [ ] Storybookで動作確認
- [ ] 各種サイズで表示確認
- [ ] アクセシビリティ確認
"
```

---

## 🚀 本番リリース前のチェック

### 最終確認項目

```bash
# 全体ビルド確認
npm run build

# Storybookビルド確認
npm run build-storybook

# 全テスト実行
npm run test:e2e

# 型チェック
npm run type-check

# リント確認
npm run lint
```

### デプロイ確認

```bash
# プレビュー環境での確認
npm run preview

# Firebase プレビューデプロイ
firebase hosting:channel:deploy preview
```

---

## 💡 効率化のコツ

### 1. VS Code拡張機能

推奨拡張機能：
- **ES7+ React/Redux/React-Native snippets** - コード補完
- **Playwright Test for VS Code** - E2Eテスト実行
- **TypeScript Importer** - 自動import
- **Material Icon Theme** - ファイルアイコン

### 2. コードスニペット

よく使うパターンをスニペット化：

```json
// .vscode/snippets.json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react'",
      "",
      "export interface ${1:ComponentName}Props {",
      "  $2",
      "}",
      "",
      "const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = ({",
      "  $3",
      "}) => {",
      "  return (",
      "    <div>",
      "      $4",
      "    </div>",
      "  )",
      "}",
      "",
      "export default ${1:ComponentName}"
    ]
  }
}
```

### 3. 開発用のカスタムコマンド

```bash
# package.jsonに追加
"scripts": {
  "dev:full": "concurrently \"npm run dev\" \"npm run storybook\"",
  "test:watch": "vitest --watch",
  "check:all": "npm run type-check && npm run lint && npm run test"
}
```

---

## 🚨 トラブルシューティング

### よくある問題と解決法

#### Q1: TypeScriptエラーが多発する

```bash
# 型定義ファイルの再生成
rm -rf node_modules/@types
npm install

# TypeScript設定確認
cat tsconfig.json
```

#### Q2: Storybookでコンポーネントが表示されない

```typescript
// .storybook/main.ts の stories 設定確認
stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

// ファイル名の確認
// ✅ Component.stories.tsx
// ❌ Component.story.tsx (storiesになってない)
```

#### Q3: Material-UIのスタイルが適用されない

```typescript
// ThemeProviderで囲む
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

const theme = createTheme()

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <YourComponent />
    </ThemeProvider>
  )
}
```

#### Q4: E2Eテストがタイムアウトする

```typescript
// playwright.config.ts でタイムアウト調整
use: {
  actionTimeout: 30000,     // 個別操作のタイムアウト
  navigationTimeout: 30000, // ページ遷移のタイムアウト
},

// テスト内でも個別指定可能
await page.click('button', { timeout: 60000 })
```

---

## 🎓 学習リソース

### 技術スタック別学習

#### React学習
- [React 公式ドキュメント](https://react.dev/) - 最新のReact学習
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript基礎

#### Material-UI学習
- [Material-UI Components](https://mui.com/material-ui/react-autocomplete/) - コンポーネント一覧
- [Material-UI Customization](https://mui.com/material-ui/customization/how-to-customize/) - カスタマイズ方法

#### テスト学習
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - コンポーネントテスト
- [Playwright Docs](https://playwright.dev/docs/intro) - E2Eテスト

#### Firebase学習
- [Firebase Web Docs](https://firebase.google.com/docs/web/setup) - Firebase連携方法

---

## 🎉 まとめ

効率的で品質の高い開発のために：

1. **🛠️ 計画的な設計** - 事前の要件整理と型設計
2. **📚 ドキュメント重視** - Storybookでのコンポーネント説明
3. **🧪 テスト駆動** - 実装と同時にテスト作成
4. **🔄 継続的改善** - コードレビューでの品質向上
5. **👥 チーム連携** - 明確なコミュニケーション

このガイドラインに沿って、堅牢で保守性の高いコンポーネントを開発していきましょう！

---

## 📞 困ったときは

- 📖 [プロジェクトREADME](../README.md) - 全体的な開発ガイド
- 📚 [Storybookガイド](./BEGINNER_GUIDE_STORYBOOK.md) - コンポーネント開発詳細
- 🎭 [Playwrightガイド](./BEGINNER_GUIDE_PLAYWRIGHT.md) - E2Eテスト詳細
- 💬 チームに質問 - 分からないことは遠慮なく聞いてください！