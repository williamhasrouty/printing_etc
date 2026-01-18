// Base API URL
export const BASE_URL = "http://localhost:3002";

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

// Flyer specific options
export const FLYER_PAPER = [
  { id: "100lb-gloss-book", name: "100 lb. Gloss Book" },
  { id: "100lb-gloss-cover", name: "100 lb. Gloss Cover" },
  { id: "100lb-matte-cover", name: "100 lb. Matte Cover" },
  { id: "14pt-gloss", name: "14 pt. Gloss" },
  { id: "14pt-uncoated", name: "14 pt. Uncoated" },
  { id: "80lb-gloss-book", name: "80 lb. Gloss Book" },
  { id: "80lb-matte-text", name: "80 lb. Matte Text" },
  { id: "13pt-premium-linen", name: "13 pt. Premium Linen" },
  { id: "18pt-premium-kraft", name: "18 pt. Premium Kraft" },
  { id: "18pt-ultra-pearl", name: "18 pt. Ultra Premium Pearl" },
  { id: "18pt-ultra-smooth", name: "18 pt. Ultra Premium Smooth White" },
];

export const FLYER_SIZES = [
  { id: "2.5x4", name: '2.5" x 4"' },
  { id: "3.5x8.5", name: '3.5" x 8.5"' },
  { id: "3.75x8.25", name: '3.75" x 8.25"' },
  { id: "4x6", name: '4" x 6"' },
  { id: "4x9", name: '4" x 9"' },
  { id: "4.25x5.5", name: '4.25" x 5.5"' },
  { id: "4.25x11", name: '4.25" x 11"' },
  { id: "5x7", name: '5" x 7"' },
  { id: "5.5x8.5", name: '5.5" x 8.5"' },
  { id: "6x6", name: '6" x 6"' },
  { id: "6x9", name: '6" x 9"' },
  { id: "8x8", name: '8" x 8"' },
  { id: "8x10", name: '8" x 10"' },
  { id: "8.5x11", name: '8.5" x 11"' },
  { id: "8.5x14", name: '8.5" x 14"' },
  { id: "9x12", name: '9" x 12"' },
  { id: "11x17", name: '11" x 17"' },
  { id: "12x12", name: '12" x 12"' },
];

export const FLYER_COLORS = [
  { id: "full-front-no-back", name: "Full Color Front, No Back" },
  { id: "full-both", name: "Full Color Both Sides" },
];

// Business Card specific options
export const BUSINESS_CARD_QUANTITIES = [
  500, 1000, 2500, 5000, 7500, 10000, 15000, 25000,
];

export const BUSINESS_CARD_PAPER = [
  {
    id: "16pt-gloss",
    name: "16pt Gloss",
    coating: "High Gloss UV Coating Front",
    pricing: {
      500: 35,
      1000: 48,
      2500: 75,
      5000: 120,
      7500: 165,
      10000: 210,
      15000: 295,
      25000: 450,
    },
  },
  {
    id: "16pt-uncoated",
    name: "16pt Uncoated",
    coating: "No Coating",
    pricing: {
      500: 35,
      1000: 48,
      2500: 75,
      5000: 120,
      7500: 165,
      10000: 210,
      15000: 295,
      25000: 450,
    },
  },
  {
    id: "16pt-matte",
    name: "16pt Matte",
    coating: "Matte Aqueous Coating",
    pricing: {
      500: 35,
      1000: 48,
      2500: 75,
      5000: 120,
      7500: 165,
      10000: 210,
      15000: 295,
      25000: 450,
    },
  },
  {
    id: "13pt-linen",
    name: "13pt Premium Linen",
    coating: "No Coating",
    pricing: {
      500: 48,
      1000: 65,
      2500: 95,
      5000: 155,
    },
  },
  {
    id: "24pt-trifecta-green",
    name: "24 pt. Trifecta Green",
    coating: "No Coating",
    pricing: {
      500: 98,
      1000: 145,
      2500: 240,
      5000: 395,
    },
  },
  {
    id: "38pt-trifecta-black",
    name: "38 pt. Trifecta Black",
    coating: "No Coating",
    pricing: {
      500: 125,
      1000: 185,
      2500: 305,
      5000: 500,
    },
  },
  {
    id: "38pt-trifecta-blue",
    name: "38 pt. Trifecta Blue",
    coating: "No Coating",
    pricing: {
      500: 125,
      1000: 185,
      2500: 305,
      5000: 500,
    },
  },
  {
    id: "38pt-trifecta-red",
    name: "38 pt. Trifecta Red",
    coating: "No Coating",
    pricing: {
      500: 125,
      1000: 185,
      2500: 305,
      5000: 500,
    },
  },
];

export const BUSINESS_CARD_COLORS = [
  { id: "full-front-no-back", name: "Full Color Front, No Back", price: 0 },
  {
    id: "full-front-grayscale",
    name: "Full Color Front, Grayscale Back",
    price: 0,
  },
  { id: "full-both", name: "Full Color Both Sides", price: 10 },
];

export const BUSINESS_CARD_COATING = [
  {
    id: "matte-front",
    name: "Matte Aqueous Coating - Front",
    price: 0,
    sides: "front",
    type: "matte",
  },
  {
    id: "matte-both",
    name: "Matte Aqueous Coating - Both Sides",
    price: 0,
    sides: "both",
    type: "matte",
  },
  {
    id: "uv-gloss-front",
    name: "UV Gloss Coating - Front",
    price: 0,
    sides: "front",
    type: "gloss",
  },
  {
    id: "uv-gloss-both",
    name: "UV Gloss Coating - Both Sides",
    price: 0,
    sides: "both",
    type: "gloss",
  },
];

export const BUSINESS_CARD_RAISED = [
  { id: "none", name: "None", price: 0 },
  { id: "uv-front", name: "Raised UV Print Front", price: 30 },
  { id: "uv-both", name: "Raised UV Both Sides", price: 40 },
  { id: "foil-front", name: "Raised Foil Print Front", price: 30 },
  { id: "foil-both", name: "Raised Foil Print Both Sides", price: 40 },
];

export const BUSINESS_CARD_VELVET = [
  { id: "none", name: "None", price: 0 },
  { id: "velvet-front", name: "Velvet Finish - Front", price: 35 },
  { id: "velvet-both", name: "Velvet Finish - Both Sides", price: 50 },
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

// Antelope Valley zip codes for local delivery
export const ANTELOPE_VALLEY_ZIPS = [
  "93510", // Acton
  "93532", // Lake Los Angeles
  "93534", // Lancaster
  "93535", // Lancaster
  "93536", // Lancaster
  "93543", // Littlerock
  "93544", // Llano
  "93550", // Palmdale
  "93551", // Palmdale
  "93552", // Palmdale
  "93553", // Palmdale
  "93591", // Palmdale
  "93590", // Pearblossom
  "93563", // Valyermo
];
