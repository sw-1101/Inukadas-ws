// 認証保護されたルートコンポーネント
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../common'

// Vue.js経験者向け解説:
// - Vue RouterのbeforeEachガードと同様の認証保護機能
// - ログインしていないユーザーを自動的にログインページにリダイレクト


const PrivateRoute= ({ children }) => {
  const { state } = useAuth()
  const location = useLocation()

  // 認証状態の読み込み中
  if (state.loading) {
    return <LoadingSpinner message="認証状態を確認しています..." />
  }

  // 認証されていない場合はログインページにリダイレクト
  // 現在のパスをstateとして保存し、ログイン後に元のページに戻る
  if (!state.user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 認証されている場合は子コンポーネントを表示
  return <>{children}</>
}

export default PrivateRoute