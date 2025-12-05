# クラウドプラットフォームデプロイガイド

このガイドでは、insight-manager-v6を以下の3つのクラウドプラットフォームにデプロイする方法を説明します。

- AWS Lightsail
- GCP Cloud Run
- Azure App Service

---

## 📋 前提条件

すべてのプラットフォームで共通:
- PostgreSQLデータベース（各プラットフォームのマネージドサービスを推奨）
- Dockerイメージのビルド環境
- 各クラウドプラットフォームのアカウント

---

# 1️⃣ AWS Lightsail でのデプロイ

## 概要

AWS Lightsailは、シンプルで低コストなコンテナサービスです。

### 料金目安
- コンテナサービス: $10〜$40/月
- データベース: $15〜$115/月

## ステップ1: データベースの作成

### 1.1 Lightsail コンソールにアクセス
```
https://lightsail.aws.amazon.com/
```

### 1.2 データベースを作成
1. 「データベース」→「データベースの作成」をクリック
2. 設定:
   - データベースエンジン: PostgreSQL 16
   - プラン: $15/月（1GB RAM、40GB SSD）
   - データベース名: `insightdb`
   - マスターユーザー名: `dbadmin`
   - マスターパスワード: 強力なパスワードを設定
3. 「データベースの作成」をクリック

### 1.3 接続情報を取得
データベースが作成されたら、以下の情報をメモ:
- エンドポイント: `ls-xxx.xxx.us-east-1.rds.amazonaws.com`
- ポート: `5432`
- データベース名: `insightdb`
- ユーザー名: `dbadmin`
- パスワード: 設定したパスワード

## ステップ2: コンテナサービスの作成

### 2.1 コンテナサービスを作成
1. 「コンテナ」→「コンテナサービスの作成」をクリック
2. 設定:
   - サービス名: `insight-manager-v6`
   - パワー: Micro（$10/月）または Small（$20/月）
   - スケール: 1（開発環境）または 3（本番環境）
3. 「コンテナサービスの作成」をクリック

### 2.2 カスタムドメインの設定（オプション）
1. コンテナサービスの詳細ページで「カスタムドメイン」タブをクリック
2. 独自ドメインを設定

## ステップ3: Dockerイメージのビルドとプッシュ

### 3.1 Lightsail コンテナレジストリにログイン
```bash
aws lightsail push-container-image \
  --region us-east-1 \
  --service-name insight-manager-v6 \
  --label insight-manager-v6 \
  --image insight-manager-v6:latest
```

### 3.2 Dockerイメージをビルド
```bash
cd insight-manager-v6
docker build -t insight-manager-v6:latest .
```

### 3.3 イメージをプッシュ
```bash
aws lightsail push-container-image \
  --region us-east-1 \
  --service-name insight-manager-v6 \
  --label insight-manager-v6 \
  --image insight-manager-v6:latest
```

## ステップ4: デプロイ設定

### 4.1 デプロイ設定ファイルを作成

`lightsail-deployment.json`:
```json
{
  "serviceName": "insight-manager-v6",
  "containers": {
    "app": {
      "image": ":insight-manager-v6.latest",
      "ports": {
        "3000": "HTTP"
      },
      "environment": {
        "NODE_ENV": "production",
        "DATABASE_URL": "postgresql://dbadmin:PASSWORD@ls-xxx.xxx.us-east-1.rds.amazonaws.com:5432/insightdb",
        "JWT_SECRET": "your-secure-jwt-secret-here"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "app",
    "containerPort": 3000,
    "healthCheck": {
      "path": "/",
      "intervalSeconds": 30
    }
  }
}
```

### 4.2 デプロイを実行
```bash
aws lightsail create-container-service-deployment \
  --region us-east-1 \
  --cli-input-json file://lightsail-deployment.json
```

## ステップ5: データベースの初期化

### 5.1 コンテナに接続
```bash
aws lightsail get-container-log \
  --region us-east-1 \
  --service-name insight-manager-v6 \
  --container-name app
```

### 5.2 マイグレーションを実行
Lightsailコンソールから「コンテナのシェル」を開き:
```bash
bun run db:push
bun run db:seed
```

## ステップ6: 動作確認

1. Lightsailコンソールでパブリックドメインを確認
2. ブラウザでアクセス: `https://insight-manager-v6.xxx.us-east-1.cs.amazonlightsail.com`
3. ログイン画面が表示されることを確認

---

# 2️⃣ GCP Cloud Run でのデプロイ

## 概要

Google Cloud Runは、サーバーレスコンテナプラットフォームです。

### 料金目安
- Cloud Run: 従量課金（月$5〜$50程度）
- Cloud SQL: $10〜$200/月

## ステップ1: GCPプロジェクトのセットアップ

### 1.1 プロジェクトを作成
```bash
gcloud projects create insight-manager-v6 --name="Insight Manager V6"
gcloud config set project insight-manager-v6
```

### 1.2 必要なAPIを有効化
```bash
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  cloudbuild.googleapis.com
```

## ステップ2: Cloud SQLデータベースの作成

