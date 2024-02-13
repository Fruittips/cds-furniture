const SOFAS_HREFS = {
    "2-seaters": "https://www.fortytwo.sg/living-room/sofas/2-seaters-love-seats.html",
    "3-seaters": "https://www.fortytwo.sg/living-room/sofas/3-seaters-large-sofas.html",
    "4-seaters-up": "https://www.fortytwo.sg/living-room/sofas/4-seaters-up.html",
    "l-shape": "https://www.fortytwo.sg/living-room/sofas/l-shape-sofas.html",
    "sofa-beds": "https://www.fortytwo.sg/living-room/sofas/sofa-beds.html",
    "leather-sofas": "https://www.fortytwo.sg/living-room/sofas/genuine-leather-sofas.html",
    recliners: "https://www.fortytwo.sg/living-room/sofas/recliners.html",
    armchairs: "https://www.fortytwo.sg/living-room/sofas/armchairs.html",
    "lounge-chairs": "https://www.fortytwo.sg/living-room/sofas/lounge-chairs.html",
    "sofa-sets": "https://www.fortytwo.sg/living-room/sofas/sofa-sets.html",
    "outdoor-sofas": "https://www.fortytwo.sg/outdoor/sofas.html",
};
/* TODO: add more for other categories */
const SOFA_42_TO_CATEGORY_L2_MAPPING = {
    "2-seaters-love-seats": "2-seaters",
    "3-seaters-large-sofas": "3-seaters",
    "4-seaters-up": "4-seaters-up",
    "l-shape-sofas": "l-shape",
    "sofa-beds": "sofa-beds",
    "genuine-leather-sofas": "leather-sofas",
    recliners: "recliners",
    armchairs: "armchairs",
    "lounge-chairs": "lounge-chairs",
    "sofa-sets": "sofa-sets",
    "outdoor-sofas": "outdoor-sofas",
};

const CATEGORY = ["sofas", "chairs", "tables", "beds", "storage"];
const SUBCATEGORY = {
    sofas: SOFAS_HREFS,
    chairs: [""],
    tables: [""],
    beds: [""],
    storage: [""],
};

const PRODUCT_URLS_COLUMNS = ["category", "subcategory", "url"];

const PRODUCT_COLUMNS = [
    "category",
    "subcategory",
    "product_code",
    "name",
    "model",
    "price",
    "url",
    "image_urls",
];

module.exports = {
    CATEGORY,
    SUBCATEGORY,
    PRODUCT_URLS_COLUMNS,
    PRODUCT_COLUMNS,
    SOFA_42_TO_CATEGORY_L2_MAPPING,
};
