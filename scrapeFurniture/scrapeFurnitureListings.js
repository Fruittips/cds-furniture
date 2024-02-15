const puppeteer = require("puppeteer");
const { readCsv, writeToCsv } = require("./csv");
const { initProcessedUrls, updateProgress } = require("./processUrls");
const { CATEGORY } = require("./constants");

const TABLE_COLUMNS = [
    "title",
    "url",
    "category",
    "subcategory",
    "brand",
    "product_id",
    "supplier_product_id",
    "price",
    "currency",
    "image_urls",
    "lifestyle_image_urls",
    "specifications",
    "colour",
    "colours",
    "description",
];
/**
 * each csv record has this following structure:
 *  {
 *      category: string,
 *      subcategory: string,
 *      url: string,
 *  }
 */
(async () => {
    const browser = await puppeteer.launch({
        // headless: false,
        args: [
            `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0`,
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--lang=en-US,en;q=0.9",
        ],
        // slowMo: 250, //TODO: disable after testing
    });
    const page = await browser.newPage();

    /* to prevent captchas on every new page */
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
    });

    for (const category of CATEGORY) {
        const furnitureListings = await readCsv({
            folderName: "productUrls",
            category: category,
        });

        let counter = 0;
        const processedUrls = initProcessedUrls(category);
        for (const furniture of furnitureListings) {
            const url = furniture.url;

            if (processedUrls.has(url)) {
                console.log(`Skipping processed URL: ${url}`);
                continue;
            }

            try {
                const success = await gotoWithRetry(page, testUrl, 3); //retry going to the page 3 times
                if (!success) {
                    console.log(`\x1b[31mFailed to load page after retries: ${url}\x1b[0m`);
                    continue;
                }
            } catch (error) {
                console.log(
                    `\x1b[31mGiving up on ${url} after retries due to error: ${error.message}\x1b[0m`
                );
                continue;
            }

            //check if page is found
            const notFound = await page.evaluate(() => {
                notFoundElement = document.querySelector("title").innerText;
                return notFoundElement.includes("404 Not Found");
            });

            if (notFound) {
                console.log(`Page not found: ${url}`);
                continue;
            }

            const basicProductInfo = await getBasicProductInfo(page);
            const description = await getProductDescription(page);
            const { images, lifestyleImages } = await getProductImages(page);
            const colours = await getColours(page);
            const specifications = await getSpecifications(page);
            const { productId, colour } = await getProductColourAndId(page, specifications);

            const productRowData = {
                title: basicProductInfo.title,
                url: url,
                category: category,
                subcategory: furniture.subcategory,
                brand: basicProductInfo.brand,
                product_id: productId,
                supplier_product_id: basicProductInfo.supplierProductId,
                price: basicProductInfo.price,
                currency: basicProductInfo.currency,
                image_urls: images,
                lifestyle_image_urls: lifestyleImages,
                specifications: specifications,
                colour: colour,
                colours: colours,
                description: description,
            };

            writeToCsv({
                data: productRowData,
                category: category,
                columns: TABLE_COLUMNS,
                folderName: "productDetails",
            });

            updateProgress(url, category);
            counter++;
            console.log(`[${counter}] Scraped product: ${basicProductInfo.title} (${url})`);
            return;
        }

        counter = 0;
        console.log(`Scraped all products in category: ${category}`);
        return;
    }

    await browser.close();
})();

const getBasicProductInfo = async (page) => {
    const productDetails = await page.evaluate(() => {
        const dataLayerProductDetails = window.dataLayer.find(
            (entry) => entry.event === "view_item" && entry.ecommerce
        );
        return dataLayerProductDetails
            ? dataLayerProductDetails.ecommerce.detail.products[0]
            : null;
    });

    const currencyCode = await page.evaluate(() => {
        const currencyElement = document.querySelector("meta[itemprop='priceCurrency']");
        return currencyElement ? currencyElement.getAttribute("content") : null;
    });

    return {
        title: productDetails.name,
        supplierProductId: productDetails.id,
        price: productDetails.price,
        brand: productDetails.brand,
        currency: currencyCode,
    };
};

