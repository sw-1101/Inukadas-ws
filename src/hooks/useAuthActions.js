// 認証アクション用カスタムフック
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { loginUser, registerUser, logoutUser } from '../utils/auth'

// Vue.js経験者向け解説:
// - カスタムフック: Vueのcomposablesと同様の再利用可能なロジック
// - use系の命名規則でReactのフック（Vueのcomposablesと同じ命名パターン）

export const useAuthActions = () => {
  const { dispatch } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const user = await loginUser(credentials)
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
      return user
    } catch (err) {
      const errorMessage = err.message || 'ログインに失敗しました'
      setError(errorMessage)
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const user = await registerUser(credentials)
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
      return user
    } catch (err) {
      const errorMessage = err.message || 'アカウント作成に失敗しました'
      setError(errorMessage)
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    try {
      await logoutUser()
      dispatch({ type: 'AUTH_LOGOUT' })
    } catch (err) {
      const errorMessage = err.message || 'ログアウトに失敗しました'
      setError(errorMessage)
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    register,
    logout,
    loading,
    error,
    clearError: () => setError(null),
  }
}