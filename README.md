# 🚀 React Firebase Sample App

**わたなべによるわたなべのためのReact学習用プロジェクト**

React + JavaScript + Firebase + Gemini API を利用したわたなべのお勉強アプリ

[![CI/CD](https://github.com/your-repo/react-firebase-app/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/your-repo/react-firebase-app/actions)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat&logo=storybook&logoColor=white)](https://your-storybook-url.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)

![Inukadas Logo](https://raw.githubusercontent.com/sw-1101/Inukadas-ws/main/src/assets/Inukadas-logo.svg?sanitize=true)

---

## 🎯 このプロジェクトについて

### 特徴
- 🔥 **Modern Stack**: React 19 + JavaScript + Firebase
- 🤖 **AI Integration**: Gemini API によるマルチモーダル処理
- 🎵 **Audio Features**: 音声録音・再生・文字起こし
- 📁 **File Upload**: 画像・動画・PDF・Excel・Markdown対応
- 🔍 **AI Search**: 自然言語検索機能
- 📚 **Storybook**: コンポーネント駆動開発
- 🎭 **E2E Testing**: Playwright による自動テスト
- 🚀 **CI/CD**: GitHub Actions + Vercel による自動デプロイ
- 📱 **Responsive**: モバイル・デスクトップ対応
- 🔐 **Secure**: Firebase セキュリティルール適用


---

## 📚 ドキュメント

- 📖 **[プロジェクト概要](./docs/PROJECT_OVERVIEW.md)** - 技術スタック・アーキテクチャ
- 🎨 **[Storybook ガイド](./docs/STORYBOOK_GUIDE.md)** - コンポーネント開発手法
- 🔄 **[CI/CD 図解ガイド](./docs/CICD_VISUAL_GUIDE.md)** - 自動化フロー
- ⚙️ **[GitHub Actions 設定](./docs/GITHUB_ACTIONS_SETUP.md)** - CI/CD 設定手順

---

## 🚀 クイックスタート

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.localにFirebase・Gemini API設定を追加

# 開発サーバー起動
npm run dev  # http://localhost:5173

# Storybook起動（別ターミナル）
npm run storybook  # http://localhost:6006
```

### 利用可能なコマンド

```bash
# 開発
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run preview      # ビルド結果プレビュー

# 品質管理
npm run lint         # ESLint実行
npm run test         # ユニットテスト
npm run test:e2e     # E2Eテスト

# Storybook
npm run storybook    # Storybook開発サーバー
```

## 🏗️ 技術スタック

- **Frontend**: React 19 + JavaScript + CSS Modules + Framer Motion
- **Backend**: Firebase (Auth + Firestore) + Gemini API  
- **Hosting**: Vercel
- **Development**: Vite + Storybook + Playwright + ESLint

</div>