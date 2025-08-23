import { transcriptionService } from './transcriptionService';
import { firestoreService, authService } from '@/services/firebase';
import { Timestamp } from 'firebase/firestore';

/**
 * メモ音声処理サービス
 * 
 * 設計原則:
 * - メモ作成と音声処理の統合
 * - 非同期処理とステータス管理
 * - エラーハンドリング
 * - 進捗監視
 */

// 音声処理進捗情報とオプションの型定義をJSDocコメントとして記録
/**
 * @typedef {Object} AudioProcessingProgress
 * @property {'uploading' | 'transcribing' | 'saving' | 'complete' | 'error'} stage
 * @property {number} progress - 0-100
 * @property {string} message
 * @property {UploadProgress} [uploadProgress]
 * @property {TranscriptionResult} [transcriptionResult]
 * @property {Error} [error]
 */

/**
 * @typedef {Object} AudioProcessingOptions
 * @property {TranscriptionOptions} [transcriptionOptions]
 * @property {boolean} [useWebSpeechFallback]
 * @property {boolean} [autoTitle]
 * @property {boolean} [autoSummary]
 */

class MemoAudioService {
  /**
   * 音声メモを作成（アップロード + 文字起こし + Firestore保存）
   */
  async createAudioMemo(
    memoData,
    onProgress
  ) {
    try {
      // 1. 基本バリデーション
      if (!('audioBlob' in memoData) || !memoData.audioBlob) {
        throw new Error('音声データが指定されていません');
      }

      const userId = memoData.userId || this.getCurrentUserId();
      if (!userId) {
        throw new Error('ユーザーが認証されていません');
      }

      // 2. 初期メモをFirestoreに保存（音声アップロード前）
      onProgress?.({
        stage: 'uploading',
        progress: 0,
        message: 'メモを初期化しています...'
      });

      const initialMemoData = {
        ...memoData,
        userId
      };

      const memoId = await firestoreService.createMemo(initialMemoData);

      // 3. 音声ファイルをアップロード（Firestoreに保存）
      onProgress?.({
        stage: 'uploading',
        progress: 10,
        message: '音声データを保存中...'
      });

      // Firebase Storageの代わりにFirestoreに保存
      let audioUrl = '';
      const audioBlob = ('audioBlob' in memoData && memoData.audioBlob) ? memoData.audioBlob : null;
      
      if (audioBlob && audioBlob.size < 1024 * 1024) { // 1MB以下
        // Base64に変換してFirestoreに保存
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(audioBlob);
        });
        
        const base64Data = await base64Promise;
        audioUrl = base64Data; // Base64データをURLとして使用
        
        onProgress?.({
          stage: 'uploading',
          progress: 40,
          message: '音声データ保存完了'
        });
      } else if (audioBlob) {
        throw new Error('音声ファイルが大きすぎます（最大1MB）。無料プランではFirebase Storageが使用できません。');
      }

      // 4. メモにaudioUrlと音声情報を更新
      let audioDuration = 0;
      
      // 録音時間が渡されていればそれを使用、なければBlobから取得
      if ('duration' in memoData && typeof memoData.duration === 'number') {
        audioDuration = memoData.duration;
        console.log('録音時間を使用:', audioDuration);
      } else if (audioBlob) {
        try {
          // durationを取得（webmファイルの場合、特別な処理が必要）
          audioDuration = await this.getAudioDurationFromBlob(audioBlob);
          console.log('Blobから取得したduration:', audioDuration);
        } catch (error) {
          console.error('Duration取得エラー:', error);
          audioDuration = 0;
        }
      }
      
      await firestoreService.updateMemo(memoId, {
        audioUrl,
        duration: audioDuration,
        fileSize: audioBlob?.size || 0
      });

      // 5. 文字起こし実行
      onProgress?.({
        stage: 'transcribing',
        progress: 60,
        message: '音声を文字起こし中...'
      });

      let transcriptionResult;
      // let transcriptionError: Error | null = null;