const getProductDescription = async (page) => {
    const description = await page.evaluate(() => {
        const descriptionElement = document.querySelector("div[itemprop='description']");
        return descriptionElement ? descriptionElement.innerText : null;
    });

    if (!description) return "";

    let cleanedDesc = description.replace(/\n+/g, " ").trim();

    // Escape double quotes by doubling them
    cleanedDesc = description.replace(/"/g, '""');
    cleanedDesc = description.replace(/^\s*[\r\n]/gm, "");

    return `"${cleanedDesc}"`;
};

const getProductColourAndId = async (page, specifications) => {
    let productId = null;
    let colour = null;

    /**
     * colours can be extracted from 2 places:
     * 1. from the specifications
     * 2. if it is not in specifications, then it is in the product title
     */

    if (specifications?.["Colour"]) {
        colour = specifications["Colour"].trim().toLowerCase();
    }

    if (!colour) {
        const colourText = await page.evaluate(() => {
            const colourRegex = /\(([^)]+)\)/; // Matches text inside parentheses
            const title = document.querySelector('h1[itemprop="name"]').innerText;
            const matches = title.match(colourRegex);
            return matches ? matches[1] : null;
        });
        colour = colourText && colourText.toLowerCase();
    }

    productId = await page.evaluate(() => {
        const productElement = document.querySelector("input[name='product']");
        return productElement ? productElement.getAttribute("value") : null;
    });
    return { productId, colour };
};

const getSpecifications = async (page) => {
    const specifications = await page.evaluate(() => {
        let specs = {};

        const specTables = Array.from(
            document.querySelectorAll("table[id*='product-attribute-specs-table']")
        );

        specTables.forEach((table) => {
            tableRows = Array.from(table.querySelectorAll("tr"));
            tableRows.forEach((row) => {
                const header = row.querySelector("th");
                const data = row.querySelector("td");
                if (header && data) {
                    const key = header.innerText.trim();
                    const value = data.innerText.trim();
                    specs[key] = value;
                }
            });
        });
        return specs;
    });

    return specifications;
};

const getProductImages = async (page) => {
    const [images, lifestyleImages] = await page.evaluate(() => {
        const lifestyleImageUrls = [];
        const imageUrls = [];
        Array.from(document.querySelectorAll("a.lightbox")).forEach((a) => {
            const href = a.href;
            const img = a.querySelector("img");
            const alt = img.alt;

            const containsLifestyle = alt.includes("lifestyle") || alt.includes("Lifestyle");
            if (containsLifestyle) {
                lifestyleImageUrls.push(href);
                return;
            }

            imageUrls.push(href);
        });

        const uniqueImageUrls = [...new Set(imageUrls)];
        const uniqueLifeStyleImageUrls = [...new Set(lifestyleImageUrls)];
        return [uniqueImageUrls, uniqueLifeStyleImageUrls];
    });

    return { images, lifestyleImages };
};

/**
 * jsonData contains information about the product images if there are multiple colours.
 * @param {Object} jsonData
 * @param {Object} jsonData.option_labels
 * @param {String[]} jsonData.small_image
 * @param {Object} jsonData.medium_image
 * @param {Object} jsonData.base_image
 * @param {Object} jsonData.additional_images
 * @memberof ExampleClass
 */
const getColours = async (page) => {
    const productImagesData = await page.evaluate(() => {
        const scriptTags = Array.from(document.querySelectorAll("script"));
        let jsonData = null;

        for (const script of scriptTags) {
            if (script.textContent.includes("ConfigurableMediaImages.setImageFallback")) {
                const regex =
                    /ConfigurableMediaImages.setImageFallback\(\d+, \$j.parseJSON\('(.+?)'\)\);/s;
                const matches = script.textContent.match(regex);

                let jsonString;
                if (matches && matches[1]) {
                    jsonString = matches[1].replace(/\\'/g, "'");
                    if (jsonString) {
                        jsonData = JSON.parse(jsonString);
                    }
                }
            }
        }
        return jsonData;
    });

    let colours = null;
    if (productImagesData) {
        colours = {};
        const { option_labels } = productImagesData;
        Object.keys(option_labels).forEach((colourKey) => {
            const variation = option_labels[colourKey];
            colours[colourKey] = {
                productId: variation.products[0],
                imageUrl: variation.configurable_product.base_image,
            };
        });
    }

    return colours;
};

const gotoWithRetry = async (page, url, maxAttempts = 3) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
            return true;
        } catch (error) {
            console.log(`Attempt ${attempt} failed for ${url}: ${error.message}`);
            if (attempt === maxAttempts) throw error;
        }
    }
};
