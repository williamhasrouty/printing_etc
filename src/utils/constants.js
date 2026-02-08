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

// Flyer specific options
export const FLYER_PAPER = [
  { id: "80lb-gloss-book", name: "80 lb. Gloss Book", thickness: "Thin" },
  { id: "100lb-gloss-book", name: "100 lb. Gloss Book", thickness: "Medium" },
  { id: "100lb-gloss-cover", name: "100 lb. Gloss Cover", thickness: "Medium" },
  { id: "14pt-gloss-cover", name: "14 pt. Gloss Cover", thickness: "Thick" },
  { id: "14pt-uncoated-cover", name: "14 pt. Uncoated Cover", thickness: "Thick" },
  { id: "13pt-premium-linen", name: "13 pt. Premium Linen", thickness: "Thick" },
  { id: "18pt-ultra-pearl", name: "18 pt. Ultra Premium Pearl", thickness: "Extra Thick" },
  { id: "18pt-premium-kraft", name: "18 pt. Premium Kraft", thickness: "Extra Thick" },
  { id: "18pt-ultra-smooth", name: "18 pt. Ultra Premium Smooth White", thickness: "Extra Thick" },
  { id: "70lb-opaque", name: "70 lb. Opaque Smooth White", thickness: "Thin" },
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
  { id: "full-front-blank-back", name: "Full Color Front, Blank Back" },
  { id: "full-both", name: "Full Color Both Sides" },
];

export const FLYER_COATING = [
  { id: "none", name: "No Coating" },
  { id: "aqueous", name: "Aqueous Coating (Both Sides)" },
  { id: "uv-front", name: "High Gloss UV Coating Front Only" },
  { id: "uv-both", name: "High Gloss UV Coating Both Sides" },
];

export const FLYER_QUANTITIES = [
  25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 15000, 25000
];

// Flyer pricing structure (base prices for 8.5x11 size)
export const FLYER_PRICING = {
  "80lb-gloss-book": {
    25: 15, 50: 22, 100: 35, 250: 65, 500: 95, 1000: 160, 2500: 325, 5000: 575, 10000: 1050, 15000: 1500, 25000: 2350
  },
  "100lb-gloss-book": {
    25: 18, 50: 26, 100: 42, 250: 78, 500: 115, 1000: 195, 2500: 395, 5000: 695, 10000: 1275, 15000: 1825, 25000: 2850
  },
  "100lb-gloss-cover": {
    25: 20, 50: 30, 100: 48, 250: 90, 500: 135, 1000: 230, 2500: 465, 5000: 820, 10000: 1500, 15000: 2150, 25000: 3350
  },
  "14pt-gloss-cover": {
    25: 24, 50: 36, 100: 58, 250: 110, 500: 165, 1000: 280, 2500: 565, 5000: 995, 10000: 1825, 15000: 2625, 25000: 4100
  },
  "14pt-uncoated-cover": {
    25: 24, 50: 36, 100: 58, 250: 110, 500: 165, 1000: 280, 2500: 565, 5000: 995, 10000: 1825, 15000: 2625, 25000: 4100
  },
  "13pt-premium-linen": {
    25: 28, 50: 42, 100: 68, 250: 130, 500: 195, 1000: 330, 2500: 665, 5000: 1175, 10000: 2150, 15000: 3100, 25000: 4850
  },
  "18pt-ultra-pearl": {
    25: 35, 50: 52, 100: 85, 250: 162, 500: 245, 1000: 415, 2500: 835, 5000: 1475, 10000: 2700, 15000: 3900, 25000: 6100
  },
  "18pt-premium-kraft": {
    25: 32, 50: 48, 100: 78, 250: 148, 500: 225, 1000: 380, 2500: 765, 5000: 1350, 10000: 2475, 15000: 3575, 25000: 5600
  },
  "18pt-ultra-smooth": {
    25: 35, 50: 52, 100: 85, 250: 162, 500: 245, 1000: 415, 2500: 835, 5000: 1475, 10000: 2700, 15000: 3900, 25000: 6100
  },
  "70lb-opaque": {
    25: 14, 50: 20, 100: 32, 250: 60, 500: 88, 1000: 150, 2500: 305, 5000: 540, 10000: 990, 15000: 1420, 25000: 2225
  }
};

// Size multipliers for flyers (relative to 8.5x11)
export const FLYER_SIZE_MULTIPLIERS = {
  "2.5x4": 0.35,
  "3.5x8.5": 0.55,
  "3.75x8.25": 0.55,
  "4x6": 0.45,
  "4x9": 0.60,
  "4.25x5.5": 0.50,
  "4.25x11": 0.75,
  "5x7": 0.65,
  "5.5x8.5": 0.80,
  "6x6": 0.70,
  "6x9": 0.85,
  "8x8": 0.90,
  "8x10": 0.95,
  "8.5x11": 1.00,
  "8.5x14": 1.15,
  "9x12": 1.20,
  "11x17": 1.40,
  "12x12": 1.35
};

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
