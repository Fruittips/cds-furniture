const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = {
    shuffleArray,
    sleep,
};
