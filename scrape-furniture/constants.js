const SOFAS_URLS = {
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

const CHAIRS_URLS = {
    "dining-chairs": "https://www.fortytwo.sg/dining/dining-chairs.html",
    "office-chairs": "https://www.fortytwo.sg/office-solution/office-chairs.html",
    "bar-stools": "https://www.fortytwo.sg/living-room/bar-stool.html",
    "dining-benches": "https://www.fortytwo.sg/dining/bench-stool.html",
    benches: "https://www.fortytwo.sg/living-room/benches.html",
    "stools-ottomans": "https://www.fortytwo.sg/living-room/stools-ottomans.html",
    "bean-bags-poufs": "https://www.fortytwo.sg/home-decor-lifestyle/bean-bags-poufs.html",
    "outdoor-dining-sets": "https://www.fortytwo.sg/outdoor/outdoor-dining-sets.html",
};

const TABLES_URLS = {
    "dining-tables": "https://www.fortytwo.sg/dining/dining-tables.html",
    "coffee-tables": "https://www.fortytwo.sg/living-room/coffee-table.html",
    "side-tables": "https://www.fortytwo.sg/living-room/side-tables.html",
    "bedside-tables": "https://www.fortytwo.sg/bedroom-furniture/bedside-tables.html",
    "study-desks": "https://www.fortytwo.sg/study-room/study-desk.html",
    "outdoor-tables": "https://www.fortytwo.sg/outdoor/outdoor-tables.html",
    "dressing-tables": "https://www.fortytwo.sg/bedroom-furniture/dressing-tables.html",
    "bar-tables": "https://www.fortytwo.sg/living-room/bar-tables.html",
    "office-tables": "https://www.fortytwo.sg/office-solution/office-tables.html",
    "dining-table-sets": "https://www.fortytwo.sg/dining/dining-room.html",
};

const STORAGE_URLS = {
    "standalone-wardrobes": "https://www.fortytwo.sg/bedroom-furniture/wardrobe.html",
    "modular-wardrobes": "https://www.fortytwo.sg/bedroom-furniture/modular-wardrobe.html",
    "tv-consoles": "https://www.fortytwo.sg/living-room/tv-consoles.html",
    "display-cabinets-shelves":
        "https://www.fortytwo.sg/living-room/display-cabinet/display-cabinets-shelves.html",
    "bookcase-storage":
        "https://www.fortytwo.sg/living-room/display-cabinet/bookcase-storages.html",
    "sideboards-highboards":
        "https://www.fortytwo.sg/living-room/display-cabinet/sideboards-highboards.html",
    "shoe-racks": "https://www.fortytwo.sg/living-room/shoe-racks.html",
    "kitchen-cabinets-trolley": "https://www.fortytwo.sg/dining/kitchen-furniture.html",
    "chest-of-drawers":
        "https://www.fortytwo.sg/bedroom-furniture/storage-units/chest-of-drawers.html",
    "office-cabinets":
        "https://www.fortytwo.sg/bedroom-furniture/storage-units/chest-of-drawers.html",
    "outdoor-storage-cabinets": "https://www.fortytwo.sg/outdoor/cabinets.html",
};

const BEDS_URLS = {
    "upholstered-beds":
        "https://www.fortytwo.sg/bedroom-furniture/beds/bedframe/upholstered-bedframe.html",
    "storage-beds": "https://www.fortytwo.sg/bedroom-furniture/beds/storage-beds.html",
    "double-decker-beds": "https://www.fortytwo.sg/bedroom-furniture/beds/double-decks.html",
    "metal-bed-frames": "https://www.fortytwo.sg/bedroom-furniture/beds/metal-bed-frames.html",
    "wooden-bed-frames": "https://www.fortytwo.sg/bedroom-furniture/beds/wooden-bed-frames.html",
    "trundle-beds": "https://www.fortytwo.sg/bedroom-furniture/beds/3-in-1-beds.html",
    "bed-frame-with-mattress": "https://www.fortytwo.sg/bedroom-furniture/bed-set-package.html",
    "bedroom-sets": "https://www.fortytwo.sg/bedroom-furniture/bedroom-sets.html",
};

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
    sofas: SOFAS_URLS,
    chairs: CHAIRS_URLS,
    tables: TABLES_URLS,
    beds: BEDS_URLS,
    storage: STORAGE_URLS,
};

module.exports = {
    CATEGORY,
    SUBCATEGORY,
    SOFA_42_TO_CATEGORY_L2_MAPPING,
};
