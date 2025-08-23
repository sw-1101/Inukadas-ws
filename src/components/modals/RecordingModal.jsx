import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Box,
  LinearProgress,
  Fade
} from '@mui/material';
import { Stop, CheckCircle, Close } from '@mui/icons-material';
import { WaveformVisualizer } from '../audio/WaveformVisualizer';

/**
 * 録音モーダルコンポーネント
 * 
 * 設計原則:
 * - フルスクリーンモーダル
 * - 波形表示とリアルタイム更新
 * - 時間表示とプログレスバー
 * - アクセシビリティ対応
 */


export const RecordingModal= ({
  isOpen,
  isRecording,
  duration,
  maxDuration = 60,
  waveformData = new Float32Array(),
  error,
  onClose,
  onStop,
  onComplete
}) => {
  const [showContent, setShowContent] = useState(false);

  // プログレス計算
  const progress = Math.min((duration / maxDuration) * 100, 100);

  // 時間フォーマット
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // モーダル開閉時のアニメーション制御
  useEffect(() => {
    if (isOpen) {
      setShowContent(true);
    } else {
      const timer = setTimeout(() => setShowContent(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESCキーでの閉じる処理
  useEffect(() => {
    const handleKeyPress = ( => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
      if (event.key === ' ' && isOpen && isRecording) {
        event.preventDefault();
        onStop();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, isRecording, onClose, onStop]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullScreen
      disablePortal
      hideBackdrop={false}
      disableEscapeKeyDown={false}
      PaperProps={{
        sx: {
          bgcolor)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }}
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: 300
      }}
      aria-labelledby="recording-modal-title"
      aria-describedby="recording-modal-description"
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
          padding: 0,
          position: 'relative'
        }}
      >
        {/* 閉じるボタン */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            zIndex: 1001
          }}
          aria-label="モーダルを閉じる"
        >
          <Close fontSize="large" />
        </IconButton>

        {showContent && (
          <Fade in={showContent} timeout={500}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 400,
                px: 3
              }}
            >
              {/* ステータステキスト */}
              <Typography
                id="recording-modal-title"
                variant="h4"
                sx={{
                  mb: 4,
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  animation: isRecording ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 }
                  }
                }}
              >
                {error ? '⚠️ エラー' : isRecording ? '🔴 録音中' : '⏸️ 一時停止'}
              </Typography>

              {/* エラーメッセージ */}
              {error && (
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    color: 'error.main',
                    textAlign: 'center'
                  }}
                >
                  {error}
                </Typography>
              )}

              {/* 波形表示 */}
              {!error && (
                <Box sx={{ mb: 4, width: '100%' }}>
                  <WaveformVisualizer
                    audioData={waveformData}
                    isRecording={isRecording}
                    duration={duration}
                    height={120}
                    color="white"
                  />
                </Box>
              )}

              {/* 時間表示 */}
              <Typography
                variant="h2"
                sx={{
                  mb: 2,
                  color: 'white',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  textAlign: 'center'
                }}
                id="recording-modal-description"
              >
                {formatTime(duration)}
              </Typography>

              {/* 最大時間表示 */}
              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  color: 'grey.400',
                  textAlign: 'center'
                }}
              >
                / {formatTime(maxDuration)}
              </Typography>

              {/* プログレスバー */}
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  width: '100%',
                  mb: 4,
                  height: 8,
                  borderRadius: 4,
                  bgcolor)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progress >= 90 ? 'warning.main' : 'primary.main',
                    borderRadius: 4
                  }
                }}
                aria-label={`録音進捗 ${Math.round(progress)}%`}
              />

              {/* 時間警告 */}
              {progress >= 90 && (
                <Typography
                  variant="caption"
                  sx={{
                    mb: 2,
                    color: 'warning.main',
                    textAlign: 'center',
                    animation: 'blink 1s infinite',
                    '@keyframes blink': {
                      '0%, 50%': { opacity: 1 },
                      '51%, 100%': { opacity: 0.5 }
                    }
                  }}
                >
                  もうすぐ最大録音時間に達します
                </Typography>
              )}

              {/* アクションボタン */}
              {!error && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 3,
                    justifyContent: 'center'
                  }}
                >
                  {/* 停止ボタン */}
                  <IconButton
                    onClick={onStop}
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      width: 80,
                      height: 80,
                      '&:hover': {
                        bgcolor: 'error.dark',
                        transform)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                    aria-label="録音を停止"
                  >
                    <Stop fontSize="large" />
                  </IconButton>

                  {/* 完了ボタン */}
                  <IconButton
                    onClick={onComplete}
                    sx={{
                      bgcolor: 'success.main',
                      color: 'white',
                      width: 80,
                      height: 80,
                      '&:hover': {
                        bgcolor: 'success.dark',
                        transform)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                    aria-label="録音を完了"
                  >
                    <CheckCircle fontSize="large" />
                  </IconButton>
                </Box>
              )}

              {/* キーボードショートカットのヒント */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 32,
                  left: '50%',
                  transform)',
                  textAlign: 'center'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'grey.500',
                    display: 'block'
                  }}
                >
                  Escキーで閉じる / Spaceキーで停止
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecordingModal;