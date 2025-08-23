// Firebase設定とSDK初期化
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase設定オブジェクト
// 実際の使用時は.envファイルに環境変数を設定してください
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig)

// 認証、Firestore、Storageのインスタンスを取得
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Vue.js経験者向け解説:
// - Vueでいうpluginのようにアプリ全体でFirebaseを使用可能にする
// - auth: Vue.jsでのVuex/Piniaのようにグローバル状態として認証を管理
// - db: Vue.jsでのAPI clientのような位置づけでデータベースアクセス
// - storage: 音声ファイルなどのファイルストレージサービス

export default app