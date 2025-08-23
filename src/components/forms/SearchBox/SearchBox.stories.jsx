import SearchBox from './SearchBox'

const sampleOptions = [
  { label: 'React', value: 'react', category: 'フレームワーク' },
  { label: 'Vue.js', value: 'vue', category: 'フレームワーク' },
  { label: 'Angular', value: 'angular', category: 'フレームワーク' },
  { label: 'TypeScript', value: 'typescript', category: '言語' },
  { label: 'JavaScript', value: 'javascript', category: '言語' },
  { label: 'Python', value: 'python', category: '言語' },
  { label: 'Node.js', value: 'nodejs', category: 'ランタイム' },
  { label: 'Deno', value: 'deno', category: 'ランタイム' },
  { label: 'Firebase', value: 'firebase', category: 'BaaS' },
  { label: 'AWS', value: 'aws', category: 'クラウド' },
  { label: 'Docker', value: 'docker', category: 'コンテナ' },
  { label: 'Kubernetes', value: 'k8s', category: 'オーケストレーション' },
]

const meta: Meta<typeof SearchBox> = {
  title: 'Forms/SearchBox',
  component: SearchBox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
高機能な検索ボックスコンポーネントです。単一選択と複数選択の両方に対応しており、オートコンプリート機能も備えています。

## 特徴
- 単一選択・複数選択対応
- オートコンプリート機能
- カテゴリ表示
- フィルターボタン
- クリア機能
- キーボードナビゲーション

## 使用例
\`\`\`tsx
// 単一選択
<SearchBox
  placeholder="技術を検索..."
  options={options}
  onSearch={(query) => console.log('検索:', query)}
/>

// 複数選択
<SearchBox
  multiple
  options={options}
  onMultipleChange={(values) => console.log('選択:', values)}
/>
\`\`\`
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト'
    },
    options: {
      control: 'object',
      description: '検索候補のオプション配列'
    },
    value: {
      control: 'text',
      description: '現在の値（単一選択時）'
    },
    multipleValue: {
      control: 'object',
      description: '現在の値（複数選択時）'
    },
    multiple: {
      control: 'boolean',
      description: '複数選択を許可するか'
    },
    width: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
      description: '検索ボックスの幅'
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'サイズ'
    },
    disabled: {
      control: 'boolean',
      description: '無効化'
    },
    showFilter: {
      control: 'boolean',
      description: 'フィルターボタンの表示'
    },
    loading: {
      control: 'boolean',
      description: 'ローディング状態'
    },
    onSearch: {
      action: 'searched',
      description: '検索実行時のコールバック'
    },
    onChange: {
      action: 'changed',
      description: '値変更時のコールバック'
    },
    onMultipleChange: {
      action: 'multiple changed',
      description: '複数値変更時のコールバック'
    },
    onClear: {
      action: 'cleared',
      description: 'クリア時のコールバック'
    },
    onFilterClick: {
      action: 'filter clicked',
      description: 'フィルターボタンクリック時のコールバック'
    },
  },
}

export default meta
// 基本的な単一選択
export const Default: Story = {
  args: {
    placeholder: '技術を検索してください...',
    width: 400,
  },
}

// オプション付き単一選択
export const WithOptions: Story = {
  args: {
    placeholder: '技術を選択してください...',
    options: sampleOptions,
    width: 400,
  },
}

// 複数選択
export const Multiple: Story = {
  args: {
    placeholder: '複数の技術を選択してください...',
    options: sampleOptions,
    multiple: true,
    width: 500,
  },
}

// 初期値付き単一選択
export const WithInitialValue: Story = {
  args: {
    placeholder: '技術を検索...',
    options: sampleOptions,
    value: 'React',
    width: 400,
  },
}

// 初期値付き複数選択
export const WithInitialMultipleValues: Story = {
  args: {
    placeholder: '技術を選択...',
    options: sampleOptions,
    multiple: true,
    multipleValue: ['react', 'typescript', 'firebase'],
    width: 500,
  },
}

// フィルター付き
export const WithFilter: Story = {
  args: {
    placeholder: 'フィルター付き検索...',
    options: sampleOptions,
    showFilter: true,
    width: 450,
  },
}

// 小サイズ
export const SmallSize: Story = {
  args: {
    placeholder: '小サイズの検索ボックス',
    options: sampleOptions,
    size: 'small',
    width: 300,
  },
}

// 無効化状態
export const Disabled: Story = {
  args: {
    placeholder: '無効化された検索ボックス',
    options: sampleOptions,
    disabled: true,
    value: 'React',
    width: 400,
  },
}

// ローディング状態（複数選択）
export const Loading: Story = {
  args: {
    placeholder: 'データを読み込み中...',
    options: sampleOptions,
    multiple: true,
    loading: true,
    width: 400,
  },
}

// 実用的な例：技術スタック選択
export const TechStackSelector: Story = {
  render) => {
    const techOptions = [
      { label: 'React', value: 'react', category: 'フロントエンド' },
      { label: 'Vue.js', value: 'vue', category: 'フロントエンド' },
      { label: 'Angular', value: 'angular', category: 'フロントエンド' },
      { label: 'Node.js', value: 'nodejs', category: 'バックエンド' },
      { label: 'Python', value: 'python', category: 'バックエンド' },
      { label: 'Go', value: 'go', category: 'バックエンド' },
      { label: 'PostgreSQL', value: 'postgresql', category: 'データベース' },
      { label: 'MongoDB', value: 'mongodb', category: 'データベース' },
      { label: 'Redis', value: 'redis', category: 'データベース' },
      { label: 'Docker', value: 'docker', category: 'インフラ' },
      { label: 'AWS', value: 'aws', category: 'インフラ' },
      { label: 'Firebase', value: 'firebase', category: 'インフラ' },
    ]

    return (
      <div style={{ padding: '2rem', maxWidth: '600px' }}>
        <h3>プロジェクトの技術スタックを選択してください</h3>
        <SearchBox
          placeholder="使用する技術を選択..."
          options={techOptions}
          multiple
          showFilter
          width="100%"
          onMultipleChange={() => {

          }}
          onFilterClick={() => {

          }}
        />
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          複数の技術を選択して、プロジェクトに最適な技術スタックを構成しましょう。
        </p>
      </div>
    )
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '実際のプロジェクトで使用する技術スタック選択の例です。カテゴリ分けされた技術から複数選択できます。'
      }
    }
  }
}

// 検索機能のデモ
export const SearchDemo: Story = {
  render) => {
    const searchResults = [
      { label: 'React ドキュメント', value: 'react-docs', category: '公式ドキュメント' },
      { label: 'React チュートリアル', value: 'react-tutorial', category: 'チュートリアル' },
      { label: 'React Hooks ガイド', value: 'react-hooks', category: 'ガイド' },
      { label: 'React Router', value: 'react-router', category: 'ライブラリ' },
      { label: 'React Testing Library', value: 'react-testing', category: 'テスト' },
    ]

    return (
      <div style={{ padding: '2rem', maxWidth: '500px' }}>
        <h3>技術文書を検索</h3>
        <SearchBox
          placeholder="文書名を入力して検索..."
          options={searchResults}
          width="100%"
          onSearch={(query) => {

            alert(`"${query}" で検索しました`)
          }}
          onChange={() => {

          }}
        />
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          <p>💡 入力してEnterキーで検索、またはドロップダウンから選択できます</p>
        </div>
      </div>
    )
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: '検索機能のデモです。テキスト入力とオートコンプリートの両方に対応しています。'
      }
    }
  }
}

// サイズ比較
export const SizeComparison: Story = {
  render) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
      <div>
        <h4>Small Size</h4>
        <SearchBox
          placeholder="小サイズ"
          options={sampleOptions.slice(0, 5)}
          size="small"
          width={300}
        />
      </div>
      <div>
        <h4>Medium Size</h4>
        <SearchBox
          placeholder="中サイズ"
          options={sampleOptions.slice(0, 5)}
          size="medium"
          width={300}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '異なるサイズの検索ボックスを比較した例です。'
      }
    }
  }
}

// エラー状態
export const ErrorState: Story = {
  args: {
    placeholder: '検索に失敗しました',
    options: [],
    disabled: true,
    width: 400,
  },
  parameters: {
    backgrounds: { default: 'gray' },
    docs: {
      description: {
        story: '検索機能でエラーが発生した場合の表示例です。'
      }
    }
  }
}