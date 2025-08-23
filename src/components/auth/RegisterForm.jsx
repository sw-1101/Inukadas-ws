// ユーザー登録フォームコンポーネント
import React, { useState } from 'react'
import { registerUser } from '../../utils/auth'
import { useAuth } from '../../contexts/AuthContext'
import styles from './RegisterForm.module.css'

// Vue.js経験者向け解説:
// - バリデーション処理もVueのリアクティブ機能と同様にuseStateで管理
// - 条件付きレンダリングはVueのv-ifの代わりに{condition && <Component />}


const RegisterForm= ({ onSuccess }) => {
  const { dispatch } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // セキュリティ強化: 包括的なパスワード強度チェック
  const validatePasswordStrength = (password) => {
    if (!password) {
      return { isValid: false, message: 'パスワードを入力してください' }
    }
    
    // 最小長チェック（8文字以上）
    if (password.length < 8) {
      return { isValid: false, message: 'パスワードは8文字以上で入力してください' }
    }
    
    // 最大長チェック（128文字以下）
    if (password.length > 128) {
      return { isValid: false, message: 'パスワードは128文字以下で入力してください' }
    }
    
    // 文字種チェック
    const hasLowercase = /[a-z]/.test(password)
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    
    const typesUsed = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length
    
    if (typesUsed < 3) {
      return { 
        isValid: false, 
        message: 'パスワードには以下のうち3種類以上を含めてください: 小文字、大文字、数字、記号' 
      }
    }
    
    // よくあるパスワードパターンのチェック
    const commonPatterns = [
      /^(.)\1+$/, // 同じ文字の繰り返し（例: aaaaaaa）
      /^(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/, // 連続する数字
      /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/, // 連続するアルファベット
      /(password|pass|123456|qwerty|admin|test|user)/i // よくあるパスワード
    ]
    
    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        return { isValid: false, message: '推測しやすいパスワードは使用できません' }
      }
    }
    
    return { isValid: true }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // パスワード確認
    if (formData.password !== confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    // セキュリティ強化: 包括的なパスワード強度チェック
    const passwordValidation = validatePasswordStrength(formData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || 'パスワードが条件を満たしていません')
      setLoading(false)
      return
    }

    try {
      const user = await registerUser(formData)
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'アカウント作成に失敗しました')
      dispatch({ type: 'AUTH_ERROR', payload: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h1 className={styles.title}>
          新規登録
        </h1>
        
        {error && (
          <div className={styles.errorAlert} role="alert">
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldContainer}>
            <label htmlFor="displayName" className={styles.label}>
              表示名
            </label>
            <input
              id="displayName"
              className={styles.input}
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>
          
          <div className={styles.fieldContainer}>
            <label htmlFor="email" className={styles.label}>
              メールアドレス *
            </label>
            <input
              id="email"
              className={styles.input}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          
          <div className={styles.fieldContainer}>
            <label htmlFor="password" className={styles.label}>
              パスワード *
            </label>
            <input
              id="password"
              className={styles.input}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <div className={styles.helperText}>
              8文字以上、3種類以上の文字（大文字・小文字・数字・記号）を含む
            </div>
          </div>
          
          <div className={styles.fieldContainer}>
            <label htmlFor="confirmPassword" className={styles.label}>
              パスワード確認 *
            </label>
            <input
              id="confirmPassword"
              className={styles.input}
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading && <div className={styles.submitSpinner} />}
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm