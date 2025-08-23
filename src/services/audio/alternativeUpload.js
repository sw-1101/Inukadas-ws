import { db } from '../../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * 代替アップロード方法（CORS回避）
 * 小さな音声ファイルをFirestoreに直接保存
 */
export class AlternativeUploadService {
  /**
   * 音声をBase64としてFirestoreに保存（1MB以下推奨）
   */
  async uploadAudioToFirestore(
    audioBlob: Blob,
    userId: string,
    memoId: string
  ): Promise<string> {
    // 1MB以下のファイルのみ
    if (audioBlob.size > 1024 * 1024) {
      throw new Error('ファイルサイズが大きすぎます（最大1MB）');
    }

    // Base64に変換
    const base64 = await this.blobToBase64(audioBlob);
    
    // Firestoreに保存
    const audioDoc = doc(db, 'audioData', `${userId}_${memoId}`);
    await setDoc(audioDoc, {
      data: base64,
      mimeType: audioBlob.type,
      size: audioBlob.size,
      createdAt: new Date(),
      userId,
      memoId
    });

    // Firestore URLを返す（擬似的なURL）
    return `firestore://audioData/${userId}_${memoId}`;
  }

  /**
   * FirestoreからBase64音声を取得
   */
  async getAudioFromFirestore(firestoreUrl: string): Promise<Blob> {
    const match = firestoreUrl.match(/firestore:\/\/audioData\/(.+)/);
    if (!match) throw new Error('Invalid Firestore URL');

    const docId = match[1];
    const audioDoc = await getDoc(doc(db, 'audioData', docId));
    
    if (!audioDoc.exists()) {
      throw new Error('Audio not found');
    }

    const data = audioDoc.data();
    return this.base64ToBlob(data.data, data.mimeType);
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

export const alternativeUpload = new AlternativeUploadService();