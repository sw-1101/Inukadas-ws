import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// AudioFormat型は削除されました（JavaScript変換時）
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 音声ファイル文字起こしサービス
 * 
 * 設計原則:
 * - Whisper API統合
 * - Firebase Storage連携
 * - プログレス監視
 * - エラーハンドリング
 * - 複数フォーマット対応
 */

// 文字起こし結果インターフェース（JSDocコメントで記録）
/**
 * @typedef {Object} TranscriptionResult
 * @property {string} text
 * @property {string} [language]
 * @property {number} [confidence]
 * @property {TranscriptionSegment[]} [segments]
 * @property {number} [duration]
 */

// 文字起こしセグメント（JSDocコメントで記録）
/**
 * @typedef {Object} TranscriptionSegment
 * @property {number} start
 * @property {number} end
 * @property {string} text
 * @property {number} [confidence]
 */

// アップロード進捗情報（JSDocコメントで記録）
/**
 * @typedef {Object} UploadProgress
 * @property {number} bytesTransferred
 * @property {number} totalBytes
 * @property {number} progress - 0-100
 * @property {'running' | 'paused' | 'success' | 'canceled' | 'error'} state
 */

// 文字起こし設定（JSDocコメントで記録）
/**
 * @typedef {Object} TranscriptionOptions
 * @property {string} [language] - 'ja', 'en', 'auto' など
 * @property {string} [model] - Gemini モデル名（将来の拡張用）
 * @property {number} [temperature] - 0-1
 * @property {string} [prompt]
 * @property {'json' | 'text'} [response_format] - Gemini用に簡略化
 */

