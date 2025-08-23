import { useState } from 'react';
import AudioMessage from './AudioMessage';

const meta: Meta<typeof AudioMessage> = {
  title: 'Memo/AudioMessage',
  component: AudioMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
// ダミーの音声URLとタイムスタンプ
const sampleAudioUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGEcBwOL0fDHdSsE';
const sampleTimestamp = new Date();

export const Default: Story = {
  args: {
    audioUrl: sampleAudioUrl,
    duration: 30,
    timestamp: sampleTimestamp,
  },
};

export const WithTranscription: Story = {
  args: {
    audioUrl: sampleAudioUrl,
    duration: 45,
    transcription: 'これは音声メッセージの文字起こし結果です。音声の内容が自動的にテキスト化されました。',
    timestamp: sampleTimestamp,
  },
};

export const LongAudio: Story = {
  args: {
    audioUrl: sampleAudioUrl,
    duration: 120,
    transcription: '長い音声メッセージの例です。会議の内容や重要な議論、アイデアなどが録音されています。文字起こし機能により、後から内容を確認することができます。',
    timestamp: sampleTimestamp,
  },
};

// インタラクティブな例
const InteractiveAudioMessage = ( => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <AudioMessage
      {...args}
      isPlaying={isPlaying}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
    />
  );
};

export const Interactive: Story = {
  render: InteractiveAudioMessage,
  args: {
    audioUrl: sampleAudioUrl,
    duration: 60,
    transcription: 'クリックして再生・一時停止を試してみてください。音声の再生状態に応じて波形がアニメーションします。',
    timestamp: sampleTimestamp,
  },
};

export const Playing: Story = {
  args: {
    audioUrl: sampleAudioUrl,
    duration: 30,
    isPlaying: true,
    timestamp: sampleTimestamp,
  },
};