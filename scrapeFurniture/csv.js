const fs = require("fs");
const path = require("path");
const { parse } = require("csv");
const { updateProgress } = require("./processUrls");

/**
 * @param {Object[]} data - data to write to the csv
 * @param {string} category
 * @param {string[]} columns - column headers
 * @param {string} folderName
 * @param {boolean} toUpdateProgress
 */
const writeToCsv = async ({ data, category, columns, folderName, toUpdateProgress }) => {
    const dirPath = path.join(__dirname, folderName, category);

    // create folder if it doesnt exist
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const csvFilePath = path.join(dirPath, `${category}.csv`);

    // create csv file with the table column headers if .csv file doesnt exist
    if (!fs.existsSync(csvFilePath)) {
        const headers = columns.join(",") + "\n";
        fs.writeFileSync(csvFilePath, headers);
    }

    let csvBuffer = "";
    const completedUrls = [];

    data.forEach((item) => {
        const productRow =
            columns
                .map((col) => {
                    if (Array.isArray(item[col])) {
                        return `"${JSON.stringify(item[col]).replace(/"/g, '""')}"`;
                    }

                    if (typeof item[col] === "object" && item[col] !== null) {
                        return `"${JSON.stringify(item[col]).replace(/"/g, '""')}"`;
                    }

                    return `"${(item[col] || "").toString().replace(/"/g, '""')}"`;
                })
                .join(",") + "\n";

        if (toUpdateProgress) {
            completedUrls.push(item.url);
        }

        csvBuffer += productRow;
    });

    fs.appendFileSync(csvFilePath, csvBuffer);
    if (toUpdateProgress) {
        updateProgress(completedUrls, category);
    }
};

/**
 * @param {string} folderName
 * @param {string} category
 * @param {Object} filterFn - function to filter the records
 * @param {Object} csvOptions - options for the csv parser
 */
const readCsv = async ({ folderName, category, filterFn, csvOptions }) => {
    const records = [];
    const parser = fs
        .createReadStream(`${__dirname}/${folderName}/${category}/${category}.csv`)
        .pipe(
            parse({
                columns: true,
                ...csvOptions,
            })
        );
    for await (const record of parser) {
        if (filterFn) {
            records.push(filterFn(record));
        } else {
            records.push(record);
        }
    }
    return records;
};

module.exports = { writeToCsv, readCsv };
