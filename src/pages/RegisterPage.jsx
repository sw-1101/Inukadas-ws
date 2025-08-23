// ユーザー登録ページコンポーネント
import React, { useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { RegisterForm } from '../components/auth'
import { useAuth } from '../contexts/AuthContext'
import styles from './RegisterPage.module.css'

const RegisterPage= () => {
  const navigate = useNavigate()
  const { state } = useAuth()

  // 認証済みユーザーは自動的にダッシュボードへリダイレクト
  useEffect(() => {
    if (state.user && !state.loading) {
      navigate('/memos')
    }
  }, [state.user, state.loading, navigate])

  const handleRegisterSuccess = () => {
    navigate('/memos')
  }

  if (state.loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <RegisterForm onSuccess={handleRegisterSuccess} />
        
        <div className={styles.loginLinkContainer}>
          <div className={styles.loginText}>
            すでにアカウントをお持ちの方は{' '}
            <RouterLink to="/login" className={styles.loginLink}>
              こちらからログイン
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage