const puppeteer = require("puppeteer");
const { readCsv } = require("./csv");
const { CATEGORY } = require("./constants");

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
        headless: false,
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

        for (const furniture of furnitureListings) {
            const url = furniture.url;

            await page.goto(url, {
                waitUntil: `networkidle0`,
                timeout: 0,
            });

            //if dont have images -> have to get from thumbnails all
            // const basicProductInfo = await getBasicProductInfo(page);

            const [productImages, colours] = await getMoreProductImagesAndColours(page);
            // const productImages = await getProductImages(page);

            /* TODO: if colours == null, abstract from either specs/title */

            // const [colours, productIds] = await getColoursAndProductIds(page);
            // const specifications = await getSpecifications(page);

            // if (colours.length > 1) {
            //     //TODO: get the images for the other colours too
            //     //get a set of colours they are unique links
            // }

            console.log({
                // basicProductInfo,
                colours,
                // productIds,
                // productImages,
                // specifications,
            });
            console.log("-----");
        }
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

    return {
        title: productDetails.name,
        supplierProductId: productDetails.id,
        price: productDetails.price,
        brand: productDetails.brand,
    };
};

const getColoursAndProductIds = async (page) => {
    let colours = null;
    let productIds = {};

    const spConfigData = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll("script"));

        for (const script of scripts) {
            if (script.innerText.includes("var spConfig = new Product.Config")) {
                const regex = /var spConfig = new Product.Config\((.+)\);/;
                const match = script.innerText.match(regex);
                if (match && match[1]) {
                    try {
                        return JSON.parse(match[1].replace(/\/\*.*?\*\//g, ""));
                    } catch (e) {
                        console.error("Could not parse spConfig JSON:", e);
                    }
                }
                break;
            }
        }

        return null;
    });

    if (spConfigData) {
        const attributes = spConfigData.attributes;
        const attrObjKeys = Object.keys(attributes);
        attrObjKeys.forEach((key) => {
            const colourOptions = attributes[key].options;

            if (colourOptions.length > 1) {
                colours = colourOptions.map((option) => option.label);
                colourOptions.forEach((option) => {
                    productIds[`${option.label}`] = option.products[0];
                });
            }
        });
    } else {
        /* Some pages do not have spConfig -> for those that do not have multiple colour options */

        /**
         * colours can be extracted from 2 places:
         * 1. from the specifications
         * 2. if it is not in specifications, then it is in the product title
         */
        const specifications = await getSpecifications(page);

        if (specifications?.["Colour"]) {
            colours = [specifications["Colour"].trim()];
        }

        if (!colours) {
            const colour = await page.evaluate(() => {
                const colourRegex = /\(([^)]+)\)/; // Matches text inside parentheses
                const title = document.querySelector('h1[itemprop="name"]').innerText;
                const matches = title.match(colourRegex);
                return matches ? matches[1] : null;
            });
            colours = [colour];
        }

        const productId = await page.evaluate(() => {
            const productElement = document.querySelector(".product-label-placeholder");
            return productElement ? productElement.getAttribute("data-productid") : null;
        });

        if (colours.length > 0 && productId) {
            productIds[`${colours[0]}`] = productId;
        }
    }

    return [colours, productIds];
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

//find <ul> with class="more-views" -> find all <li> -> find all <a> -> get href
const getProductImages = async (page) => {
    const images = await page.evaluate(() => {
        const imageUrls = Array.from(document.querySelectorAll(".more-views li a")).map(
            (a) => a.href
        );
        return imageUrls;
    });

    return images;
};

/**
 * jsonData contains information about the product images if there are multiple colours.
 * @param {Object} jsonData
 * @param {Object} jsonData.option_labels
 * @param {String[]} jsonData.small_image
 * @param {Object} jsonData.medium_image
 * @param {Object} jsonData.base_image
 * @param {Object} jsonData.additional_images -> the validation images can be found here TODO: check if image with product id -> cfm is validation image
 * @memberof ExampleClass
 */
const getMoreProductImagesAndColours = async (page) => {
    const productImagesData = await page.evaluate(() => {
        // Find the script tag by its content, assuming this snippet is unique enough
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
        const { option_labels, small_image, medium_image, base_image, additional_images } =
            productImagesData;

        // console.log(small_image);
        // console.log(medium_image);
        console.log(base_image);
        // console.log(additional_images);
        colours = Object.keys(option_labels);

        // Object.keys(option_labels).forEach((colourKey) => {
        //     const x = option_labels[colourKey].configurable_product.additional_images;
        //     console.log(x);
        //     console.log("-----");
        // });
    }

    return [productImagesData, colours];
};
