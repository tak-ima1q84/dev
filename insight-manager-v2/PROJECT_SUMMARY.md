# プロジェクトサマリー

## 概要

インサイト管理ツール v2 は、モバイルアプリに表示される「インサイト（通知・マーケティングカード）」を管理するための Web アプリケーションです。

## 実装済み機能

### ✅ Phase 1: 環境セットアップ（完了）
- Bun ランタイム環境
- ElysiaJS バックエンドフレームワーク
- React + Vite フロントエンド
- PostgreSQL データベース
- Drizzle ORM
- Docker & Docker Compose 対応

### ✅ Phase 2: データベースとバックエンド（完了）
- **データベーススキーマ**:
  - `users` テーブル（認証・権限管理）
  - `master_options` テーブル（ドロップダウン選択肢）
  - `insights` テーブル（インサイトデータ全項目）

- **API エンドポイント**:
  - 認証: ログイン（JWT）
  - インサイト: CRUD操作、検索、CSV エクスポート
  - マスタデータ: CRUD操作（Admin専用）

- **初期データ**:
  - 全マスタデータ（ステータス、タイプ、カテゴリなど）
  - デフォルト管理者アカウント（admin/admin123）

### ✅ Phase 3: フロントエンド基本実装（完了）
- ログイン画面
- インサイト一覧画面（検索機能付き）
- インサイト詳細画面（基本表示）
- マスタ管理画面（Admin専用）
- 権限ベースのUI制御
- レスポンシブデザイン

## 未実装機能（今後の拡張）

### Phase 4: 高度な機能
- [ ] 画像アップロード・管理機能
- [ ] 画像プレビューモーダル
- [ ] CSV インポート機能
- [ ] 完全なインサイト入力フォーム
  - ドロップダウン（マスタ連動）
  - チェックボックスグループ（複数選択）
  - 日付ピッカー
  - 画像アップロードUI
- [ ] 高度な検索フィルター
- [ ] ユーザー管理画面

### Phase 5: テスト・品質保証
- [ ] ユニットテスト
- [ ] E2Eテスト
- [ ] パフォーマンス最適化

## 技術的特徴

### パフォーマンス
- **Bun**: 高速なJavaScriptランタイム
- **ElysiaJS**: 軽量で高速なWebフレームワーク
- **Drizzle ORM**: 型安全で高速なORM

### セキュリティ
- JWT認証
- パスワードハッシュ化（Bun.password）
- ロールベースアクセス制御（RBAC）

### 開発体験
- TypeScript完全対応
- ホットリロード対応
- Docker対応で環境構築が簡単

## ファイル構成

```
insight-manager-v2/
├── src/
│   ├── db/
│   │   ├── schema.ts          # データベーススキーマ定義
│   │   ├── index.ts           # DB接続設定
│   │   └── seed.ts            # 初期データ投入スクリプト
│   ├── routes/
│   │   ├── auth.ts            # 認証API
│   │   ├── insights.ts        # インサイトAPI
│   │   └── masters.ts         # マスタデータAPI
│   └── server.ts              # サーバーエントリーポイント
├── public/
│   ├── App.tsx                # Reactメインコンポーネント
│   ├── main.tsx               # Reactエントリーポイント
│   ├── styles.css             # グローバルスタイル
│   └── index.html             # HTMLテンプレート
├── uploads/                   # 画像アップロード先
├── Dockerfile                 # Dockerイメージ定義
├── docker-compose.yml         # Docker Compose設定
├── drizzle.config.ts          # Drizzle ORM設定
├── vite.config.ts             # Vite設定
├── package.json               # 依存関係とスクリプト
├── .env                       # 環境変数
├── requirements.md            # 要件定義書
├── design.md                  # 設計書
├── tasks.md                   # タスクリスト
├── README.md                  # プロジェクト説明
└── QUICKSTART.md              # クイックスタートガイド
```

## データモデル

### Users（ユーザー）
- 認証情報とロール（Admin/Manager/Viewer）

### Master Options（マスタデータ）
- カテゴリ別の選択肢（ステータス、タイプ、カテゴリなど）
- 全9カテゴリ、計90+オプション

### Insights（インサイト）
- 34フィールド（a1-f2）
- JSON型フィールド（配列データ）
- 日付・数値・テキストの混在

## 起動方法

### Docker（推奨）
```bash
docker-compose up -d
docker-compose exec app bun run db:push
docker-compose exec app bun run db:seed
```

### ローカル開発
```bash
bun install
bun run db:push
bun run db:seed
bun run dev
```

## デフォルトログイン情報
- ユーザー名: `admin`
- パスワード: `admin123`
- 権限: Admin

## 今後の開発方針

1. **画像管理機能の実装**: ファイルアップロード、プレビュー、削除
2. **フォーム機能の充実**: 全フィールドの入力対応、バリデーション
3. **CSV インポート**: バルク登録機能
4. **テストの追加**: 品質保証
5. **UI/UX改善**: より使いやすいインターフェース

## ライセンス
MIT
