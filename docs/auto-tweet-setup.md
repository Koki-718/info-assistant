# 🤖 自動ツイート生成機能 導入ガイド

GitHubリポジトリにプッシュした際、コミット内容からAI (Gemini) が自動で魅力的なツイート文案を生成し、「ツイートする」ボタンを表示する機能です。
**Twitter API Keyは不要**で、投稿前に内容を確認・編集できるため安全です。

## 🚀 クイックスタート (CLIで自動セットアップ)

以下のコマンドを実行するだけで、必要なファイルの生成とパッケージのインストールがすべて自動で行われます。Node.jsプロジェクトのルートディレクトリで実行してください。

```bash
curl -s https://raw.githubusercontent.com/KokiFujimoto/info-assistant/master/scripts/setup-cli.js | node
```

これだけでセットアップは完了です！
あとは [GitHub Secretsの設定](#step-4-github-secretsの設定) に進んでAPIキーを登録してください。

---

## 🛠️ 手動セットアップ手順

CLIを使わず、ひとつずつ設定したい場合は以下の手順に従ってください。

### Step 1: パッケージのインストール


必要なパッケージをインストールします。

```bash
npm install -D tsx @google/generative-ai
# または
yarn add -D tsx @google/generative-ai
# または
pnpm add -D tsx @google/generative-ai
```

### Step 2: スクリプトの作成

プロジェクトのルート等に `scripts/generate-tweet.ts` を作成し、以下のコードをコピペしてください。
Geminiのモデル名やプロンプト（口調）は自由に変更可能です。

```typescript
// scripts/generate-tweet.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ローカル実行時に.envを読み込む（任意）
if (!process.env.CI) {
    const envPath = path.resolve(process.cwd(), '.env'); // 環境に合わせて修正
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\n').forEach((line) => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function generateTweet() {
    try {
        // 直近のコミットメッセージを取得
        const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
        const commitHash = execSync('git log -1 --pretty=%h').toString().trim();
        
        console.log(`Analyzing commit: ${commitHash}`);

        // Geminiでツイート生成
        // モデルは最新のものや契約に合わせて変更してください (例: gemini-1.5-flash, gemini-2.0-flash-001)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

        const prompt = `
        あなたは親しみやすい広報担当エンジニアです。
        以下のコミットメッセージに基づいて、Twitter（X）に投稿するための魅力的で柔らかいリリースツイートを作成してください。
        
        # コミットメッセージ
        ${commitMessage}
        
        # 制約事項
        - 日本語で記述してください
        - 140文字以内に収めてください
        - **丁寧語（です・ます調）は必須**です。「〜だよ」「〜したよ」は禁止です。
        - ただし、堅苦しくなりすぎず、「〜しました！」「〜を追加しました✨」のような柔らかいニュアンスで。
        - 開発の進捗や改善点をポジティブに伝えてください。
        - 適切な絵文字（🚀, ✨, 🎉, 💡など）を自然に使用してください（1〜2個）。
        - ハッシュタグ #個人開発 #エンジニア を末尾に追加してください。
        - URLやリポジトリへのリンクは含めないでください。
        - 出力はツイート本文のみにしてください。
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const tweetText = response.text().trim();

        console.log('\n--- Generated Tweet ---');
        console.log(tweetText);

        // Twitter Intent URLを作成
        const encodedText = encodeURIComponent(tweetText);
        const intentUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

        // GitHub Actions Summaryに出力
        if (process.env.GITHUB_STEP_SUMMARY) {
            const summary = `
## 🚀 Tweet Draft Generated!

Gemini has created a tweet for the latest commit \`${commitHash}\`.

### 📝 Generated Content
> ${tweetText}

### 👇 Click to Tweet
[**Post to Twitter (Review & Edit)**](${intentUrl})
`;
            fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
        } else {
            console.log(`Tweet URL: ${intentUrl}`);
        }

    } catch (error) {
        console.error('Failed to generate tweet:', error);
        // エラーでもActionsを止めない場合はここでexitしない、またはActions側でcontinue-on-errorを設定
        process.exit(1);
    }
}

generateTweet();
```

### Step 3: ワークフローの作成

`.github/workflows/generate-tweet.yml` を作成し、以下をコピペしてください。

```yaml
name: Generate Tweet Draft

on:
  push:
    branches: [ main, master ] # 対象ブランチ

jobs:
  generate-tweet:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # git logに履歴が必要

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm' # yarnの場合は 'yarn', pnpmの場合は 'pnpm'

      - name: Install dependencies
        run: npm ci # yarn install --frozen-lockfile, pnpm install --frozen-lockfile

      - name: Generate Tweet Draft
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npx tsx scripts/generate-tweet.ts
        continue-on-error: true # API制限などでコケてもCI全体を失敗させない
```

### Step 4: GitHub Secretsの設定

1. GitHubリポジトリの **Settings > Secrets and variables > Actions** に移動します。
2. **New repository secret** をクリックします。
3. 以下の名前でAPIキーを登録します：
    - Name: `GEMINI_API_KEY`
    - Value: `(取得したGemini APIキー)`

---

## 🚀 使い方

設定後は、通常通りコードを書いて **pushするだけ** です。

1. GitHubリポジトリの **[Actions]** タブを開く
2. 実行されたワークフローをクリック
3. **Summary** をクリックすると、ツイート文案とリンクが表示されます！

---

## 💡 Tips: API制限について

Gemini API（特に無料枠）は短期間に多数のリクエストを送ると `429 Too Many Requests` エラーになることがあります。
本格的に利用する場合は、Google AI Studioでクレジットカードを登録し、**Pay-as-you-go（従量課金）** に設定することをお勧めします（無料枠分は無料のままです）。
