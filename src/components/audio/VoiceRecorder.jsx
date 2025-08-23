import React, { useState, useRef, useCallback, useEffect } from 'react';
// TODO: MUI to CSS Modules conversion needed
import {
  Box,
  IconButton,
  Typography,
  LinearProgress,
  Alert,
  Fade,
  Chip,
  Paper,
  Mic,
  Stop,
  Pause,
  PlayArrow,
  Delete,
  VolumeUp,
  GraphicEq
} from '@mui/material';
import { WaveformVisualizer } from './WaveformVisualizer';

/**
 * 音声録音コンポーネント
 * 
 * 設計原則:
 * - ネイティブMediaRecorder API使用
 * - リアルタイム波形表示
 * - 録音時間制限
 * - エラーハンドリング
 * - アクセシビリティ対応
 */


// 録音状態
export const VoiceRecorder= ({
  maxDuration = 300, // 5分
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onError,
  disabled = false,
  quality = 'medium'
}) => {
  
  // 録音状態
  const [recordingState, setRecordingState] = useState('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioLevelTimerRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 品質設定
  const getQualitySettings = useCallback(() => {
    switch (quality) {
      case 'low':
        return { sampleRate: 16000, audioBitsPerSecond: 64000 };
      case 'high':
        return { sampleRate: 48000, audioBitsPerSecond: 192000 };
      default: // medium
        return { sampleRate: 44100, audioBitsPerSecond: 128000 };
    }
  }, [quality]);

  // 録音時間更新
  useEffect(() => {
    if (recordingState === 'recording') {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // 最大時間に達したら自動停止
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recordingState, maxDuration]);

  // 音声レベル監視
  useEffect(() => {
    if (recordingState === 'recording' && analyserRef.current) {
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // 音声レベル計算（RMSベース）
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);
          setAudioLevel(rms / 255 * 100);
        }
      };

      audioLevelTimerRef.current = setInterval(updateAudioLevel, 100);
    } else {
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
        audioLevelTimerRef.current = null;
      }
      setAudioLevel(0);
    }

    return () => {
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
    };
  }, [recordingState]);

  // 時間フォーマット
  const formatTime = useCallback(: string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 録音開始
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // マイクアクセス要求
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...getQualitySettings(),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      audioStreamRef.current = stream;

      // AudioContext for 音声レベル監視
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // MediaRecorder設定
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(;
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        setRecordingState('completed');
        
        // コールバック実行
        onRecordingComplete?.(audioBlob, recordingTime);
        onRecordingStop?.();
        
        // リソースクリーンアップ
        cleanupResources();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // 1秒ごとにデータを記録

      setRecordingState('recording');
      setRecordingTime(0);
      onRecordingStart?.();

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : '録音を開始できませんでした';
      setError(errorMessage);
      onError?.();
    }
  }, [getQualitySettings, recordingTime, onRecordingComplete, onRecordingStart, onRecordingStop, onError]);

  // 録音停止
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [recordingState]);

  // 録音一時停止/再開
  const pauseResumeRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (recordingState === 'recording') {
        mediaRecorderRef.current.pause();
        setRecordingState('paused');
      } else if (recordingState === 'paused') {
        mediaRecorderRef.current.resume();
        setRecordingState('recording');
      }
    }
  }, [recordingState]);

  // 録音削除
  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setRecordingState('idle');
    cleanupResources();
  }, [audioUrl]);

  // リソースクリーンアップ
  const cleanupResources = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
  }, []);

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      cleanupResources();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
      }
    };
  }, [cleanupResources]);

  // 進捗率計算
  const getProgressPercentage = (): number => {
    return Math.min((recordingTime / maxDuration) * 100, 100);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      {/* エラー表示 */}
      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* 録音状態表示 */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          音声録音
        </Typography>
        
        {/* 録音時間とステータス */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
            {formatTime(recordingTime)}
          </Typography>
          
          <Chip
            label={
              recordingState === 'idle' ? '待機中' :
              recordingState === 'recording' ? '録音中' :
              recordingState === 'paused' ? '一時停止' :
              '完了'
            }
            color={
              recordingState === 'idle' ? 'default' :
              recordingState === 'recording' ? 'error' :
              recordingState === 'paused' ? 'warning' :
              'success'
            }
            icon={
              recordingState === 'recording' ? <GraphicEq /> :
              recordingState === 'completed' ? <VolumeUp /> :
              undefined
            }
          />
        </Box>

        {/* 進捗バー */}
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: recordingState === 'recording' ? 'error.main' : 'primary.main'
              }
            }}
          />
          <Typography variant="caption" color="text.secondary">
            最大 {formatTime(maxDuration)}
          </Typography>
        </Box>

        {/* 音声レベル表示 */}
        {recordingState === 'recording' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              音声レベル
            </Typography>
            <LinearProgress
              variant="determinate"
              value={audioLevel}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: audioLevel > 80 ? 'error.main' : audioLevel > 50 ? 'warning.main' : 'success.main'
                }
              }}
            />
          </Box>
        )}
      </Box>

      {/* 波形表示 */}
      {recordingState === 'recording' && analyserRef.current && (
        <Box sx={{ mb: 3, height: 100 }}>
          <WaveformVisualizer 
            analyser={analyserRef.current}
            isActive={true}
          />
        </Box>
      )}

      {/* コントロールボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {recordingState === 'idle' && (
          <IconButton
            onClick={startRecording}
            disabled={disabled}
            size="large"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&:disabled': {
                bgcolor: 'grey.300'
              }
            }}
            aria-label="録音開始"
          >
            <Mic />
          </IconButton>
        )}

        {(recordingState === 'recording' || recordingState === 'paused') && (
          <>
            <IconButton
              onClick={pauseResumeRecording}
              size="large"
              sx={{
                bgcolor: 'warning.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'warning.dark'
                }
              }}
              aria-label={recordingState === 'recording' ? '一時停止' : '録音再開'}
            >
              {recordingState === 'recording' ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton
              onClick={stopRecording}
              size="large"
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
              aria-label="録音停止"
            >
              <Stop />
            </IconButton>
          </>
        )}

        {recordingState === 'completed' && audioUrl && (
          <>
            {/* 録音再生 */}
            <audio controls src={audioUrl} style={{ maxWidth: '100%' }} />
            
            <IconButton
              onClick={deleteRecording}
              size="large"
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
              aria-label="録音削除"
            >
              <Delete />
            </IconButton>
          </>
        )}
      </Box>

      {/* ファイル情報 */}
      {audioBlob && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            ファイルサイズ)}KB | 
            品質: {quality} | 
            形式: WebM
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VoiceRecorder;