# メモアプリ ビルドエラー修正・Storybookテスト実装タスク

## タスク一覧

| ID | タイトル | ステータス | 完了条件 | 優先度 |
|---|---|---|---|---|
| TASK-001 | AppLayoutエクスポートエラー修正 | pending | App.tsxからAppLayoutが正常にインポートできる | high |
| TASK-002 | Header.tsx未使用変数削除 | pending | TypeScriptエラーゼロ、ビルド成功 | medium |
| TASK-003 | MemoCard.tsx durationプロパティエラー修正 | pending | Memoタイプにdurationを追加またはロジック修正 | high |
| TASK-004 | Input.tsx ref型エラー修正 | pending | TypeScriptエラーゼロ、ref正常動作 | high |
| TASK-005 | memoAudioService.ts全エラー修正 | pending | durationプロパティ、authService、未使用変数の修正 | high |
| TASK-006 | transcriptionService.ts未使用変数削除 | pending | TypeScriptエラーゼロ、ビルド成功 | medium |
| TASK-007 | Storybookコンテキストプロバイダー設定 | pending | MemoProvider、Firebase設定の追加 | high |
| TASK-008 | MemoCard Storybook play関数実装 | pending | 最低3つの機能テストケース実装 | high |
| TASK-009 | MemoForm Storybook play関数実装 | pending | 入力・送信・バリデーションテスト実装 | high |
| TASK-010 | 残りコンポーネント Storybook play関数実装 | pending | Header、Input、Button等のplay関数追加 | medium |
| TASK-011 | TailwindCSS Storybook設定修正 | pending | Storybookで全スタイルが正常に適用される | medium |
| TASK-012 | 最終品質確認 | pending | 全コマンド成功確認・エビデンス提示 | high |

## 実装順序
1. TASK-001〜006: ビルドエラー修正
2. TASK-007: Storybookコンテキスト設定
3. TASK-008〜010: Storybookテスト実装
4. TASK-011: TailwindCSS設定
5. TASK-012: 最終確認

## 成功基準
- `npm run build`: エラーゼロ
- `npm run type-check`: エラーゼロ
- `npm run test-storybook:ci`: 全テスト成功
- play関数のコード例提示
- 実行ログでの成功証明