# 定期情報収集（Cron）設定

## 概要

GitHub Actionsを使用して、無料で定期的な情報収集を実行します。

## スケジュール

| 時刻 (JST) | Cron (UTC) | 説明 |
|-----------|------------|------|
| 朝 7:00 | `0 22 * * *` | 朝の情報収集 |
| 昼 12:00 | `0 3 * * *` | 昼の情報収集 |
| 夜 19:00 | `0 10 * * *` | 夜の情報収集 |

## セットアップ

### 1. GitHub Secretsを設定

リポジトリの **Settings** → **Secrets and variables** → **Actions** で以下を追加：

| Secret名 | 値 |
|---------|---|
| `APP_URL` | デプロイ先URL（例: `https://your-app.vercel.app`） |
| `CRON_SECRET` | 任意の秘密鍵（例: `your-secret-key-here`） |

### 2. 環境変数を設定

Vercelの環境変数にも `CRON_SECRET` を同じ値で設定してください。

## 手動実行

GitHub → **Actions** → **定期情報収集** → **Run workflow** で即座に実行できます。

## ファイル構成

```
.github/workflows/scheduled-update.yml  # ワークフロー定義
```
