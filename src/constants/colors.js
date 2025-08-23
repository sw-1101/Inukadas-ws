/**
 * LINE風紫系UI カラーパレット定数
 * 3色ルール: ベース(70%)、メイン(25%)、アクセント(5%)
 */

export const colors = {
  // ベースカラー（70%使用）
  base: {
    primary: '#FFFFFF',        // メイン背景
    secondary: '#F9FAFB',      // セカンダリ背景・タイムライン
    tertiary: '#F3F4F6',       // カード・入力エリア背景
    border: '#E5E7EB',         // ボーダー・区切り線
    text: {
      primary: '#111827',      // メインテキスト
      secondary: '#6B7280',    // セカンダリテキスト
    },
  },
  
  // メインカラー（25%使用）- 紫系グラデーション
  main: {
    primary: '#7C3AED',        // メインパープル
    secondary: '#6366F1',      // 青紫（グラデーション用）
    light: '#C4B5FD',          // 薄紫（自分のメッセージバブル）
    dark: '#5B21B6',           // 濃紫（アクティブ状態）
    gradient: 'linear-gradient(135deg, #7C3AED, #6366F1)',
  },
  
  // アクセントカラー（5%使用）
  accent: {
    primary: '#EC4899',       // ピンク紫（録音・重要アクション）
    warning: '#F59E0B',       // アンバー（警告・注意）
    success: '#10B981',       // エメラルド（成功・完了）
    error: '#EF4444',         // レッド（エラー・削除）
  },
  
  // ダークモード
  dark: {
    base: {
      primary: '#1F2937',
      secondary: '#111827',
      tertiary: '#374151',
      border: '#4B5563',
      text: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
      },
    },
  },
  
  // シャドウ・エフェクト
  shadow: {
    bubble: '0 2px 8px rgba(124, 58, 237, 0.25)',
    card: '0 1px 3px rgba(0, 0, 0, 0.1)',
    modal: '0 4px 20px rgba(124, 58, 237, 0.4)',
  },
} as const;

// CSS変数名の定数
export const cssVars = {
  // ベースカラー
  basePrimary: 'var(--base-primary)',
  baseSecondary: 'var(--base-secondary)',
  baseTertiary: 'var(--base-tertiary)',
  baseBorder: 'var(--base-border)',
  baseTextPrimary: 'var(--base-text-primary)',
  baseTextSecondary: 'var(--base-text-secondary)',
  
  // メインカラー
  mainPrimary: 'var(--main-primary)',
  mainSecondary: 'var(--main-secondary)',
  mainLight: 'var(--main-light)',
  mainDark: 'var(--main-dark)',
  mainGradient: 'var(--main-gradient)',
  
  // アクセントカラー
  accentPrimary: 'var(--accent-primary)',
  accentWarning: 'var(--accent-warning)',
  accentSuccess: 'var(--accent-success)',
  accentError: 'var(--accent-error)',
  
  // シャドウ
  shadowBubble: 'var(--shadow-bubble)',
  shadowCard: 'var(--shadow-card)',
  shadowModal: 'var(--shadow-modal)',
} as const;

// TypeScriptの型定義
