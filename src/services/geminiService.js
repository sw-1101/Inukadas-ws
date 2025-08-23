import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProcessedContent {
  id: string;
  timestamp: Date;
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
}

// Gemini API設定
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

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
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // data:mime;base64, の部分を除去
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// AudioBlobをBase64に変換
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 注意: 現在の実装では20MB以上のファイルは未対応
// 将来的にFiles APIを使用してアップロード機能を実装予定

// マルチモーダル入力を処理
export async function processMultimodalInput(data: {
  text: string;
  files: File[];
  audioBlob?: Blob;
}): Promise<ProcessedContent> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const parts: any[] = [];
    const fileInfo: Array<{ name: string; type: string; size: number; uri?: string }> = [];
    
    // テキスト入力を追加
    const fullText = data.text;
    
    // 音声処理
    if (data.audioBlob) {
      const audioBase64 = await blobToBase64(data.audioBlob);
      parts.push({
        inline_data: {
          mime_type: 'audio/wav',
          data: audioBase64,
        },
      });
      fileInfo.push({
        name: 'recorded_audio.wav',
        type: 'audio/wav',
        size: data.audioBlob.size,
      });
    }
    
    // ファイル処理
    for (const file of data.files) {
      if (file.size <= 20 * 1024 * 1024) {
        // 20MB以下はインラインデータとして処理
        const base64Data = await fileToBase64(file);
        parts.push({
          inline_data: {
            mime_type: file.type,
            data: base64Data,
          },
        });
        fileInfo.push({
          name: file.name,
          type: file.type,
          size: file.size,
        });
      } else {
        // 20MB以上のファイルはエラーとして処理
        throw new Error(`ファイル "${file.name}" のサイズが大きすぎます。20MB以下のファイルをご使用ください。`);
      }
    }
    
    // プロンプト作成
    const prompt = `
以下の入力を分析し、議事録や記録として整理してください。

【入力テキスト】
${fullText}

【要求事項】
1. 内容を要約してください
2. 重要なポイントを抽出してください  
3. 適切なタグを3-5個生成してください
4. カテゴリを決定してください（会議、プレゼン、資料、その他）
5. 音声がある場合は文字起こしも含めてください

【出力形式】
以下のJSON形式で出力してください：
{
  "summary": "要約",
  "keyPoints": ["ポイント1", "ポイント2"],
  "tags": ["タグ1", "タグ2"],
  "category": "カテゴリ",
  "audioTranscript": "音声の文字起こし（音声がある場合のみ）",
  "processedText": "全体の整理された内容"
}
`;
    
    parts.unshift({ text: prompt });
    
    // Gemini APIに送信
    const result = await model.generateContent(parts);
    const response = result.response;
    const responseText = response.text();
    
    // JSONレスポンスをパース
    let parsedResponse;
    try {
      // JSONブロックを抽出
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      // JSONパースに失敗した場合のフォールバック
      parsedResponse = {
        summary: responseText.substring(0, 200),
        keyPoints: [responseText.substring(0, 100)],
        tags: ['AI処理済み'],
        category: 'その他',
        processedText: responseText,
      };
    }
    
    return {
      id: `content_${Date.now()}`,
      timestamp: new Date(),
      originalText: data.text,
      processedText: parsedResponse.processedText || parsedResponse.summary,
      files: fileInfo,
      audioTranscript: parsedResponse.audioTranscript,
      summary: parsedResponse.summary,
      tags: parsedResponse.tags || [],
      category: parsedResponse.category || 'その他',
    };
    
  } catch (error) {

    throw new Error('AI処理に失敗しました。APIキーを確認してください。');
  }
}

// 検索機能
export async function searchContent(query: string, existingContent: ProcessedContent[]): Promise<ProcessedContent[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const contentSummary = existingContent.map(content => ({
      id: content.id,
      summary: content.summary,
      tags: content.tags,
      category: content.category,
      timestamp: content.timestamp.toISOString(),
    }));
    
    const prompt = `
以下の検索クエリに最も関連する内容を、既存のコンテンツから選択してください。

検索クエリ: "${query}"

既存のコンテンツ一覧:
${JSON.stringify(contentSummary, null, 2)}

【要求事項】
1. クエリに関連度の高い順でコンテンツIDを並べてください
2. 関連度が低いものは除外してください
3. 関連する理由も説明してください

【出力形式】
{
  "results": [
    {
      "id": "content_id",
      "relevanceScore": 0.9,
      "reason": "関連する理由"
    }
  ]
}
`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    
    let searchResults;
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      searchResults = JSON.parse(jsonStr);
    } catch (parseError) {
      return existingContent.filter(content => 
        content.summary.toLowerCase().includes(query.toLowerCase()) ||
        content.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // 検索結果に基づいてコンテンツを並び替え
    const orderedResults: ProcessedContent[] = [];
    for (const result of searchResults.results || []) {
      const content = existingContent.find(c => c.id === result.id);
      if (content) {
        orderedResults.push(content);
      }
    }
    
    return orderedResults;
    
  } catch (error) {

    // フォールバック検索
    return existingContent.filter(content => 
      content.summary.toLowerCase().includes(query.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }
}