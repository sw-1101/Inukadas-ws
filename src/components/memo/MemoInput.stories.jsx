import { MemoInput } from './MemoInput';

const meta: Meta<typeof MemoInput> = {
  title: 'Components/Memo/MemoInput',
  component: MemoInput,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['text', 'audio', 'mixed']
    },
    placeholder: {
      control: 'text'
    },
    maxLength: {
      control: 'number'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px', padding: '20px' }}>
        <Story />
      </div>
    )
  ]
};

export default meta;
export const TextMode: Story = {
  args: {
    mode: 'text',
    placeholder: 'テキストメモを入力してください...',
    onSubmitSuccess) => console.log('Success:', memoId),
    onSubmitError) => console.log('Error:', error),
    onModeChange) => console.log('Mode changed:', mode)
  }
};

export const AudioMode: Story = {
  args: {
    mode: 'audio',
    onSubmitSuccess) => console.log('Success:', memoId),
    onSubmitError) => console.log('Error:', error),
    onModeChange) => console.log('Mode changed:', mode)
  }
};

export const MixedMode: Story = {
  args: {
    mode: 'mixed',
    placeholder: 'テキストと音声の両方を入力できます...',
    onSubmitSuccess) => console.log('Success:', memoId),
    onSubmitError) => console.log('Error:', error),
    onModeChange) => console.log('Mode changed:', mode)
  }
};

export const CustomLength: Story = {
  args: {
    mode: 'text',
    placeholder: '最大100文字まで入力可能...',
    maxLength: 100,
    onSubmitSuccess) => console.log('Success:', memoId),
    onSubmitError) => console.log('Error:', error)
  }
};