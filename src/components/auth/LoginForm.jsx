// ログインフォームコンポーネント
import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { loginUser } from '../../utils/auth'
import { useAuth } from '../../contexts/AuthContext'
import styles from './LoginForm.module.css'

// Vue.js経験者向け解説:
// - useState)やreactive()と同様のリアクティブ状態
// - onSubmit: Vue.jsの@submitと同様のイベントハンドリング
// - フォームバリデーションはVueでいうvee-validateのような実装



const LoginForm= ({ onSuccess }) => {
  const { dispatch } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  const validateEmail = (email) => {
    if (!email) return 'メールアドレスを入力してください'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return '正しいメールアドレスを入力してください'
    return undefined
  }

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
  const validatePassword = (password) => {
    const result = validatePasswordStrength(password)
    return result.isValid ? undefined : result.message
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    let error

    if (name === 'email') {
      error = validateEmail(value)
    } else if (name === 'password') {
      error = validatePassword(value)
    }

    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    
    const errors = {}
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError
    
    setValidationErrors(errors)
    
    // Don't submit if there are validation errors
    if (Object.keys(errors).length > 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const user = await loginUser(formData)
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'ログインに失敗しました')
      dispatch({ type: 'AUTH_ERROR', payload: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <h1 className={styles.title}>
          ログイン
        </h1>
        
        {error && (
          <div className={styles.errorAlert} role="alert">
            {error}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldContainer}>
            <label htmlFor="email" className={styles.label}>
              メールアドレス
            </label>
            <input
              id="email"
              className={`${styles.input} ${validationErrors.email ? styles.error : ''}`}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
            />
            {validationErrors.email && (
              <div className={`${styles.helperText} ${styles.error}`}>
                {validationErrors.email}
              </div>
            )}
          </div>
          
          <div className={styles.fieldContainer}>
            <label htmlFor="password" className={styles.label}>
              パスワード
            </label>
            <input
              id="password"
              className={`${styles.input} ${validationErrors.password ? styles.error : ''}`}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
            />
            {validationErrors.password && (
              <div className={`${styles.helperText} ${styles.error}`}>
                {validationErrors.password}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading && <div className={styles.submitSpinner} role="progressbar" />}
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className={styles.linkContainer}>
            <RouterLink to="/register" className={styles.link}>
              新規登録はこちら
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm