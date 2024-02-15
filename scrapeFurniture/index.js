const { Worker } = require("worker_threads");
const path = require("path");

const { CATEGORY } = require("./constants");
const { writeToCsv } = require("./csv");

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

const startWorker = (workerData) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, "worker.js"), {
            workerData,
        });

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
        });
    });
};

const workers = CATEGORY.map((cat) => startWorker({ category: cat }));
Promise.all(workers).then(() => console.log("Scraping for all furnitures completed."));
