# データカタログ v01

データベーステーブル定義を管理するためのWebアプリケーション

## 機能

- ✅ テーブル定義管理（最大500カラム対応）
- ✅ カラム定義管理（PK/FK/NULL制約対応）
- ✅ 部分一致検索（テーブル名、カラム名、概要）
- ✅ テーブル詳細表示
- ✅ CSV エクスポート
- ✅ ロールベースアクセス制御（編集者/閲覧者）

## 技術スタック

- **Runtime**: Bun 1.3+
- **Backend Framework**: Hono
- **Database**: SQLite (Bun built-in)
- **Frontend**: Vanilla JavaScript + HTML/CSS
- **Deployment**: Docker, AWS Lightsail

## セットアップ

### ローカル開発

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun run dev
```

ブラウザで http://localhost:3000 にアクセス

### Docker デプロイ

```bash
# Docker イメージのビルドと起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

### AWS Lightsail デプロイ

1. Lightsail インスタンスを作成（Ubuntu推奨）
2. Docker と Docker Compose をインストール
3. リポジトリをクローン
4. `docker-compose up -d` で起動

## API エンドポイント

### テーブル管理
- `GET /api/tables` - テーブル一覧取得
- `GET /api/tables/:id` - テーブル詳細取得（カラム含む）
- `POST /api/tables` - テーブル作成
- `PUT /api/tables/:id` - テーブル更新
- `DELETE /api/tables/:id` - テーブル削除

### カラム管理
- `GET /api/columns/table/:tableId` - テーブルのカラム一覧
- `POST /api/columns` - カラム作成（500列制限あり）
- `PUT /api/columns/:id` - カラム更新
- `DELETE /api/columns/:id` - カラム削除

### 検索・エクスポート
- `GET /api/search?q=query` - 部分一致検索
- `GET /api/backup/csv/:id` - CSV ダウンロード

### ユーザー管理
- `GET /api/users` - ユーザー一覧
- `POST /api/users` - ユーザー作成
- `PUT /api/users/:id` - ユーザー更新
- `DELETE /api/users/:id` - ユーザー削除

## データベーススキーマ

### data_tables
テーブル定義を格納

### data_columns
カラム定義を格納（table_id で data_tables と紐付け）

### users
ユーザーとロール（editor/viewer）を管理

## デフォルトユーザー

初回起動時に以下のユーザーが自動作成されます：
- **ユーザー名**: admin
- **名前**: 管理者
- **ロール**: editor

## ライセンス

MIT
