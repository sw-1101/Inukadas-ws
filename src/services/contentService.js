import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  deleteDoc, 
  doc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Firestore接続テスト
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testQuery = query(collection(db, 'contents'));
    await getDocs(testQuery);
    return true;
  } catch (error) {
    return false;
  }
}

// Firestore用のデータ型
interface FirestoreContent {
  id?: string;
  timestamp: Timestamp;
  originalText?: string;
  processedText: string;
  files: Array<{
    name: string;
    type: string;
    size: number;
    uri?: string;
  }>;
  audioTranscript?: string;
  summary: string;
  tags: string[];
  category: string;
  userId: string;
}

// ProcessedContentをFirestore形式に変換
function toFirestoreContent(content: ProcessedContent, userId: string): Omit<FirestoreContent, 'id'> {
  return {
    timestamp: Timestamp.fromDate(content.timestamp),
    originalText: content.originalText,
    processedText: content.processedText,
    files: content.files,
    audioTranscript: content.audioTranscript,
    summary: content.summary,
    tags: content.tags,
    category: content.category,
    userId,
  };
}

// Firestore形式をProcessedContentに変換
function fromFirestoreContent(doc: any): ProcessedContent {
  const data = doc.data();
  return {
    id: doc.id,
    timestamp: data.timestamp.toDate(),
    originalText: data.originalText,
    processedText: data.processedText,
    files: data.files || [],
    audioTranscript: data.audioTranscript,
    summary: data.summary,
    tags: data.tags || [],
    category: data.category,
  };
}

// コンテンツを保存
export async function saveContent(content: ProcessedContent, userId: string): Promise<string> {
  try {
    const contentData = toFirestoreContent(content, userId);
    const docRef = await addDoc(collection(db, 'contents'), contentData);
    return docRef.id;
  } catch (error) {

    throw new Error('コンテンツの保存に失敗しました');
  }
}

// ユーザーのコンテンツ一覧を取得
export async function getUserContents(userId: string): Promise<ProcessedContent[]> {
  try {

    // まず基本的なクエリから試す（インデックスの問題を回避）
    const q = query(
      collection(db, 'contents'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);

    const contents = querySnapshot.docs.map(fromFirestoreContent);
    
    // クライアント側でソート（Firestoreインデックス問題を回避）
    contents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return contents;
  } catch (error) {

    // フォールバック: 全データを取得してクライアント側でフィルタ
    try {

      const allQuery = query(collection(db, 'contents'));
      const allSnapshot = await getDocs(allQuery);
      
      const userContents: ProcessedContent[] = [];
      allSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userId === userId) {
          userContents.push(fromFirestoreContent(doc));
        }
      });
      
      // 時間順でソート
      userContents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return userContents;
    } catch (fallbackError) {

      throw new Error('コンテンツの取得に失敗しました');
    }
  }
}

// カテゴリ別でコンテンツを取得
export async function getContentsByCategory(userId: string, category: string): Promise<ProcessedContent[]> {
  try {
    const q = query(
      collection(db, 'contents'),
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestoreContent);
  } catch (error) {

    throw new Error('カテゴリ別コンテンツの取得に失敗しました');
  }
}

// タグでコンテンツを検索
export async function getContentsByTag(userId: string, tag: string): Promise<ProcessedContent[]> {
  try {
    const q = query(
      collection(db, 'contents'),
      where('userId', '==', userId),
      where('tags', 'array-contains', tag),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestoreContent);
  } catch (error) {

    throw new Error('タグ別コンテンツの取得に失敗しました');
  }
}

// コンテンツを削除
export async function deleteContent(contentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'contents', contentId));
  } catch (error) {

    throw new Error('コンテンツの削除に失敗しました');
  }
}

// コンテンツを更新
export async function updateContent(contentId: string, updates: Partial<ProcessedContent>): Promise<void> {
  try {
    const updateData: any = {};
    
    if (updates.processedText) updateData.processedText = updates.processedText;
    if (updates.summary) updateData.summary = updates.summary;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.category) updateData.category = updates.category;
    if (updates.audioTranscript) updateData.audioTranscript = updates.audioTranscript;
    
    await updateDoc(doc(db, 'contents', contentId), updateData);
  } catch (error) {

    throw new Error('コンテンツの更新に失敗しました');
  }
}

// 統計情報を取得
export async function getContentStats(userId: string): Promise<{
  totalContents: number;
  categoryCounts: Record<string, number>;
  recentContents: ProcessedContent[];
}> {
  try {
    const contents = await getUserContents(userId);
    
    const categoryCounts: Record<string, number> = {};
    contents.forEach(content => {
      categoryCounts[content.category] = (categoryCounts[content.category] || 0) + 1;
    });
    
    const recentContents = contents.slice(0, 5);
    
    return {
      totalContents: contents.length,
      categoryCounts,
      recentContents,
    };
  } catch (error) {

    throw new Error('統計情報の取得に失敗しました');
  }
}