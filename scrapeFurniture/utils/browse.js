const { sleep, shuffleArray } = require("./utils");

async function ensureVisibleAndClick(tab) {
    await tab.evaluate((el) =>
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    );
    await sleep(500);
    await tab.click();
    await sleep(1000);
}

async function scrollDown(page) {
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
    });
}

async function scrollUp(page) {
    await page.evaluate(() => {
        window.scrollBy(0, -window.innerHeight);
    });
}

const clickTabs = async (page) => {
    const tabs = await page.$$(".product-collateral-tab");

    shuffleArray(tabs);

    if (tabs.length > 0) {
        await ensureVisibleAndClick(tabs[0], page);
    }

    const upperLimit = Math.floor(Math.random() * tabs.length);
    for (let i = 1; i < upperLimit; i++) {
        await ensureVisibleAndClick(tabs[i], page);
    }
};

const browse = async (page) => {
    const actions = [scrollDown, scrollUp, clickTabs];
    shuffleArray(actions);

    const numberOfActions = Math.max(3, Math.floor(Math.random() * actions.length + 1));

    for (let i = 0; i < numberOfActions; i++) {
        await actions[i % actions.length](page);
        await sleep(Math.random() * 2000 + 1000);
    }

    await sleep(Math.random() * 6000 + 3000);
};

module.exports = {
    browse,
};
