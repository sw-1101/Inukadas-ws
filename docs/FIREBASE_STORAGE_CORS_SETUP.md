# Firebase Storage CORS設定手順

## 問題
音声ファイルのアップロード時にCORSエラーが発生しています。

## 解決方法

### 方法1: Firebase CLIを使用（推奨）

1. Firebase CLIをインストール
```bash
npm install -g firebase-tools
```

2. Firebaseにログイン
```bash
firebase login
```

3. プロジェクトを初期化
```bash
firebase init
# Storageを選択
```

4. CORS設定を適用
```bash
gsutil cors set cors.json gs://react-firebase-app-e1407.appspot.com
```

### 方法2: Google Cloud Consoleを使用

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクト「react-firebase-app-e1407」を選択
3. Cloud Shellを開く（右上のターミナルアイコン）
4. 以下のコマンドを実行：

```bash
# cors.jsonファイルを作成
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
  }
]
EOF

# CORS設定を適用
gsutil cors set cors.json gs://react-firebase-app-e1407.appspot.com

# 設定を確認
gsutil cors get gs://react-firebase-app-e1407.appspot.com
```

### 方法3: 一時的な回避策（開発環境のみ）

Firebase Storageの代わりにBase64エンコードしてFirestoreに保存：

```javascript
// transcriptionService.tsの変更は既に適用済み
// 小さなファイルの場合はFirestoreに直接保存も可能
```

## 設定確認

CORS設定が正しく適用されているか確認：
```bash
gsutil cors get gs://react-firebase-app-e1407.appspot.com
```

## 注意事項

- 本番環境では適切なoriginのみを許可してください
- `responseHeader`に必要なヘッダーが含まれていることを確認
- Firebase Storageのセキュリティルールも適切に設定してください

## トラブルシューティング

1. **gsutilがインストールされていない場合**
   - Google Cloud SDKをインストール: https://cloud.google.com/sdk/docs/install

2. **権限エラーが発生する場合**
   - Firebaseコンソールでプロジェクトのオーナー権限があることを確認
   - IAMでStorage管理者権限を付与

3. **それでもCORSエラーが続く場合**
   - ブラウザのキャッシュをクリア
   - シークレットウィンドウで試す
   - Firebase Storageのルールを確認