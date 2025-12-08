# 開発ガイド

## 開発環境のセットアップ

### 必要なツール
- Bun v1.x以上
- PostgreSQL 16
- Docker & Docker Compose（オプション）
- Git

### 初回セットアップ

1. リポジトリのクローン
```bash
git clone <repository-url>
cd insight-manager-v2
```

2. 依存関係のインストール
```bash
bun install
```

3. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集してDB接続情報を設定
```

4. データベースのセットアップ
```bash
# スキーマの生成
bun run db:generate

# データベースに適用
bun run db:push

# 初期データの投入
bun run db:seed
```

## 開発サーバーの起動

### バックエンド
```bash
bun run dev
```
→ http://localhost:3000 で起動

### フロントエンド（開発モード）
別のターミナルで:
```bash
bun run vite
```
→ http://localhost:5173 で起動（ホットリロード有効）

## データベース操作

### スキーマの変更
1. `src/db/schema.ts` を編集
2. マイグレーションを生成:
```bash
bun run db:generate
```
3. データベースに適用:
```bash
bun run db:push
```

### データのリセット
```bash
# データベースを削除して再作成
docker-compose down -v
docker-compose up -d
docker-compose exec app bun run db:push
docker-compose exec app bun run db:seed
```

## API開発

### 新しいエンドポイントの追加

1. `src/routes/` に新しいルートファイルを作成
2. `src/server.ts` でルートをインポート・登録

例:
```typescript
// src/routes/example.ts
import { Elysia } from 'elysia';

export const exampleRoutes = new Elysia({ prefix: '/api/example' })
  .get('/', () => ({ message: 'Hello' }));

// src/server.ts
import { exampleRoutes } from './routes/example';
// ...
.use(exampleRoutes)
```

### 認証が必要なエンドポイント

```typescript
.get('/protected', async ({ jwt, headers, set }) => {
  const token = headers.authorization?.replace('Bearer ', '');
  if (!token) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }
  
  const payload = await jwt.verify(token);
  if (!payload) {
    set.status = 401;
    return { error: 'Invalid token' };
  }
  
  // payload.role でロールチェック可能
  return { data: 'Protected data' };
})
```

## フロントエンド開発

### コンポーネントの追加

`public/App.tsx` に新しいコンポーネントを追加:

```typescript
const NewComponent: React.FC = () => {
  return <div>New Component</div>;
};
```

### APIの呼び出し

```typescript
const fetchData = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data;
};
```

## テスト

### ユニットテスト（Bun test）
```bash
bun test
```

### E2Eテスト
（未実装 - 今後追加予定）

## ビルドとデプロイ

### プロダクションビルド
```bash
bun run build
```

### Dockerイメージのビルド
```bash
docker build -t insight-manager-v2 .
```

### Docker Composeでデプロイ
```bash
docker-compose up -d
```

## トラブルシューティング

### ポートが使用中
```bash
# プロセスを確認
lsof -i :3000

# プロセスを停止
kill -9 <PID>
```

### データベース接続エラー
- PostgreSQLが起動しているか確認
- `.env`の接続情報が正しいか確認
- ファイアウォール設定を確認

### マイグレーションエラー
```bash
# スキーマを再生成
rm -rf drizzle
bun run db:generate
bun run db:push
```

### 依存関係のエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules bun.lock
bun install
```

## コーディング規約

### TypeScript
- 型定義を明示的に記述
- `any`の使用を避ける
- インターフェースを活用

### React
- 関数コンポーネントを使用
- Hooksを活用
- propsの型定義を明示

### データベース
- マイグレーションファイルを必ずコミット
- シードデータは冪等性を保つ

## Git ワークフロー

```bash
# 新機能の開発
git checkout -b feature/new-feature
# 開発...
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# プルリクエストを作成
```

## 便利なコマンド

```bash
# データベースのリセット
bun run db:push --force

# 開発サーバーの再起動
# Ctrl+C で停止後
bun run dev

# ログの確認（Docker）
docker-compose logs -f app

# データベースに直接接続
docker-compose exec db psql -U postgres -d insight_manager
```

## 参考リンク

- [Bun Documentation](https://bun.sh/docs)
- [ElysiaJS Documentation](https://elysiajs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
