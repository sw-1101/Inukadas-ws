// メインアプリケーションコンポーネント
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AppLayout } from './components/layout'
import AppRoutes from './routes/AppRoutes'

// Vue.js経験者向け解説:
// - AuthProvider: VueのprovideInjectやPiniaのstoreProviderと同様
// - AppLayout: Vueのレイアウトコンポーネントと同様の役割
// - 認証状態とルーティングをアプリケーション全体で利用可能にする

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App