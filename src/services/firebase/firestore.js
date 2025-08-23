import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,

} from 'firebase/firestore';
import { db } from '../../config/firebase';
// Types removed for JavaScript conversion

/**
 * Firestore データベースサービス
 * 
 * 設計原則:
 * - CRUD操作の標準化
 * - リアルタイム更新対応
 * - エラーハンドリングは呼び出し元で実施
 * - 型安全性の確保
 */
export class FirestoreService {
  MEMOS_COLLECTION = 'memos';

  /**
   * メモを作成
   */
  async createMemo(memoData) {
    try {
      // audioBlobはFirestoreに保存できないため除外
      const { audioBlob, ...firestoreData } = memoData;
      
      // undefined値を除外（Firestoreはundefinedを受け入れない）
      const cleanedData = Object.fromEntries(
        Object.entries(firestoreData).filter(([_, value]) => value !== undefined)
      );
      
      const docData = {
        ...cleanedData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        transcriptionStatus: 'pending',
        transcriptionRetryCount: 0
      };

      const docRef = await addDoc(collection(db, this.MEMOS_COLLECTION), docData);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  /**
   * メモを更新
   */
  async updateMemo(memoId, updateData) {
    try {
      // undefined値を除外（Firestoreはundefinedを受け入れない）
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );
      
      const docRef = doc(db, this.MEMOS_COLLECTION, memoId);
      const updateWithTimestamp = {
        ...cleanedData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateWithTimestamp);
    } catch (error) {
      throw error;
    }
  }

  /**
   * メモを削除
   */
  async deleteMemo(memoId) {
    try {
      const docRef = doc(db, this.MEMOS_COLLECTION, memoId);
      await deleteDoc(docRef);
    } catch (error) {
      throw error;
    }
  }

  /**
   * メモを取得（ID指定）
   */
  async getMemo(memoId) {
    try {
      const docRef = doc(db, this.MEMOS_COLLECTION, memoId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } ;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ユーザーのメモ一覧を取得
   */
  async getMemos(
    userId,
    filter,
    sort,
    pagination
  ) {
    try {
      let queryBuilder = query(
        collection(db, this.MEMOS_COLLECTION),
        where('userId', '==', userId)
      );

      // フィルター適用
      if (filter) {
        if (filter.type) {
          queryBuilder = query(queryBuilder, where('type', '==', filter.type));
        }
        if (filter.hasTranscription !== undefined) {
          if (filter.hasTranscription) {
            queryBuilder = query(queryBuilder, where('transcription', '!=', null));
          }
        }
      }

      // ソート適用
      const sortField = sort?.field || 'createdAt';
      const sortDirection = sort?.direction || 'desc';
      queryBuilder = query(queryBuilder, orderBy(sortField, sortDirection));

      // ページング適用
      const pageLimit = pagination.limit || 50;
      if (pagination.lastDoc) {
        queryBuilder = query(queryBuilder, startAfter(pagination.lastDoc));
      }
      queryBuilder = query(queryBuilder, limit(pageLimit + 1)); // +1 for hasMore check

      const querySnapshot = await getDocs(queryBuilder);
      const docs = querySnapshot.docs;
      const hasMore = docs.length > pageLimit;
      
      // 最後のドキュメントを除く
      const memoDocs = hasMore ? docs.slice(0, -1) : docs;
      const lastDoc = memoDocs[memoDocs.length - 1];

      const memos = memoDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) ;

      return {
        memos,
        hasMore,
        lastDoc
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * メモをリアルタイムで監視
   */
  subscribeToMemos(
    userId,
    callback,
    filter,
    sort,
    limitNum = 50
  ) {
    try {
      let queryBuilder = query(
        collection(db, this.MEMOS_COLLECTION),
        where('userId', '==', userId)
      );

      // フィルター適用
      if (filter) {
        if (filter.type) {
          queryBuilder = query(queryBuilder, where('type', '==', filter.type));
        }
      }

      // ソート適用
      const sortField = sort?.field || 'createdAt';
      const sortDirection = sort?.direction || 'desc';
      queryBuilder = query(
        queryBuilder, 
        orderBy(sortField, sortDirection),
        limit(limitNum)
      );

      const unsubscribe = onSnapshot(queryBuilder, (querySnapshot) => {
        const memos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) ;
        
        callback(memos);
      }, (error) => {
        throw error;
      });

      return unsubscribe;
    } catch (error) {
      throw error;
    }
  }

  /**
   * メモを検索
   */
  async searchMemos(
    userId, 
    searchQuery
  ) {
    try {
      // Firestoreの全文検索は制限があるため、フロントエンドで絞り込み
      // 本格的な検索にはAlgoliaやElastic Searchを推奨
      const queryBuilder = query(
        collection(db, this.MEMOS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(100) // 検索対象を制限
      );

      const querySnapshot = await getDocs(queryBuilder);
      const allMemos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) ;

      // クライアントサイドでの検索
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const filteredMemos = allMemos.filter(memo => {
        const searchText = [
          memo.title || '',
          'transcription' in memo ? memo.transcription || '' : '',
          'textContent' in memo ? memo.textContent || '' : ''
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchText.includes(term));
      });

      return filteredMemos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 文字起こし状態を更新
   */
  async updateTranscriptionStatus(
    memoId, 
    status,
    transcription,
    retryCount
  ) {
    try {
      const updateData = {
        transcriptionStatus: status,
        updatedAt: serverTimestamp()
      };

      if (transcription !== undefined) {
        updateData.transcription = transcription;
      }

      if (retryCount !== undefined) {
        updateData.transcriptionRetryCount = retryCount;
      }

      await this.updateMemo(memoId, updateData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * ユーザーの統計情報を取得
   */
  async getUserStats(userId) {
    try {
      const queryBuilder = query(
        collection(db, this.MEMOS_COLLECTION),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(queryBuilder);
      const memos = querySnapshot.docs.map(doc => doc.data());

      const stats = {
        totalMemos: memos.length,
        audioMemos: memos.filter(memo => memo.type === 'audio' || memo.type === 'mixed').length,
        textMemos: memos.filter(memo => memo.type === 'text').length,
        transcribedMemos: memos.filter(memo => memo.transcription).length
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }
}

// シングルトンインスタンス
export const firestoreService = new FirestoreService();