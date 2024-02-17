const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
];
const referers = [
    "https://www.google.com",
    "https://www.facebook.com",
    "https://www.instagram.com",
];

const getRandomUserAgent = () => {
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
};

const getRandomReferer = () => {
    const randomIndex = Math.floor(Math.random() * referers.length);
    return referers[randomIndex];
};

const closeBrowser = async (browser) => {
    if (browser) {
        console.log("Closing browser...");
        await browser.close();
        console.log("Browser closed.");
    }
};

const gotoWithRetry = async (page, url, maxAttempts = 3) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await page.setUserAgent(getRandomUserAgent());
            await page.setExtraHTTPHeaders({
                referer: getRandomReferer(),
            });
            const response = await page.goto(url, { waitUntil: "networkidle0", timeout: 15000 });
            if (response && response.status() >= 400) {
                console.log(`\x1b[31mFailed to load page: ${response.status()}\x1b[0m`);
                return false;
            }

            return true;
        } catch (error) {
            console.log(`Attempt ${attempt} failed for ${url}: ${error.message}`);
            if (attempt === maxAttempts) return false;
        }
    }
};

module.exports = {
    closeBrowser,
    getRandomUserAgent,
    gotoWithRetry,
};
