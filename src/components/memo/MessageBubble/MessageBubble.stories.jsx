import MessageBubble from './MessageBubble';

const meta: Meta<typeof MessageBubble> = {
  title: 'Memo/MessageBubble',
  component: MessageBubble,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['own', 'system'],
    },
  },
};

export default meta;
const sampleTimestamp = new Date();

export const OwnMessage: Story = {
  args: {
    type: 'own',
    children: 'こんにちは！今日は良い天気ですね。',
    timestamp: sampleTimestamp,
  },
};

export const SystemMessage: Story = {
  args: {
    type: 'system',
    children: '文字起こしが完了しました。',
    timestamp: sampleTimestamp,
  },
};

export const LongMessage: Story = {
  args: {
    type: 'own',
    children: 'これは長いメッセージの例です。LINE風のUI設計により、メッセージは適切に改行され、読みやすく表示されます。長い文章でも美しくレイアウトされるように設計されています。',
    timestamp: sampleTimestamp,
  },
};

export const WithoutTime: Story = {
  args: {
    type: 'own',
    children: '時間を表示しないメッセージです。',
    timestamp: sampleTimestamp,
    showTime: false,
  },
};

export const MultilineMessage: Story = {
  args: {
    type: 'system',
    children: `複数行のメッセージです。
改行も適切に表示されます。
LINE風の見た目を再現しています。`,
    timestamp: sampleTimestamp,
  },
};

// チャット風のコンバーセーション表示
export const Conversation: Story = {
  render) => (
    <div className="space-y-2">
      <MessageBubble type="own" timestamp={new Date(2024, 7, 10, 14, 30)}>
        こんにちは！会議の録音をお願いします。
      </MessageBubble>
      <MessageBubble type="system" timestamp={new Date(2024, 7, 10, 14, 31)}>
        録音を開始しました。
      </MessageBubble>
      <MessageBubble type="own" timestamp={new Date(2024, 7, 10, 14, 45)}>
        ありがとうございます。議事録の作成もお願いします。
      </MessageBubble>
      <MessageBubble type="system" timestamp={new Date(2024, 7, 10, 14, 46)}>
        文字起こしが完了しました。議事録を作成中です...
      </MessageBubble>
    </div>
  ),
};