      try {
        // Gemini API で文字起こし
        transcriptionResult = await transcriptionService.transcribeAudio(audioUrl, {
          language: 'ja',
          response_format: 'text'
        });
      } catch (error) {

        // transcriptionError = error instanceof Error ? error : new Error('文字起こしに失敗しました');
        
        // Web Speech API フォールバック
        try {
          transcriptionResult = await transcriptionService.transcribeAudioWebSpeech(
            ('audioBlob' in memoData && memoData.audioBlob) ? memoData.audioBlob : new Blob([''], { type: 'audio/wav' }),
            'ja-JP'
          );
        } catch (fallbackError) {

          throw new Error('文字起こしに失敗しました（Gemini API、Web Speech API共に失敗）');
        }
      }

      // 6. 文字起こし結果でメモを更新
      onProgress?.({
        stage: 'saving',
        progress: 90,
        message: '文字起こし結果を保存中...',
        transcriptionResult
      });

      const updateData = {
        transcription: transcriptionResult.text,
        language: transcriptionResult.language,
        confidence: transcriptionResult.confidence,
        updatedAt: Timestamp.now()
      };
      
      // segmentsが存在する場合のみ追加
      if (transcriptionResult.segments) {
        updateData.segments = transcriptionResult.segments;
      }

      // タイトルの自動生成
      if (!memoData.title || memoData.title === '新しいメモ') {
        updateData.title = this.generateAutoTitle(transcriptionResult.text);
      }

      await firestoreService.updateMemo(memoId, updateData);