### 2.1 Cloud SQLインスタンスを作成
```bash
gcloud sql instances create insight-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=asia-northeast1 \
  --root-password=YOUR_STRONG_PASSWORD
```

### 2.2 データベースを作成
```bash
gcloud sql databases create insightdb \
  --instance=insight-db
```

### 2.3 ユーザーを作成
```bash
gcloud sql users create dbadmin \
  --instance=insight-db \
  --password=YOUR_USER_PASSWORD
```

### 2.4 接続情報を取得
```bash
gcloud sql instances describe insight-db
```

接続名をメモ: `PROJECT_ID:REGION:insight-db`

## ステップ3: Dockerイメージのビルドとプッシュ

### 3.1 Container Registryを有効化
```bash
gcloud services enable containerregistry.googleapis.com
```

### 3.2 Dockerイメージをビルド
```bash
cd insight-manager-v6
gcloud builds submit --tag gcr.io/insight-manager-v6/insight-manager:v6.0.0
```

または、ローカルでビルドしてプッシュ:
```bash
docker build -t gcr.io/insight-manager-v6/insight-manager:v6.0.0 .
docker push gcr.io/insight-manager-v6/insight-manager:v6.0.0
```

## ステップ4: Cloud Runサービスのデプロイ

### 4.1 環境変数を設定
```bash
export DATABASE_URL="postgresql://dbadmin:PASSWORD@/insightdb?host=/cloudsql/PROJECT_ID:REGION:insight-db"
export JWT_SECRET="your-secure-jwt-secret-here"
```

### 4.2 Cloud Runにデプロイ
```bash
gcloud run deploy insight-manager-v6 \
  --image gcr.io/insight-manager-v6/insight-manager:v6.0.0 \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:insight-db \
  --set-env-vars DATABASE_URL="$DATABASE_URL" \
  --set-env-vars JWT_SECRET="$JWT_SECRET" \
  --set-env-vars NODE_ENV="production" \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## ステップ5: データベースの初期化

### 5.1 Cloud Runジョブを作成してマイグレーション実行
```bash
gcloud run jobs create db-migrate \
  --image gcr.io/insight-manager-v6/insight-manager:v6.0.0 \
  --region asia-northeast1 \
  --add-cloudsql-instances PROJECT_ID:REGION:insight-db \
  --set-env-vars DATABASE_URL="$DATABASE_URL" \
  --command bun \
  --args "run,db:push"

gcloud run jobs execute db-migrate --region asia-northeast1
```

### 5.2 シードデータを投入
```bash
gcloud run jobs create db-seed \
  --image gcr.io/insight-manager-v6/insight-manager:v6.0.0 \
  --region asia-northeast1 \
  --add-cloudsql-instances PROJECT_ID:REGION:insight-db \
  --set-env-vars DATABASE_URL="$DATABASE_URL" \
  --command bun \
  --args "run,db:seed"

gcloud run jobs execute db-seed --region asia-northeast1
```

## ステップ6: カスタムドメインの設定（オプション）

```bash
gcloud run domain-mappings create \
  --service insight-manager-v6 \
  --domain your-domain.com \
  --region asia-northeast1
```

## ステップ7: 動作確認

1. サービスURLを取得:
```bash
gcloud run services describe insight-manager-v6 \
  --region asia-northeast1 \
  --format 'value(status.url)'
```

2. ブラウザでアクセス
3. ログイン画面が表示されることを確認

---

# 3️⃣ Azure App Service でのデプロイ

## 概要

Azure App Serviceは、Webアプリケーションのホスティングサービスです。

### 料金目安
- App Service: $13〜$200/月
- Azure Database for PostgreSQL: $20〜$500/月

## ステップ1: Azureリソースグループの作成

### 1.1 Azureにログイン
```bash
az login
```

### 1.2 リソースグループを作成
```bash
az group create \
  --name insight-manager-rg \
  --location japaneast
```

## ステップ2: Azure Database for PostgreSQLの作成

### 2.1 PostgreSQLサーバーを作成
```bash
az postgres flexible-server create \
  --resource-group insight-manager-rg \
  --name insight-db-server \
  --location japaneast \
  --admin-user dbadmin \
  --admin-password YOUR_STRONG_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --public-access 0.0.0.0
```

### 2.2 データベースを作成
```bash
az postgres flexible-server db create \
  --resource-group insight-manager-rg \
  --server-name insight-db-server \
  --database-name insightdb
```

### 2.3 ファイアウォールルールを設定
```bash
# Azureサービスからのアクセスを許可
az postgres flexible-server firewall-rule create \
  --resource-group insight-manager-rg \
  --name insight-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 2.4 接続文字列を取得
```bash
az postgres flexible-server show-connection-string \
  --server-name insight-db-server \
  --database-name insightdb \
  --admin-user dbadmin \
  --admin-password YOUR_STRONG_PASSWORD
```

## ステップ3: Azure Container Registryの作成

### 3.1 ACRを作成
```bash
az acr create \
  --resource-group insight-manager-rg \
  --name insightmanageracr \
  --sku Basic \
  --admin-enabled true
```

### 3.2 ACRにログイン
```bash
az acr login --name insightmanageracr
```

