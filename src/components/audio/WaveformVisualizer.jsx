import React, { useEffect, useRef, useState } from 'react';
// TODO: MUI to CSS Modules conversion needed
import { Box } from '@mui/icons-material';

/**
 * 波形表示コンポーネント
 * 
 * 設計原則:
 * - Canvas APIを使用したリアルタイム波形描画
 * - 音声データの視覚化
 * - レスポンシブ対応
 * - パフォーマンス最適化
 */


export const WaveformVisualizer= ({
  audioData,
  isRecording = false,
  duration = 0,
  analyser,
  isActive = false,
  width = 300,
  height = 120,
  color = '#1976d2',
  backgroundColor = 'transparent',
  barCount = 32,
  sx
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(0);
  const [displayData, setDisplayData] = useState(new Array(barCount).fill(0));

  // 音声データの正規化と平滑化
  const processAudioData = (data) => {
    if (!data || data.length === 0) {
      return new Array(barCount).fill(0);
    }

    const processed = new Array(barCount);
    const chunkSize = Math.floor(data.length / barCount);

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);

      for (let j = start; j < end; j++) {
        // 周波数データを振幅に変換（dBからリニアへ）
        const amplitude = Math.pow(10, data[j] / 20);
        sum += amplitude;
      }

      // 平均を取り、0-1の範囲に正規化
      const average = sum / (end - start);
      processed[i] = Math.max(0, Math.min(1, average * 2)); // 感度調整
    }

    return processed;
  };

  // 波形の描画
  const drawWaveform = ( => {
    const canvas = ctx.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 背景をクリア
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // バーの幅と間隔を計算
    const barWidth = canvasWidth / barCount;
    const maxBarHeight = canvasHeight * 0.8;
    const centerY = canvasHeight / 2;

    // 波形バーを描画
    data.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = Math.max(2, value * maxBarHeight);
      
      // グラデーション効果
      const gradient = ctx.createLinearGradient(0, centerY - barHeight/2, 0, centerY + barHeight/2);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color + '80'); // 半透明
      gradient.addColorStop(1, color);
      
      ctx.fillStyle = gradient;
      
      // バーを描画（中央基準で上下に伸びる）
      ctx.fillRect(
        x + barWidth * 0.1, // 少し内側に
        centerY - barHeight / 2,
        barWidth * 0.8, // バー幅の80%
        barHeight
      );
    });

    // 録音中のパルス効果
    if (isRecording) {
      const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      ctx.globalAlpha = pulseIntensity;
      
      // 中央線を描画
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvasWidth, centerY);
      ctx.stroke();
      
      ctx.globalAlpha = 1;
    }
  };

  // リアルタイムデータ取得
  const getRealtimeData = (): Float32Array | null => {
    if (!analyser) return null;
    
    const dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(dataArray);
    return dataArray;
  };

  // アニメーションループ
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 新しい音声データを処理（Analyserからリアルタイム取得または静的データ）
    const currentAudioData = getRealtimeData() || audioData;
    const newData = processAudioData(currentAudioData);
    
    // データの平滑化（急激な変化を抑制）
    setDisplayData(prevData => {
      return prevData.map((prevValue, index) => {
        const targetValue = newData[index] || 0;
        const smoothingFactor = 0.7; // 0-1の範囲（1に近いほど滑らか）
        return prevValue * smoothingFactor + targetValue * (1 - smoothingFactor);
      });
    });

    if (isRecording || isActive) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // 描画の実行
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWaveform(ctx, displayData);
  }, [displayData, color, backgroundColor, barCount, isRecording]);

  // アニメーションの制御
  useEffect(() => {
    if (isRecording || isActive) {
      animate();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, isActive, audioData, analyser]);

  // Canvas のサイズ設定
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // デバイスピクセル密度を考慮した高品質描画
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, [width, height]);

  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: width,
          borderRadius: 8,
          backgroundColor: backgroundColor || 'transparent'
        }}
        aria-label={`音声波形)}分${duration % 60}秒`}
      />
    </Box>
  );
};

export default WaveformVisualizer;