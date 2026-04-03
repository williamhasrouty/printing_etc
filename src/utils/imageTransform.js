/**
 * Utility functions for applying image transformations (crop, position, zoom)
 * before uploading to Cloudinary
 */

import { pdfjs } from "react-pdf";

/**
 * Apply transformations to an image or PDF and return a new File object
 * @param {Object} fileData - File data including the original file and transform params
 * @param {File} fileData.file - The original File object
 * @param {Object} fileData.imagePosition - Position {x, y} in pixels
 * @param {number} fileData.zoomLevel - Zoom level (1 = 100%)
 * @param {number} fileData.pageNumber - PDF page number to render (optional)
 * @param {Object} dimensions - Canvas dimensions for the output
 * @param {number} dimensions.width - Output width in pixels
 * @param {number} dimensions.height - Output height in pixels
 * @param {boolean} applyGrayscale - Apply grayscale filter (for back designs)
 * @returns {Promise<File>} Transformed image as a new File object
 */
export async function applyImageTransform(
  fileData,
  dimensions,
  applyGrayscale = false,
) {
  const {
    file,
    imagePosition = { x: 0, y: 0 },
    zoomLevel = 1,
    pageNumber = 1,
  } = fileData;

  // Default dimensions (business card standard size at 300 DPI)
  const outputWidth = dimensions?.width || 1050; // 3.5" x 300 DPI
  const outputHeight = dimensions?.height || 600; // 2" x 300 DPI

  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");

  // Fill with white background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  try {
    if (file.type === "application/pdf") {
      // Handle PDF files
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNumber || 1);

      // Calculate scale to fit the canvas
      const viewport = page.getViewport({ scale: 1 });
      const scale =
        Math.min(outputWidth / viewport.width, outputHeight / viewport.height) *
        zoomLevel;

      const scaledViewport = page.getViewport({ scale });

      // Center the PDF page with position offset
      const offsetX =
        (outputWidth - scaledViewport.width) / 2 + imagePosition.x;
      const offsetY =
        (outputHeight - scaledViewport.height) / 2 + imagePosition.y;

      // Save context state
      ctx.save();

      // Apply grayscale if needed
      if (applyGrayscale) {
        ctx.filter = "grayscale(100%)";
      }

      // Translate to apply position
      ctx.translate(offsetX, offsetY);

      // Render PDF page to canvas
      await page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      }).promise;

      // Restore context state
      ctx.restore();
    } else {
      // Handle image files (JPEG, PNG, SVG)
      const img = await loadImage(
        fileData.previewUrl || URL.createObjectURL(file),
      );

      // Calculate dimensions with zoom
      const scaledWidth = img.width * zoomLevel;
      const scaledHeight = img.height * zoomLevel;

      // Center the image with position offset
      const offsetX = (outputWidth - scaledWidth) / 2 + imagePosition.x;
      const offsetY = (outputHeight - scaledHeight) / 2 + imagePosition.y;

      // Apply grayscale if needed
      if (applyGrayscale) {
        ctx.filter = "grayscale(100%)";
      }

      // Draw the image with transformations
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Clean up if we created a temporary URL
      if (!fileData.previewUrl) {
        URL.revokeObjectURL(img.src);
      }
    }

    // Convert canvas to Blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.95);
    });

    // Create new File from Blob with original filename (but as JPEG)
    const fileName = file.name.replace(/\.[^.]+$/, ".jpg");
    const transformedFile = new File([blob], fileName, { type: "image/jpeg" });

    return transformedFile;
  } catch (error) {
    console.error("Error applying image transform:", error);
    // Fallback: return original file if transform fails
    return file;
  }
}

/**
 * Load an image from URL
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Check if file has transformations applied
 * @param {Object} fileData - File data object
 * @returns {boolean} True if file has position/zoom different from defaults
 */
export function hasTransformations(fileData) {
  if (!fileData) return false;

  const hasPosition =
    fileData.imagePosition &&
    (fileData.imagePosition.x !== 0 || fileData.imagePosition.y !== 0);

  const hasZoom = fileData.zoomLevel && fileData.zoomLevel !== 1;

  return hasPosition || hasZoom;
}

/**
 * Get standard print dimensions for different product categories
 * @param {string} category - Product category
 * @param {Object} options - Product options (size, orientation, etc.)
 * @returns {Object} {width, height} in pixels at 300 DPI
 */
export function getPrintDimensions(category, options = {}) {
  // Standard dimensions at 300 DPI
  const DPI = 300;

  switch (category) {
    case "business-cards":
      // Standard business card: 3.5" x 2"
      return { width: 3.5 * DPI, height: 2 * DPI };

    case "flyers": {
      // Parse size from options (e.g., "5.5x8.5")
      const size = options.size || "5.5x8.5";
      const [w, h] = size.split("x").map(parseFloat);

      // Adjust for orientation
      if (options.orientation === "landscape") {
        return { width: Math.max(w, h) * DPI, height: Math.min(w, h) * DPI };
      }
      return { width: Math.min(w, h) * DPI, height: Math.max(w, h) * DPI };
    }

    case "brochures":
      // Standard tri-fold brochure: 8.5" x 11"
      return { width: 8.5 * DPI, height: 11 * DPI };

    case "postcards":
      // Standard postcard: 6" x 4"
      return { width: 6 * DPI, height: 4 * DPI };

    case "banners": {
      // Parse size from options
      const size = options.size || "2x4";
      const [w, h] = size.split("x").map(parseFloat);
      // Banners are in feet, use 150 DPI for large format
      return { width: w * 12 * 150, height: h * 12 * 150 };
    }

    default:
      // Default: 8.5" x 11" letter size
      return { width: 8.5 * DPI, height: 11 * DPI };
  }
}
