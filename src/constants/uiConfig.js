/**
 * LINE風UI設定定数
 * レイアウト、サイズ、ブレークポイント等の設定
 */

export const uiConfig = {
  // ヘッダー設定
  header: {
    height: {
      mobile: '56px',
      desktop: '64px',
    },
    blur: {
      backdrop: 'blur(20px)',
      background: 'rgba(255, 255, 255, 0.95)',
    },
  },
  
  // メッセージバブル設定
  messageBubble: {
    maxWidth: {
      mobile: '85%',
      tablet: '75%',
      desktop: '70%',
    },
    borderRadius: {
      default: '18px',
      corner: '4px', // 角の小さい部分
    },
    padding: {
      horizontal: '16px',
      vertical: '12px',
    },
  },
  
  // 入力エリア設定
  inputArea: {
    height: {
      min: '80px',
      max: '200px',
    },
    padding: {
      mobile: '12px',
      desktop: '16px',
    },
  },
  
  // タイムライン設定
  timeline: {
    padding: {
      mobile: '16px',
      desktop: '24px',
    },
    messageGap: {
      same: '8px',    // 同じ時間帯
      different: '16px', // 時間差大
    },
  },
  
  // ブレークポイント
  breakpoints: {
    mobile: '640px',
    tablet: '1024px',
    desktop: '1025px',
  },
  
  // コンテナ設定
  container: {
    maxWidth: {
      tablet: '768px',
      desktop: '800px',
    },
  },
  
  // モーダル設定
  modal: {
    backdrop: {
      blur: 'blur(20px)',
      overlay: 'rgba(31, 41, 55, 0.95)',
    },
    animation: {
      duration: '300ms',
      easing: 'ease-out',
    },
  },
  
  // ボタン設定
  button: {
    height: {
      small: '32px',
      medium: '40px',
      large: '48px',
    },
    borderRadius: {
      small: '8px',
      medium: '12px',
      large: '16px',
      fab: '50%', // フローティングアクションボタン
    },
    minTouchTarget: '44px', // アクセシビリティ
  },
  
  // 音声録音設定
  recording: {
    waveform: {
      height: '80px',
      barWidth: '4px',
      barGap: '2px',
      barColor: 'var(--main-gradient)',
    },
    progress: {
      height: '8px',
      borderRadius: '4px',
    },
    timer: {
      fontSize: '48px',
      fontWeight: 'mono',
    },
  },
  
  // アニメーション設定
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'ease',
      easeOut: 'ease-out',
      easeIn: 'ease-in',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // 通知設定
  notification: {
    duration: '3000ms',
    position: {
      top: '20px',
      right: '20px',
    },
    borderRadius: '12px',
    padding: '16px',
  },
} as const;

// レスポンシブメディアクエリ
export const mediaQueries = {
  mobile: `@media (max-width: ${uiConfig.breakpoints.mobile})`,
  tablet: `@media (min-width: ${uiConfig.breakpoints.mobile}) and (max-width: ${uiConfig.breakpoints.tablet})`,
  desktop: `@media (min-width: ${uiConfig.breakpoints.desktop})`,
  
  // 高さベースの設定
  shortScreen: '@media (max-height: 600px)',
  tallScreen: '@media (min-height: 800px)',
} as const;

// Z-index管理
export const zIndex = {
  base: 1,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
} as const;

