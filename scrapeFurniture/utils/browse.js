const { sleep,shuffleArray } = require("./utils");


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

    // Ensure at least one tab is clicked
    if (tabs.length > 0) {
        await tabs[0].click();
        await sleep(1000);
    }

    // Click remaining tabs in shuffled order, with a random upper limit
    const upperLimit = Math.floor(Math.random() * (tabs.length - 1)) + 1; // Ensures at least one tab is always clicked
    for (let i = 1; i < upperLimit; i++) {
        await tabs[i].click();
        await sleep(1000); // Wait for 1 second between clicks
    }
};

const browse = async (page) => {
    const actions = [scrollDown, scrollUp, clickTabs];
    shuffleArray(actions); // Shuffle the actions array to randomize the order of actions

    // Decide on a random number of actions to perform, ensuring at least one action
    const numberOfActions = Math.max(3, Math.floor(Math.random() * actions.length + 1));

    for (let i = 0; i < numberOfActions; i++) {
        await actions[i % actions.length](page); // Execute the action, cycling through actions if necessary
        await sleep(Math.random() * 2000 + 1000); // Wait for 1 to 3 seconds randomly
    }

    await sleep(Math.random() * 12000 + 8000)
};

module.exports = {
    browse,
};
