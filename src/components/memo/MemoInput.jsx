import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMemos } from '../../contexts/MemoContext';
// Type import removed for JavaScript conversion
import { memoAudioService } from '../../services/audio/memoAudioService';
// import { useTrophyNotification } from '../feedback/TrophyNotification';
import { authService } from '../../services/firebase/auth';
import { SendIcon, MicIcon, MicOffIcon, ClearIcon, TextFieldsIcon, CloseIcon } from '../icons/CustomIcons';
import styles from './MemoInput.module.css';

/**
 * メモ入力コンポーネント
 * 
 * 設計原則:
 * - LINE風のチャット入力インターフェース
 * - テキスト・音声・混合メモ対応
 * - リアルタイムバリデーション
 * - アクセシビリティ対応
 */


export const MemoInput= ({
  mode = 'text',
  placeholder = 'メモを入力してください...',
  maxLength = 1000,
  onSubmitSuccess,
  onSubmitError,
  onModeChange
}) => {
  const { createMemo } = useMemos();
  // const { // showSuccessNotification } = useTrophyNotification();
  
  // フォーム状態
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [processingProgress, setProcessingProgress] = useState(null);
  
  // 音声録音状態
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs
  const textFieldRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioChunksRef = useRef([]);

  // フォーカス制御
  useEffect(() => {
    if (currentMode === 'text' && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [currentMode]);

  // 録音時間更新
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // 時間フォーマット
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // テキスト変更処理
  const handleTextChange = useCallback((event) => {
    const value = event.target.value;
    if (value.length <= maxLength) {
      setText(value);
      setError(null);
    }
  }, [maxLength]);

  // モード変更処理
  const handleModeChange = useCallback((newMode) => {
    setCurrentMode(newMode);
    setError(null);
    onModeChange?.(newMode);
  }, [onModeChange]);

  // 音声録音開始
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // ストリームを停止
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      
    } catch (error) {

      setError('マイクへのアクセスが許可されていません');
    }
  }, []);

  // 音声録音停止
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // 録音時間は保持する（リセットしない）
    }
  }, [isRecording]);

  // 音声削除
  const clearAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0); // 削除時のみリセット
  }, [audioUrl]);

  // バリデーション
  const validateInput = useCallback(() => {
    if (currentMode === 'text' && !text.trim()) {
      return 'テキストを入力してください';
    }
    
    if (currentMode === 'audio' && !audioBlob) {
      return '音声を録音してください';
    }
    
    if (currentMode === 'mixed' && !text.trim() && !audioBlob) {
      return 'テキストまたは音声を入力してください';
    }
    
    return null;
  }, [currentMode, text, audioBlob]);

  // メモ送信処理
  const handleSubmit = useCallback(async () => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setProcessingProgress(null);

    try {
      // メモデータ作成
      const userId = authService.getCurrentUserId();
      if (!userId) {
        throw new Error('ユーザーが認証されていません');
      }
      
      const memoData = {
        userId,
        type: currentMode,
        title: (text?.substring(0, 50) || '新しいメモ'), // 最初の50文字をタイトルに
        ...(text && { content: text }),
        ...(audioBlob && { 
          audioBlob,
          duration: recordingTime > 0 ? recordingTime : 0 // 録音時間をdurationとして追加（0以下の場合は0）
        }) // 音声データがある場合は追加
      };

      let memoId;

      // 音声がある場合は専用サービスを使用
      if (currentMode === 'audio' || (currentMode === 'mixed' && audioBlob)) {
        memoId = await memoAudioService.createAudioMemo(
          memoData,
          (progress) => {
            setProcessingProgress(progress);
          }
        );
      } else {
        // テキストのみの場合は通常のcreateMemoを使用
        memoId = await createMemo(memoData);
      }
      
      // 成功通知
      // showSuccessNotification(
      //   'メモが作成されました！',
      //   currentMode === 'audio' ? '音声の文字起こしも完了しました' : 'テキストメモが保存されました'
      // );
      
      // フォームリセット
      setText('');
      clearAudio();
      setProcessingProgress(null);
      
      onSubmitSuccess?.(memoId);
      
    } catch (error) {
      console.error('メモ送信エラーの詳細:', error);
      console.error('エラーオブジェクト:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        raw: error
      });
      const errorMessage = error instanceof Error ? error.message : 'メモの送信に失敗しました';
      setError(errorMessage);
      setProcessingProgress(null);
      onSubmitError?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [validateInput, currentMode, text, audioBlob, createMemo, memoAudioService, clearAudio, onSubmitSuccess, onSubmitError]);

  // Enterキーでの送信
  const handleKeyPress = useCallback(() => {
    if (event.key === 'Enter' && !event.shiftKey && !isSubmitting) {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit, isSubmitting]);

  // 送信可能かどうか
  const canSubmit = !isSubmitting && (
    (currentMode === 'text' && text.trim()) ||
    (currentMode === 'audio' && audioBlob) ||
    (currentMode === 'mixed' && (text.trim() || audioBlob))
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* モード選択 */}
        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeButton} ${currentMode === 'text' ? styles.active : ''}`}
            onClick={() => handleModeChange('text')}
            disabled={isSubmitting || isRecording}
            title="テキストメモ"
          >
            <TextFieldsIcon className={styles.icon} />
          </button>
          
          <button
            className={`${styles.modeButton} ${currentMode === 'audio' ? styles.active : ''}`}
            onClick={() => handleModeChange('audio')}
            disabled={isSubmitting}
            title="音声メモ"
          >
            <MicIcon className={styles.icon} />
          </button>
          
          <button
            className={`${styles.modeButton} ${currentMode === 'mixed' ? styles.active : ''}`}
            onClick={() => handleModeChange('mixed')}
            disabled={isSubmitting || isRecording}
            title="テキスト＋音声メモ"
          >
            <div className={styles.modeButtonMixed}>
              <TextFieldsIcon className={styles.iconSmall} />
              <MicIcon className={styles.iconSmall} />
            </div>
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className={styles.errorAlert}>
            {error}
            <button 
              className={styles.errorClose}
              onClick={() => setError(null)}
            >
              <CloseIcon className={styles.iconSmall} />
            </button>
          </div>
        )}

        {/* 処理進捗表示 */}
        {processingProgress && (
          <div className={styles.progressContainer}>
            <div className={styles.progressTitle}>
              {processingProgress.message}
            </div>
            
            <div className={styles.progressBar}>
              <div 
                className={styles.progressBarFill}
                style={{ width: `${processingProgress.progress}%` }}
              />
            </div>
            
            <div className={styles.stepper}>
              {['アップロード', '文字起こし', '保存', '完了'].map((label, index) => {
                const currentStep = 
                  processingProgress.stage === 'uploading' ? 0 :
                  processingProgress.stage === 'transcribing' ? 1 :
                  processingProgress.stage === 'saving' ? 2 :
                  processingProgress.stage === 'complete' ? 3 : 0;
                
                return (
                  <div key={label} className={`${styles.step} ${index <= currentStep ? styles.active : ''}`}>
                    <div className={`${styles.stepIcon} ${index <= currentStep ? styles.active : ''}`}>
                      {index + 1}
                    </div>
                    <div className={styles.stepLabel}>{label}</div>
                  </div>
                );
              })}
            </div>
            
            {processingProgress.transcriptionResult && (
              <div className={styles.transcriptionPreview}>
                <div className={styles.transcriptionCaption}>
                  文字起こし結果プレビュー:
                </div>
                <div className={styles.transcriptionText}>
                  {processingProgress.transcriptionResult.text.slice(0, 100)}
                  {processingProgress.transcriptionResult.text.length > 100 && '...'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* テキスト入力 */}
        {(currentMode === 'text' || currentMode === 'mixed') && (
          <div className={styles.textInputContainer}>
            <textarea
              ref={textFieldRef}
              className={styles.textArea}
              value={text}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isSubmitting || isRecording}
            />
            {text && (
              <button
                className={styles.textAreaClearButton}
                onClick={() => setText('')}
                disabled={isSubmitting || isRecording}
              >
                <ClearIcon className={styles.iconSmall} />
              </button>
            )}
            <div className={styles.characterCount}>
              {text.length}/{maxLength}文字
            </div>
          </div>
        )}

        {/* 音声録音・再生 */}
        {(currentMode === 'audio' || currentMode === 'mixed') && (
          <div className={styles.audioContainer}>
            {/* 録音コントロール */}
            <div className={styles.audioControls}>
              {!isRecording ? (
                <button
                  className={`${styles.recordButton} ${styles.recordButtonStart}`}
                  onClick={startRecording}
                  disabled={isSubmitting}
                >
                  <MicIcon className={styles.icon} />
                  録音開始
                </button>
              ) : (
                <button
                  className={`${styles.recordButton} ${styles.recordButtonStop}`}
                  onClick={stopRecording}
                >
                  <MicOffIcon className={styles.icon} />
                  録音停止 ({formatTime(recordingTime)})
                </button>
              )}

              {audioUrl && (
                <div className={styles.audioPlayback}>
                  <audio controls src={audioUrl} className={styles.audioPlayer} />
                  <button
                    className={styles.audioDeleteButton}
                    onClick={clearAudio}
                    disabled={isSubmitting || isRecording}
                  >
                    <ClearIcon className={styles.iconSmall} />
                  </button>
                </div>
              )}
            </div>

            {/* 録音中インジケータ */}
            {isRecording && (
              <div className={styles.recordingIndicator}>
                <div className={styles.recordingDot} />
                <div className={styles.recordingText}>
                  録音中... {formatTime(recordingTime)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 送信ボタン */}
        <div className={styles.submitContainer}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <div className={styles.submitSpinner} />
                送信中...
              </>
            ) : (
              <>
                <SendIcon className={styles.icon} />
                送信
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoInput;