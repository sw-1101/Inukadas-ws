import { auth } from '../config/firebase';

// Vercel Edge Function エンドポイント
const API_ENDPOINT = import.meta.env.PROD
  ? '/api/gemini'  // 本番環境
  : 'http://localhost:3000/api/gemini'; // 開発環境

// 注意: 現在未使用だが将来的に使用予定の関数
// function detectFileType(file: File): 'audio' | 'video' | 'image' | 'pdf' | 'excel' | 'other' {
//   const mimeType = file.type;
//   const extension = file.name.split('.').pop()?.toLowerCase();
//   if (mimeType.startsWith('audio/')) return 'audio';
//   if (mimeType.startsWith('video/')) return 'video';
//   if (mimeType.startsWith('image/')) return 'image';
//   if (mimeType === 'application/pdf') return 'pdf';
//   if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || extension === 'xlsx' || extension === 'xls') return 'excel';
//   return 'other';
// }

// ファイルをBase64に変換
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result.split(',')[1]); // data:mime;base64, の部分を除去
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// AudioBlobをBase64に変換
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 注意: 現在の実装では20MB以上のファイルは未対応
// 将来的にFiles APIを使用してアップロード機能を実装予定

// マルチモーダル入力を処理
export async function processMultimodalInput(data) {
  try {
    // Firebase認証トークンを取得
    const user = auth.currentUser;
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    const idToken = await user.getIdToken();

    const fileInfo = [];
    const processedFiles = [];
    
    // 音声処理
    let audioData = null;
    if (data.audioBlob) {
      const audioBase64 = await blobToBase64(data.audioBlob);
      audioData = {
        mimeType: 'audio/wav',
        data: audioBase64,
        size: data.audioBlob.size
      };
      fileInfo.push({
        name: 'recorded_audio.wav',
        type: 'audio/wav',
        size: data.audioBlob.size,
      });
    }

    // ファイル処理
    for (const file of data.files) {
      if (file.size <= 20 * 1024 * 1024) {
        const base64Data = await fileToBase64(file);
        processedFiles.push({
          name: file.name,
          type: file.type,
          data: base64Data,
          size: file.size
        });
        fileInfo.push({
          name: file.name,
          type: file.type,
          size: file.size,
        });
      } else {
        throw new Error(`ファイル "${file.name}" のサイズが大きすぎます。20MB以下のファイルをご使用ください。`);
      }
    }

    // Vercel Edge Functionにリクエスト
    const requestBody = {
      action: 'processMultimodal',
      data: {
        text: data.text,
        files: processedFiles,
        audioBlob: audioData
      }
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'APIリクエストが失敗しました');
    }

    const result = await response.json();

    return result.result;
    
  } catch (error) {
    throw new Error('AI処理に失敗しました。APIキーを確認してください。');
  }
}

// 検索機能
export async function searchContent(query, existingContent) {
  try {
    // Firebase認証トークンを取得
    const user = auth.currentUser;
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }
    const idToken = await user.getIdToken();

    const requestBody = {
      action: 'search',
      data: {
        query,
        existingContent: existingContent.map(content => ({
          id: content.id,
          summary: content.summary,
          tags: content.tags,
          category: content.category,
          timestamp: content.timestamp.toISOString(),
        }))
      }
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'APIリクエストが失敗しました');
    }

    const result = await response.json();
    const searchResults = result.result;

    // 検索結果に基づいてコンテンツを並び替え
    const orderedResults = [];
    for (const item of searchResults || []) {
      const content = existingContent.find(c => c.id === item.id);
      if (content) {
        orderedResults.push(content);
      }
    }

    return orderedResults;
    
  } catch (error) {

    // フォールバック検索
    const safeQuery = query ? query.toLowerCase() : '';
    return existingContent.filter(content =>
      (content.summary && content.summary.toLowerCase().includes(safeQuery)) ||
      (content.tags && content.tags.some(tag => tag && tag.toLowerCase().includes(safeQuery)))
    );
  }
}