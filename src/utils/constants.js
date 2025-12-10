// Base API URL
export const BASE_URL = "http://localhost:3001";

// Product categories
export const PRODUCT_CATEGORIES = [
  { id: "business-cards", name: "Business Cards" },
  { id: "flyers", name: "Flyers" },
  { id: "brochures", name: "Brochures" },
  { id: "posters", name: "Posters" },
  { id: "banners", name: "Banners" },
  { id: "stickers", name: "Stickers" },
  { id: "postcards", name: "Postcards" },
  { id: "booklets", name: "Booklets" },
];

// Paper types
export const PAPER_TYPES = [
  { id: "standard", name: "Standard (100 lb)" },
  { id: "premium", name: "Premium (130 lb)" },
  { id: "glossy", name: "Glossy" },
  { id: "matte", name: "Matte" },
  { id: "recycled", name: "Recycled" },
];

// Quantities
export const QUANTITIES = [50, 100, 250, 500, 1000, 2500, 5000, 10000];

// Turnaround times
export const TURNAROUND_TIMES = [
  { id: "standard", name: "Standard (5-7 days)", multiplier: 1 },
  { id: "rush", name: "Rush (2-3 days)", multiplier: 1.5 },
  { id: "express", name: "Express (Next Day)", multiplier: 2 },
];

// Credit card patterns
export const CARD_PATTERNS = {
  visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
  mastercard: /^5[1-5][0-9]{14}$/,
  amex: /^3[47][0-9]{13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
};
