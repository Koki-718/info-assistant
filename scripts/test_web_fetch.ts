import * as cheerio from 'cheerio';

async function testFetch(url: string) {
    console.log(`Fetching ${url}...`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        const title = $('title').text();
        console.log(`Title: ${title}`);

        // Check for RSS links
        const rssLink = $('link[type="application/rss+xml"]').attr('href') ||
            $('link[type="application/atom+xml"]').attr('href');

        if (rssLink) {
            console.log(`Found RSS: ${rssLink}`);
        } else {
            console.log('No RSS link found.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testFetch('https://vercel.com/blog'); // Example blog
testFetch('https://zenn.dev'); // Example site
