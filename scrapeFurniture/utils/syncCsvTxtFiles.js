const fs = require("fs");
const csv = require("fast-csv");
const path = require("path");

const syncFiles = (categories) => {
    for (const category of categories) {
        const csvFilePath = path.join(
            __dirname,
            "..",
            "productDetails",
            category,
            `${category}.csv`
        );
        const tempCsvFilePath = path.join(
            __dirname,
            "..",
            "productDetails",
            category,
            `${category}_temp.csv`
        );
        const txtFilePath = path.join(
            __dirname,
            "..",
            "productUrls",
            category,
            "processedUrls",
            "processedUrls.txt"
        );
        const tempTxtFilePath = path.join(
            __dirname,
            "..",
            "productUrls",
            category,
            "processedUrls",
            "processedUrls_temp.txt"
        );

        const urlsToKeep = new Set();

        fs.createReadStream(csvFilePath)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => console.error(error))
            .on("data", (row) => {
                if (row.title && row.title.trim() !== `""`) {
                    urlsToKeep.add(row.url);
                }
            })
            .on("end", () => {
                console.log(`Finished filtering CSV.`);

                fs.writeFileSync(tempTxtFilePath, [...urlsToKeep].join("\n"));
                console.log("Temporary TXT file with URLs created.");

                const writeStream = fs.createWriteStream(tempCsvFilePath);
                fs.createReadStream(csvFilePath)
                    .pipe(csv.parse({ headers: true }))
                    .pipe(csv.format({ headers: true }))
                    .transform((row) => (urlsToKeep.has(row.url) ? row : null))
                    .pipe(writeStream)
                    .on("finish", () => {
                        console.log("Temporary filtered CSV created.");

                        // Step 2: Delete original files
                        fs.unlinkSync(csvFilePath);
                        fs.unlinkSync(txtFilePath);
                        console.log("Original files deleted.");

                        // Step 3: Rename new files to original names
                        fs.renameSync(tempCsvFilePath, csvFilePath);
                        fs.renameSync(tempTxtFilePath, txtFilePath);
                        console.log("Temporary files renamed to original file names.");
                    });
            });
    }
};

const categories = ["sofas", "chairs", "tables", "beds", "storage"];

syncFiles(categories);
