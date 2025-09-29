import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';

// Firebase Admin SDKの初期化（環境変数から）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Vercel Serverless Function - Gemini APIプロキシ
 */
export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // リクエストヘッダーから認証トークンを取得
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: '認証が必要です' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Firebase認証トークンの検証
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Authenticated user:', decodedToken.uid);
    } catch (authError) {
      res.status(401).json({ error: '無効な認証トークン' });
      return;
    }

    // Gemini APIキーの確認
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      res.status(500).json({ error: 'サーバー設定エラー：APIキーが設定されていません' });
      return;
    }

    // リクエストボディの取得
    const { action, data } = req.body;

    // Gemini API初期化
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    let result;

    switch (action) {
      case 'processMultimodal':
        result = await processMultimodalContent(model, data);
        break;

      case 'search':
        result = await searchContent(model, data);
        break;

      case 'transcribe':
        result = await transcribeAudio(model, data);
        break;

      default:
        res.status(400).json({ error: '不明なアクション: ' + action });
        return;
    }

    res.status(200).json({ success: true, result });
    return;

  } catch (error) {
    console.error('Error processing request:', error);

    if (error.code === 'auth/argument-error') {
      res.status(401).json({ error: '無効な認証トークン' });
      return;
    }

    res.status(500).json({
      error: 'サーバーエラー',
      message: error.message
    });
    return;
  }
};

/**
 * マルチモーダルコンテンツの処理
 */
async function processMultimodalContent(model, data) {
  const { text, files, audioBlob } = data;
  const parts = [];
  const fileInfo = [];

  // 音声データの処理
  if (audioBlob) {
    parts.push({
      inlineData: {
        mimeType: audioBlob.mimeType || 'audio/wav',
        data: audioBlob.data,
      },
    });
    fileInfo.push({
      name: 'recorded_audio.wav',
      type: audioBlob.mimeType || 'audio/wav',
      size: audioBlob.size || 0,
    });
  }

  // ファイルデータの処理
  if (files && files.length > 0) {
    for (const file of files) {
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: file.data,
        },
      });
      fileInfo.push({
        name: file.name,
        type: file.type,
        size: file.size,
      });
    }
  }

  // プロンプトの追加
  const prompt = `
以下の入力を分析し、議事録や記録として整理してください。

【入力テキスト】
${text}

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

  const result = await model.generateContent(parts);
  const response = result.response;
  const responseText = response.text();

  // JSONレスポンスをパース
  let parsedResponse;
  try {
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                     responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
    parsedResponse = JSON.parse(jsonStr);
  } catch (parseError) {
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
    originalText: text,
    processedText: parsedResponse.processedText || parsedResponse.summary,
    files: fileInfo,
    audioTranscript: parsedResponse.audioTranscript,
    summary: parsedResponse.summary,
    tags: parsedResponse.tags || [],
    category: parsedResponse.category || 'その他',
  };
}

/**
 * コンテンツ検索
 */
async function searchContent(model, data) {
  const { query, existingContent } = data;

  const contentSummary = existingContent.map(content => ({
    id: content.id,
    summary: content.summary,
    tags: content.tags,
    category: content.category,
    timestamp: content.timestamp,
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
    // フォールバック：簡易検索
    const filteredContent = existingContent.filter(content =>
      content.summary.toLowerCase().includes(query.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    return filteredContent.map(c => ({ id: c.id, relevanceScore: 0.5 }));
  }

  return searchResults.results || [];
}

/**
 * 音声文字起こし
 */
async function transcribeAudio(model, data) {
  const { audioData, options = {} } = data;

  const language = options.language === 'ja' ? '日本語' : options.language || '自動検出';
  const prompt = `
この音声ファイルを文字起こししてください。
言語: ${language}
${options.prompt ? `追加指示: ${options.prompt}` : ''}

以下の形式で出力してください：
- 文字起こし結果のみを出力
- 句読点を適切に追加
- 改行は段落の切れ目のみ
`;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: audioData.mimeType || 'audio/webm',
        data: audioData.data
      }
    }
  ]);

  const transcription = result.response.text();

  return {
    text: transcription,
    language: options.language || 'ja',
    confidence: 0.95
  };
}