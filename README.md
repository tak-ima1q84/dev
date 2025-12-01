# インサイト管理ツール v3

モバイルアプリに表示される「インサイト（通知・マーケティングカード）」のコンテンツデータ、表示ロジック、関連画像を管理するWebアプリケーションです。

**v3の新機能**: Render Web App + PostgreSQL対応

## 技術スタック

- **Runtime**: Bun v1.x
- **Backend**: ElysiaJS
- **Frontend**: React + Vite
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Deployment**: Render (Web App + PostgreSQL)
- **Container**: Docker (local development)
- **Authentication**: JWT

## 主な機能

### 認証・権限管理
- ✅ JWT ベースのユーザー認証
- ✅ 3つのユーザーロール（Admin/Manager/Viewer）
- ✅ ロールベースのアクセス制御

### インサイト管理
- ✅ インサイトデータの完全なCRUD操作（34フィールド対応）
- ✅ 作成番号による管理（1-19999）
- ✅ ステータス管理（配信開始日・停止日）
- ✅ カテゴリ分類（メイン・サブ・データカテゴリ）
- ✅ 表示ロジック設定
- ✅ 対象ユーザー・銀行・テーブル指定
- ✅ 関連インサイト設定

### 検索・フィルタリング
- ✅ 作成番号検索
- ✅ 件名・インサイトID部分一致検索
- ✅ ステータス・タイプ・カテゴリ絞り込み
- ✅ 表示ロジック検索
- ✅ 関連インサイト検索
- ✅ 金融データ利用銀行（複数選択）
- ✅ 使用データテーブル（複数選択）

### 画像管理
- ✅ ティーザー画像アップロード（PNG/JPEG対応）
- ✅ ストーリー画像アップロード（最大3枚）
- ✅ 画像プレビュー機能（拡大表示対応）
- ✅ URL直接入力対応

### データインポート・エクスポート
- ✅ CSV エクスポート（全データ）
- ✅ CSV インポート（一括登録）
- ✅ インポートエラー詳細表示
- ✅ JSON配列フィールド対応

### マスタデータ管理
- ✅ マスタデータのCRUD操作（Admin専用）
- ✅ カテゴリ別管理
- ✅ 表示順序設定
- ✅ 重複チェック

## デプロイ

### Render へのデプロイ（本番環境）

詳細な手順は [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) を参照してください。

**クイックスタート**:
1. GitHubにコードをプッシュ
2. Renderで「New Blueprint」を選択
3. リポジトリを接続（`render.yaml`が自動検出されます）
4. デプロイ後、Shellで以下を実行:
   ```bash
   bun run db:push
   bun run db:seed
   ```

## セットアップ

### 前提条件

- Bun v1.x以上
- Docker & Docker Compose（ローカル開発用）
- Render アカウント（本番デプロイ用）

### ローカル開発

1. 依存関係のインストール:
```bash
bun install
```

2. 環境変数の設定:
`.env`ファイルを編集してデータベース接続情報を設定

3. データベースのセットアップ:
```bash
# マイグレーションの生成
bun run db:generate

# データベースにスキーマを適用
bun run db:push

# 初期データの投入
bun run db:seed
```

4. 開発サーバーの起動:
```bash
bun run dev
```

5. フロントエンドの開発（別ターミナル）:
```bash
bun run vite
```

アプリケーションは http://localhost:3000 で起動します。

### Docker での起動

```bash
docker-compose up -d
```

初回起動時はコンテナ内でマイグレーションとシードを実行:
```bash
docker-compose exec app bun run db:push
docker-compose exec app bun run db:seed
```

## デフォルトユーザー

初回起動時に以下のユーザーが自動作成されます：

| ユーザー名 | パスワード | 権限 | 権限内容 |
|-----------|----------|------|---------|
| admin | admin123 | Admin | 全機能利用可能（マスタ管理含む） |
| manager | manager123 | Manager | インサイトの作成・編集・削除・CSV操作 |
| viewer | viewer123 | Viewer | 閲覧のみ |

## 使い方

### ログイン
1. ブラウザで http://localhost:3000 にアクセス
2. デフォルトユーザーでログイン

### インサイト検索
1. 検索パネルで条件を入力
2. 「検索」ボタンをクリック
3. 「クリア」ボタンで検索条件をリセット

### インサイト作成
1. 「新規登録」ボタンをクリック
2. 必須項目を入力
3. 画像をアップロードまたはURL入力
4. 「登録」ボタンで保存

