import Card from './Card'

const meta: Meta<typeof Card> = {
  title: 'Common/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
再利用可能なカードコンポーネントです。ブログ記事、商品情報、ユーザープロフィールなど様々な用途に使用できます。

## 特徴
- Material-UI Cardをベースにした拡張コンポーネント
- アバター、画像、タグ、アクションボタンに対応
- ホバーアニメーション付き
- レスポンシブ対応

## 使用例
\`\`\`tsx
<Card
  title="記事タイトル"
  subtitle="2024年1月1日"
  content="記事の内容がここに表示されます..."
  tags={['React', 'TypeScript']}
  onLike={() => console.log('liked!')}
/>
\`\`\`
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'カードのメインタイトル'
    },
    subtitle: {
      control: 'text',
      description: 'サブタイトル（日付、作者名など）'
    },
    content: {
      control: 'text',
      description: 'カードの本文内容'
    },
    imageUrl: {
      control: 'text',
      description: 'カードヘッダーに表示する画像のURL'
    },
    avatarUrl: {
      control: 'text',
      description: 'アバター画像のURL'
    },
    tags: {
      control: 'object',
      description: 'タグの配列'
    },
    variant: {
      control: 'select',
      options: ['outlined', 'elevation'],
      description: 'カードの見た目のバリエーション'
    },
    maxWidth: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
      description: 'カードの最大幅（px）'
    },
    likeCount: {
      control: { type: 'number', min: 0 },
      description: 'いいね数'
    },
    shareCount: {
      control: { type: 'number', min: 0 },
      description: 'シェア数'
    },
    onClick: {
      action: 'card clicked',
      description: 'カードクリック時のコールバック'
    },
    onLike: {
      action: 'liked',
      description: 'いいねボタンクリック時のコールバック'
    },
    onShare: {
      action: 'shared',
      description: 'シェアボタンクリック時のコールバック'
    },
    onMenuClick: {
      action: 'menu clicked',
      description: 'メニューボタンクリック時のコールバック'
    },
  },
}

export default meta
// 基本的な使用例
export const Default: Story = {
  args: {
    title: 'サンプル記事のタイトル',
    subtitle: '2024年1月15日',
    content: 'これはサンプルの記事内容です。React と TypeScript を使った開発について説明しています。この記事では、コンポーネントの設計やテストの書き方について詳しく解説します。',
    tags: ['React', 'TypeScript', 'フロントエンド'],
    likeCount: 42,
    shareCount: 12,
  },
}

// 画像付きカード
export const WithImage: Story = {
  args: {
    title: 'React + Firebase 開発ガイド',
    subtitle: '2024年1月10日 • 開発者ブログ',
    content: 'React と Firebase を組み合わせたモダンなWebアプリケーション開発について、実際のプロジェクトを例に詳しく解説します。認証からデプロイまでの全工程をカバーしています。',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjQwMHgyMDA8L3RleHQ+PC9zdmc+',
    avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzAwNzNlNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VTwvdGV4dD48L3N2Zz4=',
    tags: ['React', 'Firebase', 'JavaScript', 'チュートリアル'],
    likeCount: 156,
    shareCount: 23,
  },
}

// シンプルなカード（アクションなし）
export const Simple: Story = {
  args: {
    title: 'お知らせ',
    content: 'システムメンテナンスのお知らせです。明日の午後2時から4時まで、システムメンテナンスを実施いたします。この間、一部機能がご利用いただけません。',
    variant: 'outlined',
    maxWidth: 300,
  },
}

// プロフィールカード風
export const Profile: Story = {
  args: {
    title: '山田太郎',
    subtitle: 'フロントエンドエンジニア',
    content: '5年間のWeb開発経験を持つフロントエンドエンジニアです。React、Vue.js、TypeScriptを得意とし、ユーザビリティを重視したアプリケーション開発を行っています。',
    avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzI1NGY5NiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VDwvdGV4dD48L3N2Zz4=',
    tags: ['React', 'Vue.js', 'TypeScript', 'UI/UX'],
    variant: 'outlined',
  },
}

// 商品カード風
export const Product: Story = {
  args: {
    title: 'ワイヤレスヘッドフォン',
    subtitle: '¥12,800',
    content: '高音質でノイズキャンセリング機能付きのワイヤレスヘッドフォンです。最大30時間の連続再生が可能で、快適な装着感を実現しています。',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMTAwIiByPSIzMCIgZmlsbD0iIzY2NjY2NiIvPjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhlYWRwaG9uZXM8L3RleHQ+PC9zdmc+',
    tags: ['オーディオ', 'ワイヤレス', 'ノイズキャンセリング'],
    likeCount: 89,
    variant: 'elevation',
  },
}

// インタラクティブなカード
export const Interactive: Story = {
  args: {
    title: 'クリックしてください',
    subtitle: 'インタラクション例',
    content: 'このカードはクリック可能です。また、いいねボタンやシェアボタンも実際に動作します。メニューボタンも試してみてください。',
    tags: ['インタラクティブ', 'サンプル'],
    likeCount: 5,
    shareCount: 2,
    onClick) => alert('カードがクリックされました！'),
    onLike) => alert('いいねしました！'),
    onShare) => alert('シェアしました！'),
    onMenuClick) => alert('メニューが開かれました！'),
  },
}

// 異なるサイズのカード
export const DifferentSizes: Story = {
  render) => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Card
        title="小サイズ"
        content="幅250pxのコンパクトなカード"
        maxWidth={250}
        tags={['小']}
      />
      <Card
        title="中サイズ"
        content="幅400pxの標準的なカード"
        maxWidth={400}
        tags={['中']}
      />
      <Card
        title="大サイズ"
        content="幅600pxの大きなカード"
        maxWidth={600}
        tags={['大']}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '異なるサイズのカードを並べて表示した例です。maxWidthプロパティでサイズを調整できます。'
      }
    }
  }
}

// バリエーション比較
export const Variants: Story = {
  render) => (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Card
        title="Elevation Card"
        subtitle="影付きカード"
        content="デフォルトの影付きカードです。立体感があり、重要な情報を強調したい場合に使用します。"
        variant="elevation"
        tags={['elevation']}
        likeCount={10}
      />
      <Card
        title="Outlined Card"
        subtitle="枠線カード"
        content="枠線のみのシンプルなカードです。軽い印象で、リスト表示などに適しています。"
        variant="outlined"
        tags={['outlined']}
        likeCount={8}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'elevationとoutlinedの2つのバリエーションを比較した例です。用途に応じて使い分けてください。'
      }
    }
  }
}

// エラー状態のカード
export const ErrorState: Story = {
  args: {
    title: 'エラーが発生しました',
    subtitle: 'エラーコード: 500',
    content: 'サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください。問題が続く場合は、サポートチームにお問い合わせください。',
    variant: 'outlined',
    tags: ['エラー', 'サーバー'],
  },
  parameters: {
    backgrounds: { default: 'gray' },
    docs: {
      description: {
        story: 'エラー状態を表現するカードの例です。重要な情報を分かりやすく伝えます。'
      }
    }
  }
}

// ローディング状態のカード
export const LoadingState: Story = {
  args: {
    title: '読み込み中...',
    content: 'データを読み込んでいます。しばらくお待ちください。',
    tags: ['読み込み中'],
  },
  parameters: {
    docs: {
      description: {
        story: 'データ読み込み中の状態を表現するカードです。ユーザーに待機状態を知らせます。'
      }
    }
  }
}