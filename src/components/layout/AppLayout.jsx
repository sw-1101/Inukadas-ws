// アプリケーションの基本レイアウトコンポーネント
import React from 'react'
import styles from './AppLayout.module.css'

// カスタムCSS + CSS Modules実装
// - CSSリセット: styles.globalResetで初期化
// - テーマ変数: CSS Custom Propertiesでテーマ定義
// - レスポンシブ: CSS Media Queriesで対応


const AppLayout= ({ children }) => {
  return (
    <div className={`${styles.globalReset} ${styles.container}`}>
      {children}
    </div>
  )
}

export default AppLayout