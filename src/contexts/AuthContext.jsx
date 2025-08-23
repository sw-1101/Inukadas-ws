// 認証状態管理用Context
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import { mapFirebaseUser } from '../utils/auth'

// Vue.js経験者向け解説:
// - createContext: VueのprovideInjectの仕組みと同様
// - useReducer: VuexのactionとmutationのパターンをReactで実現
// - AuthContextProvider: Vueのプラグインでグローバルstoreを提供するのと同様

// Action types
// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, loading: true, error: null }
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null }
    case 'AUTH_LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

// Context type

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Firebase認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = mapFirebaseUser(firebaseUser)
        dispatch({ type: 'AUTH_SUCCESS', payload: user })
      } else {
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}