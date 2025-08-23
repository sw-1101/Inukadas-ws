// 認証関連のユーティリティ関数
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'
import { auth } from '../config/firebase'

// Vue.js経験者向け解説:
// これらの関数はVueでいうcomposablesやutilsと同様の役割
// 再利用可能なロジックをカプセル化

// Firebase Userオブジェクトをアプリ用のUserオブジェクトに変換
export const mapFirebaseUser = (firebaseUser) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified,
})

// ログイン処理
export const loginUser = async (credentials) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    )
    return mapFirebaseUser(userCredential.user)
  } catch (error) {
    // セキュリティ対策: 詳細なエラー情報を隠蔽し、汎用的なメッセージを返す
    // 攻撃者による情報収集を防ぐため、Firebase のエラーコードを直接公開しない
    
    // 開発環境でのみ詳細ログを出力（本番では出力されない）
    if (process.env.NODE_ENV === 'development') {

    }
    
    // Firebase のエラーコードに応じて適切なメッセージを設定
    // ただし、アカウント存在の有無は漏らさない
    let userMessage = 'ログインに失敗しました。メールアドレスまたはパスワードを確認してください。'
    
    if (error.code === 'auth/too-many-requests') {
      userMessage = 'ログイン試行回数が上限に達しました。しばらく時間をおいてから再度お試しください。'
    } else if (error.code === 'auth/network-request-failed') {
      userMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
    }
    
    // カスタムエラーオブジェクトを作成（元のエラー情報は含めない）
    const secureError = new Error(userMessage)
    throw secureError
  }
}

// ユーザー登録処理
export const registerUser = async (credentials) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    )
    
    // 表示名が提供されている場合は更新
    if (credentials.displayName) {
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName
      })
    }
    
    return mapFirebaseUser(userCredential.user)
  } catch (error) {
    // セキュリティ対策: 詳細なエラー情報を隠蔽し、汎用的なメッセージを返す
    
    // 開発環境でのみ詳細ログを出力
    if (process.env.NODE_ENV === 'development') {

    }
    
    // Firebase のエラーコードに応じて適切なメッセージを設定
    let userMessage = 'アカウントの作成に失敗しました。しばらく時間をおいてから再度お試しください。'
    
    if (error.code === 'auth/email-already-in-use') {
      userMessage = 'このメールアドレスは既に使用されています。別のメールアドレスをお試しください。'
    } else if (error.code === 'auth/weak-password') {
      userMessage = 'パスワードが弱すぎます。より強固なパスワードを設定してください。'
    } else if (error.code === 'auth/invalid-email') {
      userMessage = 'メールアドレスの形式が正しくありません。'
    } else if (error.code === 'auth/too-many-requests') {
      userMessage = 'アカウント作成の試行回数が上限に達しました。しばらく時間をおいてから再度お試しください。'
    } else if (error.code === 'auth/network-request-failed') {
      userMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
    }
    
    // カスタムエラーオブジェクトを作成
    const secureError = new Error(userMessage)
    throw secureError
  }
}

// ログアウト処理
export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {

    throw error
  }
}