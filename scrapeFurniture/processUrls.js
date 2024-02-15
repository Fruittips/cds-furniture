const fs = require("fs");
const path = require("path");

const initProcessedUrls = (category) => {
    const dirPath = path.join(__dirname, "productUrls", category, "processedUrls");
    const progressFilePath = path.join(dirPath, "processedUrls.txt");

    //create folder if it doesnt exist
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    //create file if it doesnt exist
    if (!fs.existsSync(progressFilePath)) {
        fs.writeFileSync(progressFilePath, "");
    }

    const processedUrls = new Set();
    const progressContent = fs.readFileSync(progressFilePath, "utf8");
    progressContent.split("\n").forEach((url) => {
        if (url) processedUrls.add(url.trim());
    });

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

module.exports = {
    initProcessedUrls,
    updateProgress,
};