      // 7. 完了
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: '音声メモの作成が完了しました',
        transcriptionResult
      });

      return memoId;

    } catch (error) {

      onProgress?.({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : '音声メモの作成に失敗しました',
        error: error instanceof Error ? error : new Error('不明なエラー')
      });
      
      throw error;
    }
  }

  /**
   * 既存メモの音声を文字起こし
   */
  async transcribeExistingMemo(
    memoId,
    options = {},
    onProgress
  ) {
    try {
      // 1. メモを取得
      const memo = await firestoreService.getMemo(memoId);
      if (!memo) {
        throw new Error('メモが見つかりません');
      }

      if (!('audioUrl' in memo) || !memo.audioUrl) {
        throw new Error('音声ファイルが関連付けられていません');
      }

      // 2. 文字起こし状態を更新
      await firestoreService.updateMemo(memoId, {
        updatedAt: Timestamp.now()
      });

      onProgress?.({
        stage: 'transcribing',
        progress: 20,
        message: '音声を文字起こし中...'
      });

      // 3. 文字起こし実行
      const transcriptionResult = await transcriptionService.transcribeAudio(
        ('audioUrl' in memo) ? memo.audioUrl : '',
        options.transcriptionOptions || {
          language: 'ja',
          response_format: 'text'
        }
      );

      // 4. 結果を保存
      onProgress?.({
        stage: 'saving',
        progress: 90,
        message: '文字起こし結果を保存中...',
        transcriptionResult
      });

      const updateData = {
        transcription: transcriptionResult.text,
        language: transcriptionResult.language,
        confidence: transcriptionResult.confidence,
        updatedAt: Timestamp.now()
      };
      
      // segmentsが存在する場合のみ追加
      if (transcriptionResult.segments) {
        updateData.segments = transcriptionResult.segments;
      }

      // 自動タイトル生成
      if (options.autoTitle && (!memo.title || memo.title === '新しいメモ')) {
        updateData.title = this.generateAutoTitle(transcriptionResult.text);
      }

      await firestoreService.updateMemo(memoId, updateData);

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: '文字起こしが完了しました',
        transcriptionResult
      });

      return transcriptionResult;

    } catch (error) {

      // エラー状態を保存
      await firestoreService.updateMemo(memoId, {
        updatedAt: Timestamp.now()
      }).catch(() => {
        // エラーハンドリング
      });

      onProgress?.({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : '文字起こしに失敗しました',
        error: error instanceof Error ? error : new Error('不明なエラー')
      });
      
      throw error;
    }
  }

  /**
   * 複数メモの一括文字起こし
   */
  async batchTranscribeMemos(
    memoIds,
    options = {},
    onProgress
  ) {
    const results = {
      success: [],
      failed: []
    };

    for (let i = 0; i < memoIds.length; i++) {
      const memoId = memoIds[i];
      
      try {
        await this.transcribeExistingMemo(
          memoId,
          options,
          (progress) => onProgress?.(memoId, progress)
        );
        results.success.push(memoId);
      } catch (error) {

        results.failed.push(memoId);
      }

      // 少し待機（API制限対策）
      if (i < memoIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * 自動タイトル生成
   */
  generateAutoTitle(text) {
    if (!text || text.trim().length === 0) {
      return '新しいメモ';
    }

    // 文章を整理してタイトルを生成
    const cleanText = text.trim()
      .replace(/[。！？\n\r]/g, ' ') // 句読点を空白に
      .replace(/\s+/g, ' ') // 連続空白を単一空白に
      .trim();

    // 最初の30文字程度を取得
    const maxLength = 30;
    if (cleanText.length <= maxLength) {
      return cleanText;
    }

    // 適切な区切り位置を探す
    const truncated = cleanText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 15) { // 最低15文字は確保
      return truncated.substring(0, lastSpace) + '...';
    } else {
      return truncated + '...';
    }
  }

  /**
   * 現在のユーザーID取得
   */
  getCurrentUserId() {
    return authService.getCurrentUserId();
  }

  /**
   * 音声ファイルサイズの最適化
   */
  async optimizeAudioBlob(audioBlob, _targetQuality = 'medium') {
    // Web Audio API を使用した音声圧縮（実装は省略）
    return audioBlob; // 現在は元のBlobをそのまま返す
  }

  /**
   * 音声ファイルの詳細情報取得
   */
  async getAudioMetadata(audioBlob) {
    const duration = await transcriptionService.getAudioDuration(audioBlob);
    
    return {
      duration,
      size: audioBlob.size,
      format: audioBlob.type
    };
  }

  /**
   * Blobから音声の長さを取得（特別な処理）
   */
  async getAudioDurationFromBlob(audioBlob) {
    return new Promise((resolve) => {
      // 一時的なaudio要素を作成
      const audio = document.createElement('audio');
      const url = URL.createObjectURL(audioBlob);
      
      let resolved = false;
      
      const cleanup = () => {
        URL.revokeObjectURL(url);
        audio.remove();
      };
      
      const handleMetadata = () => {
        if (resolved) return;
        resolved = true;
        
        const duration = audio.duration;
        cleanup();
        
        if (isNaN(duration) || !isFinite(duration) || duration <= 0) {
          console.warn('Duration is invalid:', duration);
          // サイズから推定（約1秒 = 8KB for webm）
          const estimatedDuration = Math.max(1, Math.round(audioBlob.size / 8000));
          resolve(estimatedDuration);
        } else {
          resolve(Math.round(duration));
        }
      };
      
      const handleError = (error) => {
        if (resolved) return;
        resolved = true;
        
        console.warn('Audio load error, estimating duration:', error);
        cleanup();
        
        // エラー時はサイズから推定
        const estimatedDuration = Math.max(1, Math.round(audioBlob.size / 8000));
        resolve(estimatedDuration);
      };
      
      // タイムアウト設定（5秒）
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('Audio loading timeout, estimating duration');
          cleanup();
          
          const estimatedDuration = Math.max(1, Math.round(audioBlob.size / 8000));
          resolve(estimatedDuration);
        }
      }, 5000);
      
      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(timeout);
        handleMetadata();
      });
      
      audio.addEventListener('error', (error) => {
        clearTimeout(timeout);
        handleError(error);
      });
      
      audio.src = url;
      audio.load();
    });
  }
}

// シングルトンインスタンス
export const memoAudioService = new MemoAudioService();
export default memoAudioService;