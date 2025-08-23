// アプリケーションのルーティング設定
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '../components/auth'
import { 
  LoginPage, 
  RegisterPage, 
  ProfilePage, 
} from '../pages'
import MemoListPage from '../pages/MemoListPage'

// Vue.js経験者向け解説:
// - BrowserRouter)と同様
// - Routes: Vue RouterのroutesArrayの配置場所
// - Route: Vue RouterのRouteRecordRawと同様の個別ルート定義
// - Navigate: Vue RouterのredirectFunctionと同様

const AppRoutes= () => {
  return (
    <Routes>
      {/* パブリックルート（認証不要） */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* プライベートルート（認証必要） */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/memos"
        element={
          <PrivateRoute>
            <MemoListPage />
          </PrivateRoute>
        }
      />
      
      {/* デフォルトルート */}
      <Route path="/" element={<Navigate to="/memos" replace />} />
      
      {/* 404ページ（該当するルートがない場合） */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes