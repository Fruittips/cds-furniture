const puppeteer = require("puppeteer");

const {
    SUBCATEGORY,
    TABLE_COLUMNS,
    SOFA_CATEGORY_L2_MAPPING,
    PRODUCT_URLS_COLUMNS,
} = require("./constants");
const { writeToCsv } = require("./csv");

const urlParams = "dir=desc&limit=180&order=created_at"; //show 180 items per page and sort by created_at

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0`,
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--lang=en-US,en;q=0.9",
        ],
        // slowMo: 250,
    });
    const page = await browser.newPage();

    /* to prevent captchas on every new page */
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
    });

    for (const subCategoryKey of Object.keys(SUBCATEGORY.beds)) {
        const url = SUBCATEGORY.beds[subCategoryKey];

        await page.goto(`${url}?${urlParams}`, {
            waitUntil: `networkidle0`,
            timeout: 0,
        });

        const productUrls = await scrollAndGetProductUrls(page);
        productUrls.forEach(async (url) => {
            await writeToCsv({
                data: {
                    category: "beds",
                    subcategory: subCategoryKey,
                    url,
                },
                category: "beds",
                columns: PRODUCT_URLS_COLUMNS,
                folderName: "productUrls",
            });
        });

        //check if there are more pages
        let nextPageButton = await page.$(".next.i-next");
        while (nextPageButton) {
            const [response] = await Promise.all([
                page.waitForNavigation({ waitUntil: "networkidle0", timeout: 0 }),
                nextPageButton.click(),
            ]);

            await page.evaluate(() => window.scrollTo(0, 0));

            const moreProductUrls = await scrollAndGetProductUrls(page);
            moreProductUrls.forEach(async (url) => {
                await writeToCsv({
                    data: {
                        category: "beds",
                        subcategory: subCategoryKey,
                        url,
                    },
                    category: "beds",
                    columns: PRODUCT_URLS_COLUMNS,
                    folderName: "productUrls",
                });
            });
            nextPageButton = await page.$(".next.i-next");
        }
    }

    console.log("Done scraping product urls");
    await browser.close();
})();

const scrollAndGetProductUrls = async (page) => {
    /* TODO: probably dont need scrolling, need investigate if can delete */
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50);
        });
    });

    const productLinks = await page.evaluate(() => {
        const productLinks = Array.from(document.querySelectorAll(".item-title a"));
        return productLinks.map((link) => link.href);
    });

    return productLinks;
};
