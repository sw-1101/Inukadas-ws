// import { action } from '@storybook/addon-actions';
import { FloatingActionButton } from './FloatingActionButton';

const meta: Meta<typeof FloatingActionButton> = {
  title: 'Buttons/FloatingActionButton',
  component: FloatingActionButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '音声録音用のフローティングアクションボタン。録音状態に応じてアイコンと色が変化し、アニメーション効果も適用される。'
      }
    }
  },
  argTypes: {
    recording: {
      control: 'boolean',
      description: '録音中かどうか',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    disabled: {
      control: 'boolean',
      description: 'ボタンが無効かどうか',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    error: {
      control: 'boolean',
      description: 'エラー状態かどうか',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    onClick: {
      description: 'ボタンクリック時の処理',
      table: {
        type) => void' }
      }
    }
  },
  tags: ['autodocs']
};

export default meta;
export const Default: Story = {
  args: {
    recording: false,
    onClick) => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'デフォルト状態（録音開始前）のフローティングアクションボタン'
      }
    }
  }
};

export const Recording: Story = {
  args: {
    recording: true,
    onClick) => console.log('clicked')
  },
  parameters: {
    docs: {
      description: {
        story: '録音中の状態。パルスアニメーションが適用され、停止ボタンが表示される'
      }
    }
  }
};

export const Disabled: Story = {
  args: {
    recording: false,
    disabled: true,
    onClick) => console.log('clicked')
  },
  parameters: {
    docs: {
      description: {
        story: '無効状態のボタン。クリックできない'
      }
    }
  }
};

export const Error: Story = {
  args: {
    recording: false,
    error: true,
    onClick) => console.log('clicked')
  },
  parameters: {
    docs: {
      description: {
        story: 'エラー状態のボタン。マイクアクセス拒否などのエラー時に表示'
      }
    }
  }
};

export const RecordingDisabled: Story = {
  args: {
    recording: true,
    disabled: true,
    onClick) => console.log('clicked')
  },
  parameters: {
    docs: {
      description: {
        story: '録音中だが無効化されている状態'
      }
    }
  }
};

// インタラクション例
export const Interactive: Story = {
  args: {
    recording: false,
    onClick) => console.log('clicked')
  },
  parameters: {
    docs: {
      description: {
        story: 'インタラクティブな例。ボタンをクリックして動作を確認'
      }
    }
  },
};