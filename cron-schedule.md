# Vercel Cron設定

## スケジュール

このプロジェクトはVercel Cronを使用して定期的に情報を収集します。

### 実行タイミング

- **朝 7:00 (JST)** - `0 22 * * *` (UTC)
- **昼 12:00 (JST)** - `0 3 * * *` (UTC)
- **夜 19:00 (JST)** - `0 10 * * *` (UTC)

※ JSTはUTC+9時間です

### エンドポイント

`/api/cron/update` - 全トピックの情報源から記事を収集

## 設定方法

1. このプロジェクトをVercelにデプロイ
2. `vercel.json`が自動的に読み込まれます
3. Vercelダッシュボードの「Cron Jobs」で実行状況を確認できます

## ローカルテスト

```bash
curl http://localhost:3000/api/cron/update?secret=YOUR_SECRET
```

## 注意事項

- Vercel Proプラン以上が必要です（無料プランではCronは使用できません）
- Cron実行は最大10秒のタイムアウトがあります
- ログはVercelダッシュボードで確認できます
