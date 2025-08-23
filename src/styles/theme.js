// カスタムテーマ定義（MUI非依存版）
// CSS Custom Propertiesとして定義し、CSS Modulesで活用

// カラーパレット定義
export const palette = {
  primary: {
    main: '#1976D2',
    dark: '#1565C0',
    light: '#42A5F5',
  },
  secondary: {
    main: '#DC004E',
    dark: '#C51162',
    light: '#F06292',
  },
  success: {
    main: '#4CAF50',
  },
  warning: {
    main: '#FF9800',
  },
  error: {
    main: '#F44336',
  },
  info: {
    main: '#2196F3',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    500: '#9E9E9E',
    700: '#616161',
    900: '#212121',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
  },
} as const;

// タイポグラフィ設定
export const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.3,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
} as const;

// スペーシング (4px ベース単位)
export const spacing = 4;

// ブレークポイント
export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 1024,
    lg: 1200,
    xl: 1536,
  },
} as const;

// 形状 (ボーダー半径)
export const shape = {
  borderRadius: 8,
} as const;

// CSS Custom Properties生成ヘルパー
export const generateCSSVariables = () => {
  const cssVariables: Record<string, string> = {
    // カラー
    '--primary-main': palette.primary.main,
    '--primary-dark': palette.primary.dark,
    '--primary-light': palette.primary.light,
    '--secondary-main': palette.secondary.main,
    '--secondary-dark': palette.secondary.dark,
    '--secondary-light': palette.secondary.light,
    '--success-main': palette.success.main,
    '--warning-main': palette.warning.main,
    '--error-main': palette.error.main,
    '--info-main': palette.info.main,
    
    // グレイスケール
    '--grey-50': palette.grey[50],
    '--grey-100': palette.grey[100],
    '--grey-200': palette.grey[200],
    '--grey-500': palette.grey[500],
    '--grey-700': palette.grey[700],
    '--grey-900': palette.grey[900],
    
    // テキスト
    '--text-primary': palette.text.primary,
    '--text-secondary': palette.text.secondary,
    '--text-disabled': palette.text.disabled,
    
    // 背景
    '--background-default': palette.background.default,
    '--background-paper': palette.background.paper,
    
    // タイポグラフィ
    '--font-family': typography.fontFamily,
    
    // スペーシング
    '--spacing-unit': `${spacing}px`,
    
    // 形状
    '--border-radius': `${shape.borderRadius}px`,
  };

  return cssVariables;
};

// デフォルトテーマエクスポート（後方互換性のため）
export const theme = {
  palette,
  typography,
  spacing,
  breakpoints,
  shape,
};

// ダークテーマ設定（将来使用）
export const darkPalette = {
  ...palette,
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    disabled: '#666666',
  },
} as const;

export const darkTheme = {
  ...theme,
  palette: darkPalette,
};

export default theme;