#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI escape codes for coloring
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

// File contents to be generated
const GENERATE_TWEET_TS_CONTENT = `import { GoogleGenerativeAI } from '@google/generative-ai';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env if available
if (!process.env.CI) {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf-8');
        envConfig.split('\\n').forEach((line) => {
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
        // Get the latest commit message
        const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();
        const commitHash = execSync('git log -1 --pretty=%h').toString().trim();
        
        console.log(\`Analyzing commit: \${commitHash}\`);

        // Generate tweet content using Gemini
        // Adjust model as needed (e.g., gemini-1.5-flash, gemini-2.0-flash-001)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

        const prompt = \`
        あなたは親しみやすい広報担当エンジニアです。
        以下のコミットメッセージに基づいて、Twitter（X）に投稿するための魅力的で柔らかいリリースツイートを作成してください。
        
        # コミットメッセージ
        \${commitMessage}
        
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
        \`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const tweetText = response.text().trim();

        console.log('\\n--- Generated Tweet ---');
        console.log(tweetText);

        // Create Twitter Intent URL
        const encodedText = encodeURIComponent(tweetText);
        const intentUrl = \`https://twitter.com/intent/tweet?text=\${encodedText}\`;

        // Output to GitHub Actions Summary
        if (process.env.GITHUB_STEP_SUMMARY) {
            const summary = \`
## 🚀 Tweet Draft Generated!

Gemini has created a tweet for the latest commit \\\`\${commitHash}\\\`.

### 📝 Generated Content
> \${tweetText}

### 👇 Click to Tweet
[**Post to Twitter (Review & Edit)**](\${intentUrl})
\`;
            fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
        } else {
            console.log(\`Tweet URL: \${intentUrl}\`);
        }

    } catch (error) {
        console.error('Failed to generate tweet:', error);
        // Do not fail the CI if tweet generation fails (e.g. API quota)
        process.exit(0);
    }
}

generateTweet();
`;

const WORKFLOW_YAML_CONTENT = `name: Generate Tweet Draft

on:
  push:
    branches: [ main, master ]

jobs:
  generate-tweet:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Tweet Draft
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
        run: npx tsx scripts/generate-tweet.ts
        continue-on-error: true
`;

async function main() {
    log(colors.cyan, '🤖 Auto-Tweet Feature Setup Wizard');
    log(colors.cyan, '===================================');

    // 1. Check for package.json
    if (!fs.existsSync('package.json')) {
        log(colors.red, '❌ Error: package.json not found. Please run this script in the root of a Node.js project.');
        process.exit(1);
    }

    // 2. Install dependencies
    log(colors.blue, '📦 Installing dependencies...');
    try {
        const pm = fs.existsSync('yarn.lock') ? 'yarn' : fs.existsSync('pnpm-lock.yaml') ? 'pnpm' : 'npm';
        const installCmd = pm === 'npm' ? 'npm install -D tsx @google/generative-ai' : `${pm} add -D tsx @google/generative-ai`;

        console.log(`Executing: ${installCmd}`);
        execSync(installCmd, { stdio: 'inherit' });
        log(colors.green, '✅ Dependencies installed.');
    } catch (error) {
        log(colors.red, '❌ Failed to install dependencies.');
        console.error(error);
        process.exit(1);
    }

    // 3. Create scripts directory
    const scriptsDir = path.join(process.cwd(), 'scripts');
    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir);
    }

    // 4. Create generate-tweet.ts
    log(colors.blue, '📄 Creating scripts/generate-tweet.ts...');
    fs.writeFileSync(path.join(scriptsDir, 'generate-tweet.ts'), GENERATE_TWEET_TS_CONTENT);
    log(colors.green, '✅ Script created.');

    // 5. Create .github/workflows directory
    const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
        fs.mkdirSync(workflowsDir, { recursive: true });
    }

    // 6. Create workflow file
    log(colors.blue, '⚙️ Creating .github/workflows/generate-tweet.yml...');
    fs.writeFileSync(path.join(workflowsDir, 'generate-tweet.yml'), WORKFLOW_YAML_CONTENT);
    log(colors.green, '✅ Workflow created.');

    // 7. Success message & Instructions
    log(colors.cyan, '\n🎉 Setup Complete! 🎉');
    log(colors.yellow, '\n👉 Next Steps:');
    log(colors.reset, '1. Go to your GitHub Repository Settings > Secrets and variables > Actions');
    log(colors.reset, '2. Add a new repository secret named "GEMINI_API_KEY" with your Gemini API Key.');
    log(colors.reset, '3. Push your changes to GitHub.');
    log(colors.reset, '4. Check the "Actions" tab to see your generated tweet draft!');
}

main().catch(console.error);
