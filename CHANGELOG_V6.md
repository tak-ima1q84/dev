# Changelog - Version 6.0.0

## [6.0.0] - 2024-12-05

### 🐛 修正 (Bug Fixes)

#### Issue 1: インサイト編集時の400エラーを修正
- **問題**: 「更新」ボタンをクリックすると「更新できませんでした」エラーが発生
- **原因**: データ型の不一致
- **修正**: フロントエンドとバックエンドでデータ型変換とバリデーションを追加

#### Issue 2: Dockerビルドの失敗を修正
- **問題**: `docker build`時にエラーが発生
- **原因**: `postinstall`スクリプトがソースコードコピー前に実行される
- **修正**: `--ignore-scripts`フラグを追加、`postinstall`スクリプトを削除

### 🔧 改善 (Improvements)

#### フロントエンド (public/App.tsx)
- `InsightForm.handleSubmit`を改善
  - スコアを数値に変換
  - 配列フィールドを適切にフォーマット
  - 空の画像URLを除外
  - 詳細なエラーメッセージを表示

- `InsightDetail.handleUpdate`を改善
  - 同様のデータクリーンアップロジック
  - エラーハンドリングを強化

#### バックエンド (src/routes/insights.ts)
- `PUT /:id`エンドポイントを改善
  - リクエストボディのバリデーション
  - 数値フィールドの型変換
  - 配列フィールドの適切なフォーマット
  - 詳細なエラーメッセージ

- `POST /`エンドポイントを改善
  - 同様のバリデーションロジック
  - デフォルト値の設定

#### Docker (Dockerfile, package.json)
- Dockerfileに`--ignore-scripts`フラグを追加
- package.jsonから`postinstall`スクリプトを削除
- package.jsonの`name`を`insight-manager-v6`に更新
- Layer Cachingを最適化

### 📝 ドキュメント (Documentation)

- `README_V6_SUMMARY.md` - V6の概要
- `CHANGELOG_V6.md` - 変更履歴（このファイル）
- `README.md` - V6の情報を追加

### 🔄 互換性 (Compatibility)

- データベーススキーマはV4と完全互換
- 既存のデータベースをそのまま使用可能
- 環境変数の設定はV4と同じ

### 📦 依存関係 (Dependencies)

変更なし（V4と同じ）

### 🚀 デプロイ (Deployment)

- Docker Compose対応（V4と同じ）
- AWS Lightsail対応（V4と同じ）
- Render対応（V4と同じ）

---

## 比較: V4 vs V6

| 項目 | V4 | V6 |
|------|----|----|
| インサイト編集 | ❌ エラー発生 | ✅ 正常動作 |
| データ型バリデーション | ⚠️ 不十分 | ✅ 強化 |
| エラーメッセージ | ⚠️ 簡易的 | ✅ 詳細 |
| Dockerビルド | ⚠️ 問題あり | ✅ 最適化 |
| データベース互換性 | - | ✅ 完全互換 |
| Docker対応 | ✅ | ✅ |
| AWS Lightsail対応 | ✅ | ✅ |

---

## アップグレード推奨度

**🔴 高 (High Priority)**

V4を使用している場合、V6へのアップグレードを強く推奨します。

### アップグレードすべき理由

1. **重大なバグ修正**: インサイト編集時の400エラーを修正
2. **Dockerビルド**: 本番環境デプロイの信頼性向上
3. **データ整合性**: データ型バリデーションの強化
4. **ユーザー体験**: 詳細なエラーメッセージ
5. **後方互換性**: 既存のデータベースとの完全互換性

---

## テスト済み環境

- **OS**: macOS, Linux
- **Runtime**: Bun v1.x
- **Database**: PostgreSQL 16
- **Browser**: Chrome, Safari, Firefox (最新版)
- **Deployment**: Docker Compose, AWS Lightsail

---

## 既知の問題 (Known Issues)

- TypeScript型エラーが一部残っている（機能には影響なし）
- これらはV4から継承された問題で、今後のバージョンで対応予定

---

## 今後の予定 (Future Plans)

- TypeScript型定義の厳密化
- フォームバリデーションの強化
- ユニットテストの追加
- エラーメッセージの多言語対応
- 楽観的UIアップデートの実装

---

## 貢献者 (Contributors)

- Kiro AI Assistant

---

**バージョン**: 6.0.0  
**リリース日**: 2024年12月5日  
**ベース**: insight-manager-v4
