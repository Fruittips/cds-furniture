const simulateHumanMouseMovement = async (page) => {
    const viewport = await page.viewport();
    let currentX = 0;
    let currentY = 0;
    const targetX = Math.floor(Math.random() * viewport.width);
    const targetY = Math.floor(Math.random() * viewport.height);

    while (currentX !== targetX || currentY !== targetY) {
        currentX += (targetX - currentX) / 10 + Math.floor(Math.random() * 5 - 2);
        currentY += (targetY - currentY) / 10 + Math.floor(Math.random() * 5 - 2);

        await page.mouse.move(currentX, currentY);
        await page.waitForTimeout(50);
    }
};

const simulateHumanScrolling = async (page) => {
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight + Math.floor(Math.random() * 100 - 50));
    });
    await page.waitForTimeout(1000);
};

const simulateBrowsing = async (page) => {
    await simulateHumanMouseMovement(page);
    await simulateHumanScrolling(page);
};

module.exports = {
    simulateBrowsing,
};
