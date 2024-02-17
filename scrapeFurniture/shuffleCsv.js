const path = require("path");
const { shuffleCsv } = require("./utils/csv");

const folderName = "productUrls";
const category = "storage";

const csvFilePath = path.join(__dirname, folderName, category, `${category}.csv`);
const outputFilePath = path.join(__dirname, folderName, category, `${category}_shuffled.csv`);

shuffleCsv(csvFilePath, outputFilePath);
