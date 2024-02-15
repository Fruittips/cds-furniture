const fs = require("fs");
const path = require("path");

const initProcessedUrls = (category) => {
    const progressFilePath = path.join(
        __dirname,
        "productUrls",
        category,
        "processedUrls",
        "processedUrls.txt"
    );

    const processedUrls = new Set();
    if (fs.existsSync(progressFilePath)) {
        const progressContent = fs.readFileSync(progressFilePath, "utf8");
        progressContent.split("\n").forEach((url) => {
            if (url) processedUrls.add(url.trim());
        });
    }
    return processedUrls;
};

function updateProgress(url, category) {
    const progressFilePath = path.join(
        __dirname,
        "productUrls",
        category,
        "processedUrls",
        "processedUrls.txt"
    );
    fs.appendFileSync(progressFilePath, url + "\n");
}

// Example function to process URLs
async function processUrls() {
    // Simulating reading URLs from a file
    const urlsToProcess = ["http://example.com/product1", "http://example.com/product2"]; // Replace with actual reading

    for (let url of urlsToProcess) {
        if (processedUrls.has(url)) {
            console.log(`Skipping processed URL: ${url}`);
            continue; // Skip already processed URLs
        }

        try {
            // Your scraping logic here
            console.log(`Processing URL: ${url}`);
            // Simulate successful scraping
            // saveProductDetails(url);

            // Update progress after successful scraping
            updateProgress(url);
        } catch (error) {
            console.error(`Error processing URL ${url}:`, error);
            // Decide if you want to halt or just log the error and continue
            break; // or `continue` to skip to the next URL
        }
    }
}

module.exports = {
    initProcessedUrls,
    updateProgress,
};
