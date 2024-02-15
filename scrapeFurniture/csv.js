const fs = require("fs");
const path = require("path");
const { parse } = require("csv");

/**
 * @param {Object} data - data to write to the csv
 * @param {string} category
 * @param {string[]} columns - column headers
 * @param {string} folderName
 */
const writeToCsv = async ({ data, category, columns, folderName }) => {
    const dirPath = path.join(__dirname, folderName, category);

    // create folder if it doesnt exist
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const csvFilePath = path.join(dirPath, `${category}.csv`);

    // Create the CSV file with the table column headers if .csv file doesnt exist
    if (!fs.existsSync(csvFilePath)) {
        const headers = columns.join(",") + "\n";
        fs.writeFileSync(csvFilePath, headers);
    }

    const productRow =
        columns
            .map((col) => {
                if (Array.isArray(data[col])) {
                    return `"${JSON.stringify(data[col]).replace(/"/g, '""')}"`;
                }

                if (typeof data[col] === "object" && data[col] !== null) {
                    return `"${JSON.stringify(data[col]).replace(/"/g, '""')}"`;
                }

                return data[col] || "";
            })
            .join(",") + "\n";

    fs.appendFileSync(csvFilePath, productRow);
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
