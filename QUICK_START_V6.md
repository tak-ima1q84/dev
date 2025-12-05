# クイックスタート - V6

## 🚀 5分で始める

### 1. ディレクトリに移動
```bash
cd insight-manager-v6
```

### 2. 環境変数を設定
```bash
# V4から移行する場合
cp ../insight-manager-v4/.env .env

# 新規の場合
cp .env.example .env
# .envを編集してデータベース情報を設定
```

### 3. 依存関係をインストール
```bash
bun install
```

### 4. データベースをセットアップ（新規の場合のみ）
```bash
bun run db:push
bun run db:seed
```

### 5. 起動
```bash
bun run dev
```

### 6. ブラウザで確認
http://localhost:3000 を開く

---

## 🐳 Dockerで始める

```bash
cd insight-manager-v6

# ビルドして起動
docker-compose up --build

# ブラウザで確認
open http://localhost:3000
```

---

## ✅ 動作確認

1. ログイン
2. インサイト一覧を表示
3. インサイトを選択して「編集」をクリック
4. フィールドを変更して「更新」をクリック
5. **「更新しました」メッセージが表示されることを確認** ✅

---

## 📚 詳細ドキュメント

- **README_V6_SUMMARY.md** - V6の概要
- **CHANGELOG_V6.md** - 変更履歴
- **完了報告_V6.md** - 作業完了報告

---

## 🆘 トラブルシューティング

### ポート3000が使用中
```bash
# V4を停止
cd ../insight-manager-v4
# Ctrl+C でサーバーを停止
```

### データベース接続エラー
```bash
# .envファイルを確認
cat .env

# PostgreSQLが起動しているか確認
psql -h localhost -U your_user -d your_database
```

### Dockerビルドエラー
```bash
# キャッシュをクリアして再ビルド
docker build --no-cache -t insight-manager-v6 .
```

---

**バージョン**: 6.0.0  
**リリース日**: 2024年12月5日