## ステップ4: Dockerイメージのビルドとプッシュ

### 4.1 イメージをビルド
```bash
cd insight-manager-v6
docker build -t insightmanageracr.azurecr.io/insight-manager:v6.0.0 .
```

### 4.2 イメージをプッシュ
```bash
docker push insightmanageracr.azurecr.io/insight-manager:v6.0.0
```

## ステップ5: App Service Planの作成

```bash
az appservice plan create \
  --name insight-manager-plan \
  --resource-group insight-manager-rg \
  --location japaneast \
  --is-linux \
  --sku B1
```

## ステップ6: Web Appの作成とデプロイ

### 6.1 Web Appを作成
```bash
az webapp create \
  --resource-group insight-manager-rg \
  --plan insight-manager-plan \
  --name insight-manager-v6 \
  --deployment-container-image-name insightmanageracr.azurecr.io/insight-manager:v6.0.0
```

### 6.2 ACRの認証情報を設定
```bash
# ACRの認証情報を取得
ACR_USERNAME=$(az acr credential show --name insightmanageracr --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name insightmanageracr --query passwords[0].value -o tsv)

# Web Appに設定
az webapp config container set \
  --name insight-manager-v6 \
  --resource-group insight-manager-rg \
  --docker-custom-image-name insightmanageracr.azurecr.io/insight-manager:v6.0.0 \
  --docker-registry-server-url https://insightmanageracr.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD
```

### 6.3 環境変数を設定
```bash
az webapp config appsettings set \
  --resource-group insight-manager-rg \
  --name insight-manager-v6 \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="postgresql://dbadmin:PASSWORD@insight-db-server.postgres.database.azure.com:5432/insightdb?sslmode=require" \
    JWT_SECRET="your-secure-jwt-secret-here" \
    WEBSITES_PORT=3000
```

### 6.4 継続的デプロイを有効化
```bash
az webapp deployment container config \
  --name insight-manager-v6 \
  --resource-group insight-manager-rg \
  --enable-cd true
```

## ステップ7: データベースの初期化

### 7.1 SSHでWeb Appに接続
Azureポータルから:
1. App Service → insight-manager-v6 → SSH
2. または、Azure CLIから:
```bash
az webapp ssh --name insight-manager-v6 --resource-group insight-manager-rg
```

### 7.2 マイグレーションを実行
```bash
cd /home/site/wwwroot
bun run db:push
bun run db:seed
```

## ステップ8: カスタムドメインの設定（オプション）

```bash
az webapp config hostname add \
  --webapp-name insight-manager-v6 \
  --resource-group insight-manager-rg \
  --hostname your-domain.com
```

## ステップ9: 動作確認

1. Web AppのURLを取得:
```bash
az webapp show \
  --name insight-manager-v6 \
  --resource-group insight-manager-rg \
  --query defaultHostName -o tsv
```

2. ブラウザでアクセス: `https://insight-manager-v6.azurewebsites.net`
3. ログイン画面が表示されることを確認

---

# 📊 プラットフォーム比較

| 項目 | AWS Lightsail | GCP Cloud Run | Azure App Service |
|------|--------------|---------------|-------------------|
| **料金** | $25〜$155/月 | $15〜$250/月 | $33〜$700/月 |
| **スケーリング** | 手動 | 自動（0〜N） | 手動/自動 |
| **起動時間** | 常時起動 | コールドスタート有 | 常時起動 |
| **管理の容易さ** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **柔軟性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **日本リージョン** | ❌ | ✅ | ✅ |

## 推奨用途

### AWS Lightsail
- シンプルで予測可能な料金が必要
- 小〜中規模のアプリケーション
- AWSエコシステムを使用

### GCP Cloud Run
- トラフィックが変動する
- サーバーレスアーキテクチャが好み
- コスト最適化が重要

### Azure App Service
- Azureエコシステムを使用
- エンタープライズ機能が必要
- 継続的デプロイが重要

---

# 🔧 トラブルシューティング

## 共通の問題

### データベース接続エラー
```
Error: connect ECONNREFUSED
```

**解決方法**:
1. DATABASE_URLが正しいか確認
2. ファイアウォールルールを確認
3. データベースが起動しているか確認

### ポート設定エラー
```
Error: listen EADDRINUSE: address already in use
```

**解決方法**:
- 環境変数でポート3000を指定
- プラットフォーム固有のポート設定を確認

### メモリ不足
```
JavaScript heap out of memory
```

**解決方法**:
- インスタンスサイズを増やす
- メモリ制限を調整

---

# 📚 参考リンク

## AWS Lightsail
- [公式ドキュメント](https://docs.aws.amazon.com/lightsail/)
- [料金](https://aws.amazon.com/lightsail/pricing/)

## GCP Cloud Run
- [公式ドキュメント](https://cloud.google.com/run/docs)
- [料金](https://cloud.google.com/run/pricing)

## Azure App Service
- [公式ドキュメント](https://docs.microsoft.com/azure/app-service/)
- [料金](https://azure.microsoft.com/pricing/details/app-service/)

---

**作成日**: 2024年12月5日  
**バージョン**: 6.0.0
