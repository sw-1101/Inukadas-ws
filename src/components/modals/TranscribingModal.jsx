import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  Fade,
  Grow,
  IconButton
} from '@mui/material';
import { Close, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

/**
 * 文字起こしモーダルコンポーネント
 * 
 * 設計原則:
 * - プロセス段階の視覚化
 * - ローディングアニメーション
 * - エラーハンドリング
 * - 段階的メッセージ表示
 */


export const TranscribingModal= ({
  isOpen,
  progress,
  message,
  stage,
  error,
  onClose,
  onComplete,
  onRetry
}) => {
  const [showContent, setShowContent] = useState(false);
  const [dots, setDots] = useState('');

  // ローディングドットのアニメーション
  useEffect(() => {
    if (stage === 'processing' || stage === 'uploading' || stage === 'finalizing') {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [stage]);

  // モーダル開閉時のアニメーション制御
  useEffect(() => {
    if (isOpen) {
      setShowContent(true);
    } else {
      const timer = setTimeout(() => setShowContent(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 完了時の自動クローズ
  useEffect(() => {
    if (stage === 'completed' && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
        onClose();
      }, 2000); // 2秒後に自動で閉じる

      return () => clearTimeout(timer);
    }
  }, [stage, onComplete, onClose]);

  // ステージに応じたアイコンとカラー
  const getStageInfo = () => {
    switch (stage) {
      case 'uploading':
        return {
          icon: <CircularProgress size={60} sx={{ color: 'primary.main' }} />,
          color: 'primary.main',
          title: '⬆️ アップロード中'
        };
      case 'processing':
        return {
          icon: <CircularProgress size={60} sx={{ color: 'secondary.main' }} />,
          color: 'secondary.main',
          title: '⚡ 文字起こし中'
        };
      case 'finalizing':
        return {
          icon: <CircularProgress size={60} sx={{ color: 'info.main' }} />,
          color: 'info.main',
          title: '✨ 最終処理中'
        };
      case 'completed':
        return {
          icon: <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />,
          color: 'success.main',
          title: '✅ 完了しました！'
        };
      case 'error':
        return {
          icon: <ErrorIcon sx={{ fontSize: 60, color: 'error.main' }} />,
          color: 'error.main',
          title: '❌ エラーが発生しました'
        };
      default:
        return {
          icon: <CircularProgress size={60} />,
          color: 'primary.main',
          title: '処理中'
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <Dialog
      open={isOpen}
      onClose={stage === 'completed' || stage === 'error' ? onClose : undefined}
      PaperProps={{
        sx: {
          bgcolor)',
          color: 'white',
          borderRadius: 2,
          minWidth: 400,
          maxWidth: 500,
          mx: 2
        }
      }}
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: 300
      }}
      aria-labelledby="transcribing-modal-title"
      aria-describedby="transcribing-modal-description"
    >
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          px: 4,
          position: 'relative'
        }}
      >
        {/* 閉じるボタン（エラー時・完了時のみ） */}
        {(stage === 'error' || stage === 'completed') && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white'
            }}
            aria-label="モーダルを閉じる"
          >
            <Close />
          </IconButton>
        )}

        {showContent && (
          <Fade in={showContent} timeout={500}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%'
              }}
            >
              {/* アイコン表示エリア */}
              <Box sx={{ mb: 3 }}>
                <Grow in={showContent} timeout={1000}>
                  <Box>{stageInfo.icon}</Box>
                </Grow>
              </Box>

              {/* タイトル */}
              <Typography
                id="transcribing-modal-title"
                variant="h5"
                sx={{
                  mb: 2,
                  color: stageInfo.color,
                  fontWeight: 'bold'
                }}
              >
                {stageInfo.title}
              </Typography>

              {/* メッセージ */}
              <Typography
                id="transcribing-modal-description"
                variant="body1"
                sx={{
                  mb: 3,
                  color: 'grey.300',
                  minHeight: 24
                }}
              >
                {stage === 'error' ? error : `${message}${dots}`}
              </Typography>

              {/* プログレスバー（処理中のみ） */}
              {(stage === 'uploading' || stage === 'processing' || stage === 'finalizing') && (
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1
                    }}
                  >
                    <Typography variant="caption" color="grey.400">
                      進捗
                    </Typography>
                    <Typography variant="caption" color="grey.400">
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 6,
                      backgroundColor)',
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: stageInfo.color,
                        borderRadius: 3,
                        transition: 'width 0.3s ease-in-out'
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* 段階別メッセージ */}
              <Box sx={{ mt: 2 }}>
                {stage === 'uploading' && (
                  <Typography variant="caption" color="grey.500">
                    音声ファイルをサーバーに送信しています
                  </Typography>
                )}
                {stage === 'processing' && (
                  <Typography variant="caption" color="grey.500">
                    AIが音声を解析して文字に変換しています
                  </Typography>
                )}
                {stage === 'finalizing' && (
                  <Typography variant="caption" color="grey.500">
                    テキストを整理して保存しています
                  </Typography>
                )}
                {stage === 'completed' && (
                  <Typography variant="caption" color="success.light">
                    文字起こしが完了しました
                  </Typography>
                )}
                {stage === 'error' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="error.light" sx={{ display: 'block', mb: 2 }}>
                      処理中にエラーが発生しました
                    </Typography>
                    {onRetry && (
                      <Box
                        component="button"
                        onClick={onRetry}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          border: 'none',
                          borderRadius: 1,
                          px: 3,
                          py: 1,
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }}
                      >
                        リトライ
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* 処理時間の目安 */}
              {(stage === 'processing') && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    color: 'grey.600',
                    fontStyle: 'italic'
                  }}
                >
                  通常10-30秒程度で完了します
                </Typography>
              )}
            </Box>
          </Fade>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TranscribingModal;