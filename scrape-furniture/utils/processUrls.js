const fs = require("fs");
const path = require("path");

const initProcessedUrls = (category) => {
    const dirPath = path.join(__dirname, "..", "productUrls", category, "processedUrls");
    const progressFilePath = path.join(dirPath, "processedUrls.txt");

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

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

function updateProgress(urls, category) {
    const progressFilePath = path.join(
        __dirname,
        "..",
        "productUrls",
        category,
        "processedUrls",
        "processedUrls.txt"
    );

    const dirName = path.dirname(progressFilePath);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    const urlsString = urls.join("\n") + "\n";
    fs.appendFileSync(progressFilePath, urlsString);
}

module.exports = {
    initProcessedUrls,
    updateProgress,
};
