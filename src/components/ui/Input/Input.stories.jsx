import { useState } from 'react';
import Input from './Input';

const InteractiveInput = ( => {
  const [value, setValue] = useState(args.value || '');
  return <Input {...args} value={value} onChange={setValue} />;
};

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
export const Default: Story = {
  render: InteractiveInput,
  args: {
    placeholder: 'メッセージを入力してください...',
    onFocus) => console.log('input-focused'),
    onBlur) => console.log('input-blurred')
  }
};

export const WithError: Story = {
  render: InteractiveInput,
  args: {
    placeholder: 'メッセージを入力してください...',
    error: 'このフィールドは必須です',
  }
};

export const Disabled: Story = {
  render: InteractiveInput,
  args: {
    placeholder: '無効化された入力フィールド',
    disabled: true,
  }
};

export const AutoResize: Story = {
  render: InteractiveInput,
  args: {
    placeholder: '自動拡張するテキストエリア。長いメッセージを入力してみてください...',
    autoResize: true,
    maxRows: 5,
  },
  parameters: {
    layout: 'padded',
  }
};

export const AutoResizeWithContent: Story = {
  render) => {
    const [value, setValue] = useState('これは複数行の\nテキスト例です。\n自動的に高さが\n調整されます。');
    return <Input {...args} value={value} onChange={setValue} />;
  },
  args: {
    placeholder: '初期値ありの自動拡張テキストエリア',
    autoResize: true,
    maxRows: 8,
  },
  parameters: {
    layout: 'padded',
  }
};