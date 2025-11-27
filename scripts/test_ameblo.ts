import * as cheerio from 'cheerio';

async function testAmeblo(url: string) {
    console.log(`Testing Ameba Blog: ${url}`);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = await res.text();

        // Same regex as in the API route
        const rssMatch = html.match(/<link[^>]+type=["']application\/(rss\+xml|atom\+xml)["'][^>]+href=["']([^"']+)["']/i);

        if (rssMatch && rssMatch[2]) {
            console.log(`Success! Found RSS: ${rssMatch[2]}`);
        } else {
            console.log('Failed. No RSS link found with current regex.');
            // Debug: print all link tags
            const $ = cheerio.load(html);
            $('link').each((i, el) => {
                console.log('Link tag:', $(el).attr('type'), $(el).attr('href'));
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// Test with a popular Ameba Blog
testAmeblo('https://ameblo.jp/staff/');
