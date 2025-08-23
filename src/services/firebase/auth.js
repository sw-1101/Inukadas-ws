import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../config/firebase';

/**
 * Firebase認証サービス
 * 
 * 設計原則:
 * - 認証状態の管理はContextで行う
 * - サービス層では認証操作のみを提供
 * - エラーハンドリングは呼び出し元で実施
 */
export class AuthService {
  /**
   * メールアドレス・パスワードでのログイン
   */
  async login(email, password) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential;
    } catch (error) {
      throw error;
    }
  }

  /**
   * メールアドレス・パスワードでのユーザー作成
   */
  async signUp(email, password) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      return credential;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Googleアカウントでのログイン
   */
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      return credential;
    } catch (error) {
      throw error;
    }
  }

/**
   * ログアウト
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 認証状態の監視
   * Context Provider内で使用
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * 現在のユーザーを取得
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * ユーザーが認証済みかどうか
   */
  isAuthenticated() {
    return !!auth.currentUser;
  }

  /**
   * ユーザーIDを取得
   */
  getCurrentUserId() {
    return auth.currentUser?.uid || null;
  }
}

// シングルトンインスタンス
export const authService = new AuthService();