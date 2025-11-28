# クイックスタートガイド

## 最速で起動する方法

### 1. Docker Composeを使う（推奨）

```bash
cd insight-manager-v2

# コンテナを起動（初回はビルドに時間がかかります）
docker-compose up -d

# データベースのセットアップ（初回のみ）
# コンテナが完全に起動するまで10秒ほど待ってから実行
sleep 10
docker-compose exec app bun run db:push
docker-compose exec app bun run db:seed

# ブラウザで開く
open http://localhost:3000
```

**注意**: シードコマンドを複数回実行しても安全です。既存データがある場合はスキップされます。

### 2. ローカル開発環境で起動

PostgreSQLが必要です。

```bash
cd insight-manager-v2

# 依存関係のインストール
bun install

# .envファイルを編集してDB接続情報を設定
# DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# データベースのセットアップ
bun run db:push
bun run db:seed

# サーバー起動
bun run dev
```

別のターミナルでフロントエンド開発サーバーを起動:
```bash
bun run vite
```

ブラウザで http://localhost:5173 を開く

## ログイン情報

- **ユーザー名**: `admin`
- **パスワード**: `admin123`
- **権限**: Admin

## 次のステップ

1. ログイン後、インサイト一覧画面が表示されます
2. 「新規登録」ボタンでインサイトを作成できます
3. 「マスタ管理」でドロップダウンの選択肢を管理できます（Admin専用）
4. 「CSV ダウンロード」で全データをエクスポートできます

## トラブルシューティング

### データベース接続エラー
- `.env`ファイルの接続情報を確認
- PostgreSQLが起動しているか確認

### ポートが使用中
- `.env`の`PORT`を変更
- または既存のプロセスを停止

### マイグレーションエラー
```bash
# スキーマを再生成
bun run db:generate
bun run db:push
```