### CSV インポート
1. 「CSV ダウンロード」で既存データをエクスポート（フォーマット確認用）
2. CSVファイルを編集
3. 「CSV インポート」ボタンをクリック
4. ファイルを選択してアップロード
5. インポート結果を確認

**CSV フォーマット注意点:**
- JSON配列フィールド（対象銀行、使用データテーブル、ストーリー画像）は `["値1","値2"]` 形式
- 空の配列は `[]` または空欄
- カンマを含むテキストは引用符で囲む: `"テキスト, カンマ付き"`

### 画像プレビュー
1. インサイト一覧で「画像」ボタンをクリック
2. ティーザー画像とストーリー画像を拡大表示
3. モーダル外をクリックまたは「✕」で閉じる

### マスタデータ管理（Admin専用）
1. ヘッダーの「マスタ管理」をクリック
2. 「新規作成」で新しいマスタオプションを追加
3. 各行の「編集」「削除」で管理

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン

### インサイト
- `GET /api/insights` - 一覧取得（検索パラメータ対応）
- `GET /api/insights/:id` - 詳細取得
- `POST /api/insights` - 新規作成（Admin/Manager）
- `PUT /api/insights/:id` - 更新（Admin/Manager）
- `DELETE /api/insights/:id` - 削除（Admin/Manager）
- `POST /api/insights/upload` - 画像アップロード
- `POST /api/insights/import/csv` - CSV インポート（Admin/Manager）
- `GET /api/insights/export/csv` - CSV エクスポート（Admin/Manager）

### マスタデータ
- `GET /api/masters` - 一覧取得
- `POST /api/masters` - 新規作成（Admin専用）
- `PUT /api/masters/:id` - 更新（Admin専用）
- `DELETE /api/masters/:id` - 削除（Admin専用）

## プロジェクト構造

```
insight-manager-v2/
├── src/
│   ├── db/
│   │   ├── schema.ts      # データベーススキーマ定義
│   │   ├── index.ts       # DB接続設定
│   │   └── seed.ts        # 初期データ投入
│   ├── routes/
│   │   ├── auth.ts        # 認証API（ログイン・JWT）
│   │   ├── insights.ts    # インサイトAPI（CRUD・CSV）
│   │   └── masters.ts     # マスタデータAPI
│   └── server.ts          # ElysiaJSサーバー
├── public/
│   ├── App.tsx            # Reactメインコンポーネント
│   ├── main.tsx           # Reactエントリーポイント
│   ├── styles.css         # CSSスタイル
│   └── index.html         # HTMLテンプレート
├── uploads/               # アップロード画像保存先
├── Dockerfile             # Dockerイメージ定義
├── docker-compose.yml     # Docker Compose設定
├── drizzle.config.ts      # Drizzle ORM設定
├── package.json           # 依存関係
└── tsconfig.json          # TypeScript設定
```

## データベーススキーマ

### users テーブル
ユーザー認証情報

### master_options テーブル
ドロップダウン選択肢のマスタデータ

### insights テーブル
インサイトデータ（34フィールド）
- 基本情報（作成番号、件名、ID、ステータス）
- 日付情報（配信開始日、更新日、配信停止日）
- 分類情報（タイプ、カテゴリ）
- 表示設定（ロジック、対象ユーザー、銀行、テーブル）
- 関連情報（関連インサイト、収益カテゴリ）
- UI設定（アイコン、スコア、関連性）
- 表示制御（表示回数、選択回数、次回表示ポリシー）
- リンク（アプリ内遷移、外部遷移）
- 画像（ティーザー、ストーリー）
- メンテナンス情報

## トラブルシューティング

### Docker コンテナが起動しない
```bash
# コンテナとボリュームを完全削除して再構築
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### データベース接続エラー
```bash
# データベースコンテナのログを確認
docker-compose logs db

# データベースに接続できるか確認
docker-compose exec db psql -U postgres -d insights
```

### CSV インポートエラー
- JSON配列フィールドが正しい形式か確認: `["値1","値2"]`
- 文字コードがUTF-8か確認
- エクスポートしたCSVをテンプレートとして使用

### 画像が表示されない
- 画像ファイルがPNG/JPEG形式か確認
- ファイルサイズが大きすぎないか確認
- `uploads/` ディレクトリの権限を確認

## 開発

### データベースマイグレーション
```bash
# スキーマ変更を生成
bun run db:generate

# データベースに適用
bun run db:push
```

### 新しいマスタカテゴリの追加
1. `src/db/seed.ts` にマスタデータを追加
2. `bun run db:seed` で投入

### ビルド
```bash
# フロントエンドビルド
bun run build

# Dockerイメージビルド
docker-compose build
```

## ライセンス

MIT
