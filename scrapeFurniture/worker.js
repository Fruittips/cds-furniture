const puppeteer = require("puppeteer");
const { parentPort, workerData } = require("worker_threads");
const { initProcessedUrls } = require("./processUrls");
const { readCsv } = require("./csv");

let browser;
const buffer = [];

/**
 * each csv record has this following structure:
 *  {
 *      category: string,
 *      subcategory: string,
 *      url: string,
 *  }
 */
const scrape = async ({ category }) => {
    browser = await puppeteer.launch({
        headless: false,
        args: [
            `--user-agent=${getRandomUserAgent()}`,
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--lang=en-US,en;q=0.9",
        ],
        handleSIGINT: true,
        // slowMo: 250, //TODO: disable after testing
    });
    try {
        const page = await browser.newPage();

        /* to prevent captchas on every new page */
        await page.evaluateOnNewDocument(() => {
            delete navigator.__proto__.webdriver;
        });

        const furnitureListings = await readCsv({
            folderName: "productUrls",
            category: category,
        });

        const processedUrls = initProcessedUrls(category);
        for (const furniture of furnitureListings) {
            const url = furniture.url;

            if (processedUrls.has(url)) {
                console.log(`Skipping processed URL: ${url}`);
                continue;
            }

            try {
                await page.setUserAgent(getRandomUserAgent());
                const success = await gotoWithRetry(page, url, 3); //retry going to the page 3 times
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

            await scrollAndGetProductUrls(page);


            const captcha = await page.evaluate(()=>{
                const captcha = document.querySelector('div[id="challenge-stage"]')
                return captcha
            })
            if (captcha) {
                console.log(`\x1b[31mCAPTCHA: ${url}\x1b[0m`);
                await closeBrowser();
                return;
            }


            //check if page is found
            const notFound = await page.evaluate(() => {
                notFoundElement = document.querySelector("title").innerText;
                return notFoundElement.includes("404 Not Found");
            });
            if (notFound) {
                console.log(`\x1b[31mPage not found: ${url}\x1b[0m`);
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

            buffer.push(productRowData);
            if (buffer.length >= 50) {
                parentPort.postMessage({ data: buffer, category: category });
                buffer.length = 0;
            }

            console.log(`Scraped product: ${basicProductInfo.title} (${url})`);
        }

        if (buffer.length > 0) {
            parentPort.postMessage({ data: buffer, category: category });
            buffer.length = 0;
        }

        console.log(`Scraped all products in category: ${category}`);
        await closeBrowser();
    } catch (error) {
        console.log(`Error in worker: ${error.message}`);
    } finally {
        if (browser) {
            await closeBrowser();
        }
    }
};
scrape(workerData);

function getRandomUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36",
    ];

    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
}

const getBasicProductInfo = async (page) => {
    const currencyCode = await page.evaluate(() => {
        const currencyElement = document.querySelector("meta[itemprop='priceCurrency']");
        return currencyElement ? currencyElement.getAttribute("content") : null;
    });

    const productDetails = await page.evaluate(() => {
        if (!window.dataLayer) return null;

        const dataLayerProductDetails = window.dataLayer.find(
            (entry) => entry.event === "view_item" && entry.ecommerce
        );
        return dataLayerProductDetails
            ? dataLayerProductDetails.ecommerce.detail.products[0]
            : null;
    });

    if (productDetails) {
        return {
            title: `"${productDetails.name}"`,
            supplierProductId: productDetails.id,
            price: productDetails.price,
            brand: `"${productDetails.brand}"`,
            currency: `"${currencyCode}"`,
        };
    }

    /* fallback if productDetails is empty */
    const title = await page.evaluate(() => {
        return document.querySelector('h1[itemprop="name"]')
            ? document.querySelector('h1[itemprop="name"]').innerText
            : "";
    });
    const price = await page.evaluate(() => {
        const specialPriceElement = document.querySelector(".price-box .special-price .price");
        if (specialPriceElement) {
            return specialPriceElement.innerText.trim();
        } else {
            const regularPriceElement = document.querySelector(".price-box .regular-price .price");
            return regularPriceElement ? regularPriceElement.innerText.trim() : null;
        }
    });

    return {
        title: `"${title}"`,
        supplierProductId: null,
        price: price,
        brand: null,
        currency: `"${currencyCode}"`,
    };
};

const getProductDescription = async (page) => {
    const description = await page.evaluate(() => {
        const descriptionElement = document.querySelector("div[itemprop='description']");
        return descriptionElement ? descriptionElement.innerText : null;
    });

    if (!description) return "";

    let cleanedDesc = description
        .replace(/\s*[\r\n]+/g, " ") // Replace newlines with a space
        .trim() // Trim leading and trailing whitespace
        .replace(/"/g, '""'); // Escape double quotes by doubling them

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
            const title = document.querySelector('h1[itemprop="name"]')
                ? document.querySelector('h1[itemprop="name"]').innerText
                : "";
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

        if (Object.keys(option_labels).length > 0) {
            Object.keys(option_labels).forEach((colourKey) => {
                const variation = option_labels[colourKey];
                colours[colourKey] = {
                    productId: variation.products[0],
                    imageUrl: variation.configurable_product.base_image,
                };
            });
        } else {
            const options = await page.evaluate(() => {
                const selectElement = document.querySelector("select");
                if (selectElement) {
                    const options = Array.from(selectElement.querySelectorAll("option"));
                    return options;
                }
                return [];
            });

            if (options.length > 1) {
                options.slice(1).forEach((option) => {
                    const colourLabel = option.config.label.trim().toLowerCase();
                    colours[colourLabel] = {
                        productId: option.config.products[0],
                        imageUrl: null,
                    };
                });
            } else {
                colours = null;
            }
        }
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

const scrollAndGetProductUrls = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 50;
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

    await new Promise(r => setTimeout(r, 3000));
};

const closeBrowser = async () => {
    if (browser) {
        console.log("Closing browser...");
        await browser.close();
        console.log("Browser closed.");
    }
};
