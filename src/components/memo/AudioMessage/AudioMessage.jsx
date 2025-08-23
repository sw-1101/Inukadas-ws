import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageBubble } from '../MessageBubble';
import styles from './AudioMessage.module.css';


const AudioMessage= ({
  audioUrl,
  duration,
  transcription,
  timestamp,
  isPlaying = false,
  onPlay,
  onPause,
  className,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // 再生時間の更新
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      onPause?.();
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onPause]);

  // 再生・一時停止の制御
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const formatTime = ( => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <MessageBubble
      type="own"
      timestamp={timestamp}
      className={className}
    >
      <div className={styles.container}>
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        {/* 音声コントロールエリア */}
        <div className={styles.audioControls}>
          {/* 再生ボタン */}
          <motion.button
            className={styles.playButton}
            onClick={handlePlayPause}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            {isLoading ? (
              <div className={styles.loadingSpinner} />
            ) : isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}
          </motion.button>

          {/* 波形・プログレス表示 */}
          <div className={styles.waveformContainer}>
            <div className={styles.waveform}>
              {/* シンプルな波形表示 */}
              {Array.from( => (
                <motion.div
                  key={i}
                  className={styles.waveformBar}
                  style={{
                    height) * 60 + 20}%`,
                    opacity) < progress ? 1 : 0.3,
                  }}
                  animate={isPlaying ? {
                    scaleY: [1, 1.5, 1],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
            
            {/* プログレスオーバーレイ */}
            <div 
              className={styles.progressOverlay}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 時間表示 */}
          <div className={styles.timeDisplay}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* 文字起こしテキスト */}
        {transcription && (
          <motion.div
            className={styles.transcription}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className={styles.transcriptionLabel}>
              文字起こし:
            </div>
            <p className={styles.transcriptionText}>
              {transcription}
            </p>
          </motion.div>
        )}
      </div>
    </MessageBubble>
  );
};

// アイコンコンポーネント
const PlayIcon= () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon= () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </svg>
);

export default AudioMessage;