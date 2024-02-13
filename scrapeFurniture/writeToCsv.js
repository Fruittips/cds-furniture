const fs = require("fs");
const path = require("path");

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
                    return data[col].join("|");
                }

                return data[col] || "";
            })
            .join(",") + "\n";

    fs.appendFileSync(csvFilePath, productRow);
};

module.exports = { writeToCsv };
