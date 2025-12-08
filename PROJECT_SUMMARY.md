# DataCatalog-v01 プロジェクトサマリー

## 概要
データベーステーブル定義を管理するためのWebアプリケーション。EARS表記法に基づく要件定義から実装まで完了。

## 実装済み機能

### ✅ データ管理
- **テーブル定義管理**: システム名、スキーマ名、物理名、論理名、概要など
- **カラム定義管理**: 最大500カラム/テーブル、PK/FK/NULL制約対応
- **バリデーション**: カラム数制限（500列）の実装

### ✅ 検索機能
- テーブル物理名、論理名、概要での部分一致検索
- カラム物理名、論理名での部分一致検索
- リアルタイム検索（300ms debounce）

### ✅ 表示機能
- テーブル一覧表示（検索結果含む）
- テーブル詳細表示（テーブル情報 + カラム一覧）
- カラム定義の表形式表示

### ✅ エクスポート機能
- テーブル定義のCSVダウンロード
- テーブル情報とカラム定義を含む
- 日本語ヘッダー対応

### ✅ ユーザー管理
- ロールベース（editor/viewer）のデータモデル
- デフォルトユーザー自動作成（admin/editor）
- CRUD API完備

### ✅ デプロイメント
- Docker対応（Dockerfile + docker-compose.yml）
- AWS Lightsail対応
- 環境変数によるポート設定

## 技術スタック

| 項目 | 技術 |
|------|------|
| Runtime | Bun 1.3+ |
| Backend Framework | Hono |
| Database | SQLite (Bun built-in) |
| Frontend | Vanilla JavaScript + HTML/CSS |
| Deployment | Docker, AWS Lightsail |
| Language | TypeScript |

## ファイル構成

```
DataCatalog-v01/
├── server.ts              # メインサーバー
├── db.ts                  # データベース初期化
├── routes/
│   ├── tables.ts         # テーブルCRUD API
│   ├── columns.ts        # カラムCRUD API（500列制限）
│   ├── users.ts          # ユーザー管理API
│   ├── search.ts         # 検索API
│   └── backup.ts         # CSV エクスポートAPI
├── public/
│   ├── index.html        # メインUI
│   ├── app.js            # フロントエンドロジック
│   └── style.css         # スタイルシート
├── Dockerfile            # Docker イメージ定義
├── docker-compose.yml    # Docker Compose 設定
├── backups/              # バックアップ保存先
├── catalog.db            # SQLiteデータベース
└── package.json
```

## データベーススキーマ

### data_tables
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | 主キー |
| system_name | TEXT | システム名（必須） |
| subsystem_name | TEXT | サブシステム名 |
| schema_name | TEXT | スキーマ名 |
| creator | TEXT | 作成者（必須） |
| updater | TEXT | 更新者（必須） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |
| table_physical_name | TEXT | テーブル物理名（必須） |
| table_logical_name | TEXT | テーブル論理名（必須） |
| table_description | TEXT | テーブル概要 |
| file_format | TEXT | ファイル形式 |
| quote_char | TEXT | 引用符 |
| delimiter_char | TEXT | 区切り文字 |
| encoding | TEXT | 文字コード |
| line_break_code | TEXT | 改行コード |

### data_columns
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | 主キー |
| table_id | INTEGER | テーブルID（外部キー） |
| column_physical_name | TEXT | カラム物理名（必須） |
| column_logical_name | TEXT | カラム論理名（必須） |
| data_type | TEXT | データ型（必須） |
| data_length | TEXT | データ長 |
| is_pk | INTEGER | 主キーフラグ |
| is_fk | INTEGER | 外部キーフラグ |
| is_nullable | INTEGER | NULL許可フラグ |
| default_value | TEXT | デフォルト値 |
| remarks | TEXT | 備考 |
| index_name | TEXT | インデックス名 |
| index_target_column | TEXT | インデックス対象カラム |

### users
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | 主キー |
| username | TEXT | ユーザー名（ユニーク） |
| name | TEXT | 表示名 |
| role | TEXT | ロール（editor/viewer） |

## API エンドポイント

### テーブル管理
- `GET /api/tables` - テーブル一覧取得
- `GET /api/tables/:id` - テーブル詳細取得（カラム含む）
- `POST /api/tables` - テーブル作成
- `PUT /api/tables/:id` - テーブル更新
- `DELETE /api/tables/:id` - テーブル削除

### カラム管理
- `GET /api/columns/table/:tableId` - テーブルのカラム一覧
- `POST /api/columns` - カラム作成（500列制限チェック）
- `PUT /api/columns/:id` - カラム更新
- `DELETE /api/columns/:id` - カラム削除

### 検索・エクスポート
- `GET /api/search?q=query` - 部分一致検索
- `GET /api/backup/csv/:id` - CSV ダウンロード
- `POST /api/backup` - 手動バックアップ（JSON形式）

### ユーザー管理
- `GET /api/users` - ユーザー一覧
- `POST /api/users` - ユーザー作成
- `PUT /api/users/:id` - ユーザー更新
- `DELETE /api/users/:id` - ユーザー削除

## 起動方法

### ローカル開発
```bash
bun install
bun run dev
# http://localhost:3000
```

### Docker
```bash
docker-compose up -d
# http://localhost:3000
```

## テスト済み機能

✅ データベース初期化（スキーマ作成、デフォルトユーザー作成）
✅ テーブル作成API（日本語対応）
✅ カラム作成API（PK/FK/NULL制約）
✅ テーブル一覧取得
✅ テーブル詳細取得（カラム含む）
✅ 検索機能（日本語部分一致）
✅ CSV エクスポート
✅ 500カラム制限バリデーション

## 要件との対応

| 要件 | 実装状況 | 備考 |
|------|---------|------|
| テーブル定義管理 | ✅ 完了 | CRUD完備 |
| カラム定義（最大500列） | ✅ 完了 | バリデーション実装済み |
| 権限管理（編集者/閲覧者） | ✅ データモデル完了 | UI実装は今後 |
| 部分一致検索 | ✅ 完了 | テーブル名、カラム名、概要対応 |
| テーブル詳細表示 | ✅ 完了 | テーブル情報+カラム一覧 |
| CSVダウンロード | ✅ 完了 | テーブル+カラム定義 |
| Docker対応 | ✅ 完了 | Dockerfile + docker-compose |
| AWS Lightsail対応 | ✅ 完了 | デプロイ可能 |

## 今後の拡張可能性

- [ ] ロールベースのアクセス制御UI実装
- [ ] テーブル編集機能の実装
- [ ] カラム一括インポート（CSV/Excel）
- [ ] テーブル間のリレーション可視化
- [ ] 変更履歴の追跡
- [ ] エクスポート形式の追加（Excel, JSON等）
- [ ] 認証機能の実装
- [ ] API認証（JWT等）

## デフォルト設定

- **ポート**: 3000（環境変数 PORT で変更可能）
- **データベース**: catalog.db（SQLite）
- **デフォルトユーザー**: admin（editor権限）
- **カラム制限**: 500列/テーブル
