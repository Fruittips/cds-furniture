const puppeteer = require("puppeteer");

const {
    SUBCATEGORY,
    TABLE_COLUMNS,
    SOFA_CATEGORY_L2_MAPPING,
    PRODUCT_URLS_COLUMNS,
} = require("./constants");
const { writeToCsv } = require("./writeToCsv");

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
        slowMo: 250,
    });
    const page = await browser.newPage();

    for (const subCategoryKey of Object.keys(SUBCATEGORY.sofas)) {
        const url = SUBCATEGORY.sofas[subCategoryKey];

        await page.evaluateOnNewDocument(() => {
            delete navigator.__proto__.webdriver;
        });

        await page.goto(`${url}?${urlParams}`, {
            waitUntil: `networkidle0`,
            timeout: 0,
        });

        const productUrls = await page.evaluate(() => {
            const productLinks = Array.from(document.querySelectorAll(".item-title a"));
            return productLinks.map((link) => link.href);
        });

        productUrls.forEach(async (url) => {
            await writeToCsv({
                data: {
                    category: "sofas",
                    subcategory: subCategoryKey,
                    url,
                },
                category: "sofas",
                columns: PRODUCT_URLS_COLUMNS,
                folderName: "productUrls",
            });
        });

        await delay(10000);
    }

    await browser.close();
})();

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}
