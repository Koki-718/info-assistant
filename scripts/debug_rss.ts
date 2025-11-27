import Parser from 'rss-parser';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});

async function debugRSS() {
    const url = 'https://wired.jp/feed/';
    console.log(`Fetching ${url} with User-Agent...`);
    try {
        const feed = await parser.parseURL(url);
        console.log(`Title: ${feed.title}`);
        console.log(`Items: ${feed.items.length}`);
        if (feed.items.length > 0) {
            console.log('First item:', feed.items[0].title);
        }
    } catch (error) {
        console.error('Error fetching RSS:', error);
    }
}

debugRSS();
