import { MemoCard } from './MemoCard';
import { Timestamp } from 'firebase/firestore';

// モックメモデータ
const audioMemo: AudioMemo = {
  id: 'audio-memo-1',
  userId: 'user-1',
  title: 'テスト音声メモ',
  type: 'audio',
  audioUrl: 'https://example.com/audio.webm',
  audioFileName: 'test-audio.webm',
  duration: 45.5,
  transcription: 'これは音声メモのテスト文字起こしです。',
  transcriptionStatus: 'completed',
  transcriptionRetryCount: 0,
  fileSize: 15000,
  createdAt),
  updatedAt)
};

const textMemo: TextMemo = {
  id: 'text-memo-1',
  userId: 'user-1',
  title: 'テストテキストメモ',
  type: 'text',
  textContent: 'これはテキストメモの内容です。複数行にわたる長いテキストの表示を確認できます。',
  createdAt),
  updatedAt)
};

const mixedMemo: MixedMemo = {
  id: 'mixed-memo-1',
  userId: 'user-1',
  title: 'テスト混合メモ',
  type: 'mixed',
  audioUrl: 'https://example.com/mixed-audio.webm',
  audioFileName: 'mixed-audio.webm',
  duration: 30.2,
  transcription: '音声から文字起こしされたテキスト',
  transcriptionStatus: 'completed',
  transcriptionRetryCount: 0,
  textContent: '手動で追加されたテキストメモ',
  fileSize: 12000,
  createdAt),
  updatedAt)
};

const meta: Meta<typeof MemoCard> = {
  title: 'Components/Memo/MemoCard',
  component: MemoCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    memo: {
      description: 'メモデータ',
      control: false
    },
    onEdit: {
      description: '編集時のコールバック'
    },
    onDelete: {
      description: '削除時のコールバック'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '20px' }}>
        <Story />
      </div>
    )
  ]
};

export default meta;
export const AudioMemoCard: Story = {
  args: {
    memo: audioMemo,
    onPlay) => console.log('play'),
    onPause) => console.log('pause'),
    onEdit) => console.log('edit'),
    onDelete) => console.log('delete')
  }
};

export const TextMemoCard: Story = {
  args: {
    memo: textMemo,
    onPlay) => console.log('play'),
    onPause) => console.log('pause'),
    onEdit) => console.log('edit'),
    onDelete) => console.log('delete')
  }
};

export const MixedMemoCard: Story = {
  args: {
    memo: mixedMemo,
    onPlay) => console.log('play'),
    onPause) => console.log('pause'),
    onEdit) => console.log('edit'),
    onDelete) => console.log('delete')
  }
};

export const ProcessingState: Story = {
  args: {
    memo: {
      ...audioMemo,
      transcriptionStatus: 'processing'
    },
    onPlay) => console.log('play'),
    onPause) => console.log('pause'),
    onEdit) => console.log('edit'),
    onDelete) => console.log('delete')
  }
};