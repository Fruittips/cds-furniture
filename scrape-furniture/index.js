const { Worker } = require("worker_threads");
const path = require("path");

const { CATEGORY } = require("./constants");
const { shuffleCsv } = require("./utils/csv");
const { writeToCsv } = require("./utils/csv");
const { sleep } = require("./utils/utils");

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

let workers = [];
process.on("SIGINT", async () => {
    console.log("SIGINT signal received. Closing all browsers...");

    workers.forEach((worker) => worker.postMessage({ action: "shutdown" }));

    await sleep(2000);
    process.exit(0);
});

const startWorker = (workerData) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, "worker.js"), {
            workerData,
        });
        workers.push(worker);

        worker.on("message", (data) => {
            writeToCsv({
                data: data.data,
                category: data.category,
                columns: TABLE_COLUMNS,
                folderName: "productDetails",
                toUpdateProgress: true,
            });
        });

        worker.on("error", reject);

        worker.on("exit", (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
            resolve();
            workers = workers.filter((w) => w !== worker);
        });
    });
};

const shuffleCsvByCategories = (categories) => {
    const folderName = "productUrls";

    categories.forEach((category) => {
        const csvFilePath = path.join(__dirname, folderName, category, `${category}.csv`);
        const outputFilePath = path.join(
            __dirname,
            folderName,
            category,
            `${category}_shuffled.csv`
        );

        shuffleCsv(csvFilePath, outputFilePath);
    });
};

const categories = CATEGORY;
shuffleCsvByCategories(categories);

const workersProcess = categories.map((cat) => startWorker({ category: cat }));
Promise.all(workersProcess).then(() => console.log("Scraping completed."));