class TranscriptionService {
  MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper API制限)
  SUPPORTED_FORMATS = [
    'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'
  ];

  /**
   * 音声ファイルをFirebase Storageにアップロード
   */
  async uploadAudioFile(
    audioBlob,
    userId,
    fileName,
    onProgress
  ) {
    try {
      // ファイルサイズチェック
      if (audioBlob.size > this.MAX_FILE_SIZE) {
        throw new Error(`ファイルサイズが制限を超えています (最大: ${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
      }

      // ファイル形式チェック
      const format = this.detectAudioFormat(audioBlob);
      if (!this.SUPPORTED_FORMATS.includes(format)) {
        throw new Error(`サポートされていないファイル形式です: ${format}`);
      }

      // Storage参照作成
      const storageRef = ref(storage, `audio/${userId}/${Date.now()}_${fileName}`);

      // シンプルなuploadBytesを使用（CORSエラー回避）
      onProgress?.({
        bytesTransferred: 0,
        totalBytes: audioBlob.size,
        progress: 0,
        state: 'running'
      });

      // メタデータ設定
      const metadata = {
        contentType: audioBlob.type || 'audio/webm',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          userId: userId
        }
      };

      // uploadBytesを使用（より信頼性が高い）
      const snapshot = await uploadBytes(storageRef, audioBlob, metadata);
      
      onProgress?.({
        bytesTransferred: audioBlob.size,
        totalBytes: audioBlob.size,
        progress: 100,
        state: 'success'
      });

      // ダウンロードURL取得
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
      
    } catch (error) {
      console.error('Upload error details:', error);
      
      // より詳細なエラーメッセージ
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          throw new Error('CORSエラー: Firebase Storageの設定を確認してください');
        }
        if (error.message.includes('Unauthorized')) {
          throw new Error('認証エラー: ログイン状態を確認してください');
        }
        if (error.message.includes('Quota')) {
          throw new Error('容量制限: Firebase Storageの容量を確認してください');
        }
        throw error;
      }
      
      throw new Error('アップロードに失敗しました');
    }
  }

  /**
   * 音声ファイルの文字起こし（Gemini API）
   */
  async transcribeAudio(
    audioUrl,
    options = {}
  ) {
    try {
      let audioBlob;
      
      // Base64データの場合は直接使用
      if (audioUrl.startsWith('data:audio')) {
        // Base64からBlobに変換
        const response = await fetch(audioUrl);
        audioBlob = await response.blob();
      } else {
        // 通常のURLの場合
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error('音声ファイルの取得に失敗しました');
        }
        audioBlob = await response.blob();
      }

      // Gemini API初期化
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // 音声をBase64に変換
      const audioBase64 = await this.blobToBase64(audioBlob);

      // プロンプト作成
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

      // Gemini APIに送信
      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: audioBlob.type || 'audio/webm',
            data: audioBase64
          }
        }
      ]);

      const transcription = result.response.text();

      // 結果を返す
      return {
        text: transcription,
        language: options.language || 'ja',
        confidence: 0.95 // Gemini APIは信頼度を返さないため、高い値を設定
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * BlobをBase64に変換（内部ヘルパー）
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        resolve(result.split(',')[1]); // data:mime;base64, の部分を除去
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * バックアップ文字起こし（Web Speech API）
   */
  async transcribeAudioWebSpeech(
    audioBlob,
    language = 'ja-JP'
  ) {
    return new Promise((resolve, reject) => {
      // Web Speech API が利用可能かチェック
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('このブラウザは音声認識をサポートしていません'));
        return;
      }

      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language;
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let fullTranscript = '';
        let hasResults = false;

        recognition.onresult = (event) => {
          hasResults = true;
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              fullTranscript += event.results[i][0].transcript + ' ';
            }
          }
        };

        recognition.onerror = (event) => {
          reject(new Error(`音声認識エラー: ${event.error}`));
        };

        recognition.onend = () => {
          if (hasResults) {
            resolve({
              text: fullTranscript.trim(),
              language,
              confidence: 0.8 // Web Speech APIでは正確な信頼度を取得できないため概算値
            });
          } else {
            reject(new Error('音声を認識できませんでした'));
          }
        };

        // 音声ファイルから直接認識はできないため、
        // 一時的にオーディオ要素を作成して再生しながら認識
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.oncanplaythrough = () => {
          recognition.start();
          audio.play();
        };

        audio.onended = () => {
          setTimeout(() => {
            recognition.stop();
          }, 1000); // 少し待ってから停止
        };

        audio.onerror = () => {
          reject(new Error('音声ファイルの再生に失敗しました'));
        };

      } catch (error) {
        reject(new Error(`Web Speech API初期化エラー: ${error}`));
      }
    });
  }

  /**
   * 音声ファイル削除
   */
  async deleteAudioFile(audioUrl) {
    try {
      const audioRef = ref(storage, audioUrl);
      await deleteObject(audioRef);
    } catch (error) {
      throw new Error('音声ファイルの削除に失敗しました');
    }
  }

  /**
   * 音声形式検出
   */
  detectAudioFormat(audioBlob) {
    const mimeType = audioBlob.type.toLowerCase();
    
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('mp3')) return 'mp3';
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('wav')) return 'wav';
    if (mimeType.includes('m4a')) return 'm4a';
    if (mimeType.includes('mpeg')) return 'mpeg';
    if (mimeType.includes('mpga')) return 'mpga';
    
    // デフォルトはwebm（MediaRecorderの標準出力）
    return 'webm';
  }

  /**
   * ファイルサイズを人間が読める形式に変換
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 音声継続時間を推定
   */
  async getAudioDuration(audioBlob) {
    return new Promise((resolve) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // loadedmetadataイベントで duration を取得
      const handleLoadedMetadata = () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audioUrl);
        
        // NaNチェック
        if (isNaN(duration) || !isFinite(duration)) {
          console.warn('Duration is NaN, returning 0');
          resolve(0);
        } else {
          console.log('Audio duration:', duration);
          resolve(duration);
        }
      };
      
      // エラーハンドリング
      const handleError = (error) => {
        URL.revokeObjectURL(audioUrl);
        console.error('Audio duration error:', error);
        resolve(0); // エラー時は0を返す
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('error', handleError);
      
      // 一部のブラウザではloadが必要
      audio.load();
    });
  }
}

// シングルトンインスタンス
export const transcriptionService = new TranscriptionService();
export default transcriptionService;