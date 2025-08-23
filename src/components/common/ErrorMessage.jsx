// エラーメッセージ表示コンポーネント
import React from 'react'
import { CloseIcon } from '../icons/CustomIcons'
import styles from './ErrorMessage.module.css'

// カスタムCSS + CSS Modules実装
// - 各セベリティレベルに対応したスタイル定義
// - クローズ機能付きアラート
// - アクセシビリティ対応


const ErrorMessage= ({
  title,
  message,
  severity = 'error',
  onClose
}) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.alert} ${styles[severity]}`}>
        <div className={styles.alertContent}>
          {title && <div className={styles.alertTitle}>{title}</div>}
          <div>{message}</div>
        </div>
        {onClose && (
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage