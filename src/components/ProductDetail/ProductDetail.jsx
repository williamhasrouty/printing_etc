import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CartContext from "../../contexts/CartContext";
import NotificationModal from "../NotificationModal/NotificationModal";
import FileUpload from "../FileUpload/FileUpload";

// Set up PDF.js worker from public directory
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
import {
  PAPER_TYPES,
  QUANTITIES,
  BUSINESS_CARD_QUANTITIES,
  BUSINESS_CARD_PAPER,
  BUSINESS_CARD_COLORS,
  BUSINESS_CARD_COATING,
  BUSINESS_CARD_RAISED,
  BUSINESS_CARD_VELVET,
  FLYER_PAPER,
  FLYER_SIZES,
  FLYER_COLORS,
  FLYER_COATING,
  ANTELOPE_VALLEY_ZIPS,
} from "../../utils/constants";
import "./ProductDetail.css";

function ProductDetail({ products }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const product = products.find((p) => p._id === id);
  const isBusinessCard = product?.category === "business-cards";
  const isFlyer = product?.category === "flyers";

  const getBusinessCardCoatingOptions = () => {
    const productCoatings = product?.options?.coatings;

    if (Array.isArray(productCoatings) && productCoatings.length > 0) {
      return productCoatings.map((coating, index) => {
        const name = coating?.name || `Coating ${index + 1}`;
        const id =
          coating?.id ||
          `custom-coating-${index}-${name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")}`;

        const inferredSides = name.toLowerCase().includes("both")
          ? "both"
          : "front";

        let inferredType;
        if (name.toLowerCase().includes("matte")) {
          inferredType = "matte";
        } else if (
          name.toLowerCase().includes("gloss") ||
          name.toLowerCase().includes("uv")
        ) {
          inferredType = "gloss";
        }

        return {
          id,
          name,
          price: Number(coating?.price ?? coating?.priceModifier ?? 0) || 0,
          sides: coating?.sides || inferredSides,
          type: coating?.type || inferredType,
        };
      });
    }

    return BUSINESS_CARD_COATING;
  };

  // Returns the quantity list for non-business-card products from product options,
  // falling back to the static QUANTITIES constant.
  const getProductQuantities = () => {
    const saved = getValidNamedOptions(product?.options?.quantities);
    if (saved.length > 0) {
      return saved.map((q) => ({
        value: parseInt(q.name) || q.name,
        label: q.name,
        priceModifier: Number(q.priceModifier) || 0,
      }));
    }
    return QUANTITIES.map((q) => ({
      value: q,
      label: String(q),
      priceModifier: 0,
    }));
  };

  const toSlug = (str) =>
    String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const getValidNamedOptions = (arr) =>
    (arr || []).filter(
      (item) => item && typeof item.name === "string" && item.name.trim(),
    );

  const getFlyerPaperTypes = () => {
    const saved = getValidNamedOptions(product?.options?.paperTypes);
    if (saved.length > 0) {
      return saved.map((p, i) => ({
        id: p.id || toSlug(p.name) || `paper-${i}`,
        name: p.name,
        priceModifier: Number(p.priceModifier) || 0,
      }));
    }
    return FLYER_PAPER;
  };

  const getFlyerSizes = () => {
    const saved = getValidNamedOptions(product?.options?.sizes);
    if (saved.length > 0) {
      return saved.map((s, i) => ({
        id: s.id || toSlug(s.name) || `size-${i}`,
        name: s.name,
        priceModifier: Number(s.priceModifier) || 0,
      }));
    }
    return FLYER_SIZES;
  };

  const getFlyerColors = () => {
    const saved = getValidNamedOptions(product?.options?.colors);
    if (saved.length > 0) {
      return saved.map((c, i) => ({
        id: c.id || toSlug(c.name) || `color-${i}`,
        name: c.name,
        priceModifier: Number(c.priceModifier) || 0,
      }));
    }
    return FLYER_COLORS;
  };

  const getFlyerCoatings = () => {
    const saved = getValidNamedOptions(product?.options?.coatings);
    if (saved.length > 0) {
      return saved.map((c, i) => ({
        id: c.id || toSlug(c.name) || `coating-${i}`,
        name: c.name,
        priceModifier: Number(c.priceModifier) || 0,
      }));
    }

    return FLYER_COATING.map((c) => ({
      id: c.id,
      name: c.name,
      priceModifier: Number(c.priceModifier) || 0,
    }));
  };

  const mapOptionArray = (optionType, fallback = []) => {
    const saved = getValidNamedOptions(product?.options?.[optionType]);
    if (saved.length > 0) {
      return saved.map((item, index) => ({
        id: item.id || toSlug(item.name) || `${optionType}-${index}`,
        name: item.name,
        dimensions: item.dimensions || "",
        priceModifier: Number(item.priceModifier) || 0,
      }));
    }
    return fallback;
  };

  const getProductPaperTypes = () => mapOptionArray("paperTypes", PAPER_TYPES);
  const getProductSizes = () => mapOptionArray("sizes", []);
  const getProductOrientations = () => mapOptionArray("orientations", []);
  const getProductColors = () => mapOptionArray("colors", []);
  const getProductCoatings = () => mapOptionArray("coatings", []);
  const getProductFinishes = () => mapOptionArray("finishes", []);
  const getProductRoundedCorners = () => mapOptionArray("roundedCorners", []);
  const getProductRaisedPrint = () => mapOptionArray("raisedPrint", []);

  // Get initial quantity from first available option for selected paper
  const getInitialQuantity = () => {
    if (isBusinessCard) {
      const firstPaper = BUSINESS_CARD_PAPER[0];
      if (firstPaper.pricing) {
        return parseInt(Object.keys(firstPaper.pricing)[0]);
      }
      return BUSINESS_CARD_QUANTITIES[0];
    }
    // Use first product quantity if available
    const productQtys = getProductQuantities();
    return productQtys[0]?.value ?? QUANTITIES[2];
  };

  const getAvailableCoatingBySelection = (paperTypeId, colorId) => {
    const selectedPaper = BUSINESS_CARD_PAPER.find((p) => p.id === paperTypeId);

    // Uncoated / linen / trifecta: no coating options.
    if (
      selectedPaper?.id.includes("uncoated") ||
      selectedPaper?.id.includes("linen") ||
      selectedPaper?.id.includes("trifecta")
    ) {
      return [];
    }

    const allCoatings = getBusinessCardCoatingOptions();

    let coatingType = null;
    if (selectedPaper?.id.includes("matte")) {
      coatingType = "matte";
    } else if (selectedPaper?.id.includes("gloss")) {
      coatingType = "gloss";
    }

    let filteredByType = allCoatings;
    if (coatingType) {
      filteredByType = allCoatings.filter(
        (c) => !c.type || c.type === coatingType,
      );
    }

    if (colorId === "full-both") {
      return filteredByType;
    }

    return filteredByType.filter((c) => !c.sides || c.sides === "front");
  };

  const [selectedOptions, setSelectedOptions] = useState({
    paperType: isBusinessCard
      ? BUSINESS_CARD_PAPER[0].id
      : isFlyer
        ? getFlyerPaperTypes()[0]?.id || ""
        : getProductPaperTypes()[0]?.id || PAPER_TYPES[0].id,
    quantity: getInitialQuantity(),
    size: isBusinessCard
      ? "2x3.5"
      : isFlyer
        ? getFlyerSizes()[0]?.id || ""
        : getProductSizes()[0]?.id || "",
    orientation: isFlyer
      ? "horizontal"
      : getProductOrientations()[0]?.id || "horizontal",
    color: isBusinessCard
      ? BUSINESS_CARD_COLORS[0].id
      : isFlyer
        ? getFlyerColors()[0]?.id || ""
        : getProductColors()[0]?.id || "",
    roundedCorner: isBusinessCard
      ? "none"
      : getProductRoundedCorners()[0]?.id || "none",
    coating: isBusinessCard
      ? getAvailableCoatingBySelection(
          BUSINESS_CARD_PAPER[0].id,
          BUSINESS_CARD_COLORS[0].id,
        )[0]?.id || ""
      : isFlyer
        ? getFlyerCoatings()[0]?.id || ""
        : getProductCoatings()[0]?.id || "",
    raisedPrint: isBusinessCard
      ? BUSINESS_CARD_RAISED[0].id
      : getProductRaisedPrint()[0]?.id || "",
    velvetFinish: isBusinessCard ? BUSINESS_CARD_VELVET[0].id : "",
    finish: getProductFinishes()[0]?.id || "",
    zipCode: "",
    addressType: "residential",
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedBackFile, setUploadedBackFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [shippingCost, setShippingCost] = useState(null);
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [notification, setNotification] = useState(null);

  // Reset options when product changes or loads
  useEffect(() => {
    if (product) {
      const isBC = product.category === "business-cards";
      const isFly = product.category === "flyers";

      const getQty = () => {
        if (isBC) {
          const firstPaper = BUSINESS_CARD_PAPER[0];
          if (firstPaper.pricing) {
            return parseInt(Object.keys(firstPaper.pricing)[0]);
          }
          return BUSINESS_CARD_QUANTITIES[0];
        }
        const productQtys = getProductQuantities();
        return productQtys[0]?.value ?? QUANTITIES[2];
      };

      setSelectedOptions({
        paperType: isBC
          ? BUSINESS_CARD_PAPER[0].id
          : isFly
            ? getFlyerPaperTypes()[0]?.id || ""
            : getProductPaperTypes()[0]?.id || PAPER_TYPES[0].id,
        quantity: getQty(),
        size: isBC
          ? "2x3.5"
          : isFly
            ? getFlyerSizes()[0]?.id || ""
            : getProductSizes()[0]?.id || "",
        orientation: isFly
          ? "horizontal"
          : getProductOrientations()[0]?.id || "horizontal",
        color: isBC
          ? BUSINESS_CARD_COLORS[0].id
          : isFly
            ? getFlyerColors()[0]?.id || ""
            : getProductColors()[0]?.id || "",
        roundedCorner: isBC
          ? "none"
          : getProductRoundedCorners()[0]?.id || "none",
        coating: isBC
          ? getAvailableCoatingBySelection(
              BUSINESS_CARD_PAPER[0].id,
              BUSINESS_CARD_COLORS[0].id,
            )[0]?.id || ""
          : isFly
            ? getFlyerCoatings()[0]?.id || ""
            : getProductCoatings()[0]?.id || "",
        raisedPrint: isBC
          ? BUSINESS_CARD_RAISED[0].id
          : getProductRaisedPrint()[0]?.id || "",
        velvetFinish: isBC ? BUSINESS_CARD_VELVET[0].id : "",
        finish: getProductFinishes()[0]?.id || "",
        zipCode: "",
        addressType: "residential",
      });
    }
  }, [product]);

  // Clear back file if back side is no longer needed
  useEffect(() => {
    if (!hasBackSide() && uploadedBackFile) {
      handleDeleteBackFile();
    }
  }, [selectedOptions.color]);

  // Get available coating options based on selected color and paper type
  const getAvailableCoating = () => {
    return getAvailableCoatingBySelection(
      selectedOptions.paperType,
      selectedOptions.color,
    );
  };

  const calculateShipping = () => {
    const zip = selectedOptions.zipCode.trim();
    if (!zip) {
      setNotification({ message: "Please enter a zip code", type: "warning" });
      return;
    }

    if (ANTELOPE_VALLEY_ZIPS.includes(zip)) {
      setShippingCost(10);
    } else {
      setShippingCost(0); // Will add other shipping calculation later
    }
    setShippingCalculated(true);
  };

  // Check if back side upload is needed
  const hasBackSide = () => {
    if (isBusinessCard) {
      // Business cards: back needed for full-both and full-front-grayscale
      return (
        selectedOptions.color === "full-both" ||
        selectedOptions.color === "full-front-grayscale"
      );
    } else if (isFlyer) {
      // Flyers: back needed for full-both
      return selectedOptions.color === "full-both";
    }
    return false;
  };

  const handleFileUploaded = (fileData) => {
    setUploadedFile(fileData);
    if (fileData && fileData.fileType === "application/pdf") {
      setPageNumber(1);
    }
  };

  const handleBackFileUploaded = (fileData) => {
    setUploadedBackFile(fileData);
  };

  const handleDeleteFile = () => {
    if (uploadedFile && uploadedFile.previewUrl) {
      URL.revokeObjectURL(uploadedFile.previewUrl);
    }
    setUploadedFile(null);
    setPageNumber(1);
  };

  const handleDeleteBackFile = () => {
    if (uploadedBackFile && uploadedBackFile.previewUrl) {
      URL.revokeObjectURL(uploadedBackFile.previewUrl);
    }
    setUploadedBackFile(null);
  };

  const handleFileError = (errorMessage) => {
    setNotification({
      message: errorMessage,
      type: "error",
    });
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  // Calculate preview dimensions based on product size and orientation
  const getPreviewDimensions = () => {
    let width, height;

    if (isBusinessCard) {
      // Business cards are 2" x 3.5"
      width = 2;
      height = 3.5;
    } else if (isFlyer && selectedOptions.size) {
      // Parse flyer size (e.g., "8.5x11" -> width: 8.5, height: 11)
      const [w, h] = selectedOptions.size.split("x").map(parseFloat);
      width = w;
      height = h;
    } else {
      // Default fallback
      width = 8.5;
      height = 11;
    }

    // Apply orientation
    if (selectedOptions.orientation === "vertical") {
      // For vertical, ensure height > width
      if (width > height) {
        [width, height] = [height, width];
      }
    } else {
      // For horizontal, ensure width > height
      if (height > width) {
        [width, height] = [height, width];
      }
    }

    // Scale to fit in preview - business cards get larger scale for visibility
    const maxSize = isBusinessCard ? 800 : 400;
    const scale = Math.min(
      maxSize / Math.max(width, height),
      isBusinessCard ? 100 : 50,
    );

    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    };
  };

  const previewDimensions = getPreviewDimensions();

  if (!product) {
    return (
      <div className="product-detail">
        <div className="product-detail__container">
          <p className="product-detail__error">Product not found</p>
        </div>
      </div>
    );
  }

  const calculatePrice = () => {
    // First try pricing matrix lookup (new approach)
    if (
      product?.pricing &&
      Array.isArray(product.pricing) &&
      product.pricing.length > 0
    ) {
      // Get the actual option objects to extract their names
      const qtyOption = getProductQuantities().find(
        (q) => String(q.value) === String(selectedOptions.quantity),
      );
      const paperOption = isFlyer
        ? getFlyerPaperTypes().find((p) => p.id === selectedOptions.paperType)
        : getProductPaperTypes().find(
            (p) => p.id === selectedOptions.paperType,
          );
      const sizeOption = isFlyer
        ? getFlyerSizes().find((s) => s.id === selectedOptions.size)
        : getProductSizes().find((s) => s.id === selectedOptions.size);
      const orientationOption = getProductOrientations().find(
        (o) => o.id === selectedOptions.orientation,
      );
      const colorOption = isFlyer
        ? getFlyerColors().find((c) => c.id === selectedOptions.color)
        : getProductColors().find((c) => c.id === selectedOptions.color);
      const coatingOption = isFlyer
        ? getFlyerCoatings().find((c) => c.id === selectedOptions.coating)
        : getProductCoatings().find((c) => c.id === selectedOptions.coating);
      const roundedCornerOption = getProductRoundedCorners().find(
        (r) => r.id === selectedOptions.roundedCorner,
      );
      const raisedPrintOption = getProductRaisedPrint().find(
        (r) => r.id === selectedOptions.raisedPrint,
      );
      const finishOption = getProductFinishes().find(
        (f) => f.id === selectedOptions.finish,
      );

      // Build lookup key using option names
      const lookupKey = {
        quantity: qtyOption?.label || String(selectedOptions.quantity || ""),
        size: sizeOption?.name || selectedOptions.size || "",
        paperType: paperOption?.name || selectedOptions.paperType || "",
        orientation:
          orientationOption?.name || selectedOptions.orientation || "",
        color: colorOption?.name || selectedOptions.color || "",
        coating: coatingOption?.name || selectedOptions.coating || "",
        finish: finishOption?.name || selectedOptions.finish || "",
        roundedCorner:
          roundedCornerOption?.name || selectedOptions.roundedCorner || "",
        raisedPrint:
          raisedPrintOption?.name || selectedOptions.raisedPrint || "",
      };

      // Debug logging
      console.log("=== PRICING MATRIX DEBUG ===");
      console.log(
        "Product pricing entries:",
        JSON.stringify(product.pricing, null, 2),
      );
      console.log("Current lookup key:", JSON.stringify(lookupKey, null, 2));

      // Helper function to normalize strings for comparison
      const normalize = (str) =>
        String(str || "")
          .trim()
          .toLowerCase();

      // Find exact match in pricing array
      const match = product.pricing.find((entry, index) => {
        console.log(
          `\nChecking entry ${index}:`,
          JSON.stringify(entry, null, 2),
        );

        // Match on all fields that are defined in the entry (case-insensitive, trimmed)
        if (
          entry.quantity &&
          normalize(entry.quantity) !== normalize(lookupKey.quantity)
        ) {
          console.log(
            `  ✗ Quantity mismatch: "${entry.quantity}" !== "${lookupKey.quantity}"`,
          );
          return false;
        }
        if (entry.size && normalize(entry.size) !== normalize(lookupKey.size)) {
          console.log(
            `  ✗ Size mismatch: "${entry.size}" !== "${lookupKey.size}"`,
          );
          return false;
        }
        if (
          entry.paperType &&
          normalize(entry.paperType) !== normalize(lookupKey.paperType)
        ) {
          console.log(
            `  ✗ PaperType mismatch: "${entry.paperType}" !== "${lookupKey.paperType}"`,
          );
          return false;
        }
        if (
          entry.orientation &&
          normalize(entry.orientation) !== normalize(lookupKey.orientation)
        ) {
          console.log(
            `  ✗ Orientation mismatch: "${entry.orientation}" !== "${lookupKey.orientation}"`,
          );
          return false;
        }
        if (
          entry.color &&
          normalize(entry.color) !== normalize(lookupKey.color)
        ) {
          console.log(
            `  ✗ Color mismatch: "${entry.color}" !== "${lookupKey.color}"`,
          );
          return false;
        }
        if (
          entry.coating &&
          normalize(entry.coating) !== normalize(lookupKey.coating)
        ) {
          console.log(
            `  ✗ Coating mismatch: "${entry.coating}" !== "${lookupKey.coating}"`,
          );
          return false;
        }
        if (
          entry.finish &&
          normalize(entry.finish) !== normalize(lookupKey.finish)
        ) {
          console.log(
            `  ✗ Finish mismatch: "${entry.finish}" !== "${lookupKey.finish}"`,
          );
          return false;
        }
        if (
          entry.roundedCorner &&
          normalize(entry.roundedCorner) !== normalize(lookupKey.roundedCorner)
        ) {
          console.log(
            `  ✗ RoundedCorner mismatch: "${entry.roundedCorner}" !== "${lookupKey.roundedCorner}"`,
          );
          return false;
        }
        if (
          entry.raisedPrint &&
          normalize(entry.raisedPrint) !== normalize(lookupKey.raisedPrint)
        ) {
          console.log(
            `  ✗ RaisedPrint mismatch: "${entry.raisedPrint}" !== "${lookupKey.raisedPrint}"`,
          );
          return false;
        }
        console.log("  ✓ All checks passed!");
        return true;
      });

      console.log("\nMatch found:", match);
      console.log("=== END DEBUG ===");

      if (match && match.price !== undefined) {
        let price = match.price;

        // Apply 25% markup for Full Color Both Sides on flyers
        if (isFlyer && colorOption?.name?.toLowerCase().includes("both")) {
          price = price * 1.25;
        }

        return price.toFixed(2);
      }
    }

    // Fallback to old additive pricing logic for backward compatibility
    if (isBusinessCard) {
      // Get base price from selected paper type and quantity
      const paperType = BUSINESS_CARD_PAPER.find(
        (p) => p.id === selectedOptions.paperType,
      );

      let price = 0;
      if (paperType && paperType.pricing) {
        const quantityPrice = paperType.pricing[selectedOptions.quantity];
        if (quantityPrice !== undefined) {
          price = quantityPrice;
        } else {
          // Fallback: use first available price if current quantity not found
          const firstAvailablePrice = Object.values(paperType.pricing)[0];
          price = firstAvailablePrice || 0;
        }
      }

      // Add color option cost
      const colorOption = BUSINESS_CARD_COLORS.find(
        (c) => c.id === selectedOptions.color,
      );
      if (colorOption) {
        price += colorOption.price;
      }

      // Add rounded corner cost
      if (selectedOptions.roundedCorner === "rounded") {
        price += 15;
      }

      // Add raised print cost
      const raisedOption = BUSINESS_CARD_RAISED.find(
        (r) => r.id === selectedOptions.raisedPrint,
      );
      if (raisedOption) {
        price += raisedOption.price;
      }

      // Add coating cost
      const coatingOption = getBusinessCardCoatingOptions().find(
        (c) => c.id === selectedOptions.coating,
      );
      if (coatingOption) {
        price += coatingOption.price;
      }

      return price.toFixed(2);
    } else {
      // Use the priceModifier on the selected quantity as the full price.
      // Falls back to basePrice if no quantity option is matched.
      const qtyOption = getProductQuantities().find(
        (q) => String(q.value) === String(selectedOptions.quantity),
      );

      const paperOption = isFlyer
        ? getFlyerPaperTypes().find((p) => p.id === selectedOptions.paperType)
        : getProductPaperTypes().find(
            (p) => p.id === selectedOptions.paperType,
          );
      const sizeOption = isFlyer
        ? getFlyerSizes().find((s) => s.id === selectedOptions.size)
        : getProductSizes().find((s) => s.id === selectedOptions.size);
      const orientationOption = getProductOrientations().find(
        (o) => o.id === selectedOptions.orientation,
      );
      const colorOption = isFlyer
        ? getFlyerColors().find((c) => c.id === selectedOptions.color)
        : getProductColors().find((c) => c.id === selectedOptions.color);
      const coatingOption = isFlyer
        ? getFlyerCoatings().find((c) => c.id === selectedOptions.coating)
        : getProductCoatings().find((c) => c.id === selectedOptions.coating);
      const roundedCornerOption = getProductRoundedCorners().find(
        (r) => r.id === selectedOptions.roundedCorner,
      );
      const raisedPrintOption = getProductRaisedPrint().find(
        (r) => r.id === selectedOptions.raisedPrint,
      );
      const finishOption = getProductFinishes().find(
        (f) => f.id === selectedOptions.finish,
      );

      const selectedOptionModifiers = [
        paperOption,
        sizeOption,
        orientationOption,
        colorOption,
        coatingOption,
        roundedCornerOption,
        raisedPrintOption,
        finishOption,
      ].reduce((sum, option) => sum + (Number(option?.priceModifier) || 0), 0);

      const baseTierPrice =
        qtyOption && qtyOption.priceModifier > 0
          ? qtyOption.priceModifier
          : product.basePrice;
      let price = baseTierPrice + selectedOptionModifiers;

      // Apply 25% markup for Full Color Both Sides on flyers
      if (isFlyer && colorOption?.name?.toLowerCase().includes("both")) {
        price = price * 1.25;
      }

      return price.toFixed(2);
    }
  };

  const handleAddToCart = () => {
    const paperType = isBusinessCard
      ? BUSINESS_CARD_PAPER.find((p) => p.id === selectedOptions.paperType)
      : isFlyer
        ? getFlyerPaperTypes().find((p) => p.id === selectedOptions.paperType)
        : getProductPaperTypes().find(
            (p) => p.id === selectedOptions.paperType,
          );

    const sizeOption = isFlyer
      ? getFlyerSizes().find((s) => s.id === selectedOptions.size)
      : getProductSizes().find((s) => s.id === selectedOptions.size);

    const colorOption = isBusinessCard
      ? BUSINESS_CARD_COLORS.find((c) => c.id === selectedOptions.color)
      : isFlyer
        ? getFlyerColors().find((c) => c.id === selectedOptions.color)
        : getProductColors().find((c) => c.id === selectedOptions.color);

    const coatingOption = isBusinessCard
      ? getBusinessCardCoatingOptions().find(
          (c) => c.id === selectedOptions.coating,
        )
      : isFlyer
        ? getFlyerCoatings().find((c) => c.id === selectedOptions.coating)
        : getProductCoatings().find((c) => c.id === selectedOptions.coating);

    const raisedPrintOption = isBusinessCard
      ? BUSINESS_CARD_RAISED.find((r) => r.id === selectedOptions.raisedPrint)
      : getProductRaisedPrint().find(
          (r) => r.id === selectedOptions.raisedPrint,
        );

    const roundedCornerOption = getProductRoundedCorners().find(
      (r) => r.id === selectedOptions.roundedCorner,
    );

    const finishOption = getProductFinishes().find(
      (f) => f.id === selectedOptions.finish,
    );

    const velvetFinishOption = isBusinessCard
      ? BUSINESS_CARD_VELVET.find((v) => v.id === selectedOptions.velvetFinish)
      : null;

    addToCart({
      productId: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      category: product.category,
      options: {
        paperType: paperType?.name || "Standard",
        quantity: selectedOptions.quantity,
        size: sizeOption?.name || selectedOptions.size || "",
        orientation: selectedOptions.orientation || "",
        color: colorOption?.name || "",
        roundedCorner:
          roundedCornerOption?.name || selectedOptions.roundedCorner || "none",
        coating: coatingOption?.name || "",
        raisedPrint: raisedPrintOption?.name || "",
        velvetFinish: velvetFinishOption?.name || "",
        finish: finishOption?.name || "",
        zipCode: selectedOptions.zipCode || "",
        addressType: selectedOptions.addressType || "",
      },
      uploadedFile: uploadedFile
        ? {
            file: uploadedFile.file, // Store the File object
            base64: uploadedFile.base64, // Store base64 for fallback
            previewUrl: uploadedFile.previewUrl, // blob URL for preview
            fileName: uploadedFile.fileName,
            fileSize: uploadedFile.fileSize,
            fileType: uploadedFile.fileType,
            resourceType: uploadedFile.resourceType,
            pageNumber:
              uploadedFile.fileType === "application/pdf"
                ? pageNumber
                : undefined,
          }
        : null,
      uploadedBackFile: uploadedBackFile
        ? {
            file: uploadedBackFile.file,
            base64: uploadedBackFile.base64,
            previewUrl: uploadedBackFile.previewUrl,
            fileName: uploadedBackFile.fileName,
            fileSize: uploadedBackFile.fileSize,
            fileType: uploadedBackFile.fileType,
            resourceType: uploadedBackFile.resourceType,
            applyGrayscale: selectedOptions.color === "full-front-grayscale",
          }
        : null,
      shippingCost: shippingCost || 0,
      quantity: 1,
      price: parseFloat(calculatePrice()),
    });

    navigate("/cart");
  };

  return (
    <main className="product-detail">
      <div className="product-detail__container">
        <button
          onClick={() => navigate("/")}
          className="product-detail__back"
          type="button"
        >
          ← Back to Products
        </button>

        <div className="product-detail__content">
          <div className="product-detail__image-section">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-detail__image"
            />
          </div>

          <div className="product-detail__info-section">
            <h1 className="product-detail__title">{product.name}</h1>
            <p className="product-detail__description">{product.description}</p>

            <div className="product-detail__options">
              {isBusinessCard ? (
                <>
                  <div className="product-detail__option">
                    <label htmlFor="quantity" className="product-detail__label">
                      Quantity
                    </label>
                    <select
                      id="quantity"
                      className="product-detail__select"
                      value={selectedOptions.quantity}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          quantity: parseInt(e.target.value),
                        })
                      }
                    >
                      {(() => {
                        const paperType = BUSINESS_CARD_PAPER.find(
                          (p) => p.id === selectedOptions.paperType,
                        );
                        const availableQtys =
                          paperType && paperType.pricing
                            ? Object.keys(paperType.pricing).map(Number)
                            : BUSINESS_CARD_QUANTITIES;
                        return availableQtys.map((qty) => (
                          <option key={qty} value={qty}>
                            {qty.toLocaleString()}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <div className="product-detail__option">
                    <label className="product-detail__label">Size</label>
                    <input
                      type="text"
                      className="product-detail__select"
                      value='2" x 3.5" U.S. Standard'
                      disabled
                      style={{ backgroundColor: "#f5f5f5" }}
                    />
                  </div>

                  <div className="product-detail__option">
                    <label className="product-detail__label">Orientation</label>
                    <div className="product-detail__radio-group">
                      <label className="product-detail__radio-label">
                        <input
                          type="radio"
                          name="orientation"
                          value="horizontal"
                          checked={selectedOptions.orientation === "horizontal"}
                          onChange={(e) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              orientation: e.target.value,
                            })
                          }
                        />
                        Horizontal
                      </label>
                      <label className="product-detail__radio-label">
                        <input
                          type="radio"
                          name="orientation"
                          value="vertical"
                          checked={selectedOptions.orientation === "vertical"}
                          onChange={(e) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              orientation: e.target.value,
                            })
                          }
                        />
                        Vertical
                      </label>
                    </div>
                  </div>

                  <div className="product-detail__option">
                    <label htmlFor="paper" className="product-detail__label">
                      Paper
                    </label>
                    <select
                      id="paper"
                      className="product-detail__select"
                      value={selectedOptions.paperType}
                      onChange={(e) => {
                        const newPaperType = e.target.value;
                        const newPaper = BUSINESS_CARD_PAPER.find(
                          (p) => p.id === newPaperType,
                        );
                        // Get available quantities for new paper type
                        const availableQtys =
                          newPaper && newPaper.pricing
                            ? Object.keys(newPaper.pricing).map(Number)
                            : BUSINESS_CARD_QUANTITIES;
                        // If current quantity is not available, reset to first available
                        const newQuantity = availableQtys.includes(
                          selectedOptions.quantity,
                        )
                          ? selectedOptions.quantity
                          : availableQtys[0];

                        // Determine coating type based on new paper
                        const availableCoatings =
                          getAvailableCoatingBySelection(
                            newPaperType,
                            selectedOptions.color,
                          );

                        setSelectedOptions({
                          ...selectedOptions,
                          paperType: newPaperType,
                          quantity: newQuantity,
                          coating: availableCoatings[0]?.id || "",
                        });
                      }}
                    >
                      {BUSINESS_CARD_PAPER.map((paper) => (
                        <option key={paper.id} value={paper.id}>
                          {paper.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="product-detail__option">
                    <label htmlFor="color" className="product-detail__label">
                      Color
                    </label>
                    <select
                      id="color"
                      className="product-detail__select"
                      value={selectedOptions.color}
                      onChange={(e) => {
                        const availableCoatings =
                          getAvailableCoatingBySelection(
                            selectedOptions.paperType,
                            e.target.value,
                          );

                        setSelectedOptions({
                          ...selectedOptions,
                          color: e.target.value,
                          coating: availableCoatings[0]?.id || "",
                        });
                      }}
                    >
                      {BUSINESS_CARD_COLORS.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="product-detail__option">
                    <label
                      htmlFor="roundedCorner"
                      className="product-detail__label"
                    >
                      Rounded Corner
                    </label>
                    <select
                      id="roundedCorner"
                      className="product-detail__select"
                      value={selectedOptions.roundedCorner}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          roundedCorner: e.target.value,
                        })
                      }
                    >
                      <option value="none">None</option>
                      <option value="rounded">Rounded Corner (+$15)</option>
                    </select>
                  </div>

                  {getAvailableCoating().length > 0 && (
                    <div className="product-detail__option">
                      <label
                        htmlFor="coating"
                        className="product-detail__label"
                      >
                        Coating
                      </label>
                      <select
                        id="coating"
                        className="product-detail__select"
                        value={selectedOptions.coating}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            coating: e.target.value,
                          })
                        }
                      >
                        {getAvailableCoating().map((coating) => (
                          <option key={coating.id} value={coating.id}>
                            {coating.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!selectedOptions.paperType.includes("trifecta") && (
                    <div className="product-detail__option">
                      <label htmlFor="raised" className="product-detail__label">
                        Raised Print
                      </label>
                      <select
                        id="raised"
                        className="product-detail__select"
                        value={selectedOptions.raisedPrint}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            raisedPrint: e.target.value,
                          })
                        }
                      >
                        {BUSINESS_CARD_RAISED.map((raised) => (
                          <option key={raised.id} value={raised.id}>
                            {raised.name}
                            {raised.price > 0 ? ` (+$${raised.price})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedOptions.paperType.includes("trifecta") && (
                    <div className="product-detail__option">
                      <label className="product-detail__label">
                        Velvet Finish
                      </label>
                      <input
                        type="text"
                        className="product-detail__select"
                        value="Included"
                        disabled
                        style={{ backgroundColor: "#f5f5f5" }}
                      />
                    </div>
                  )}
                </>
              ) : isFlyer ? (
                <>
                  <div className="product-detail__option">
                    <label htmlFor="quantity" className="product-detail__label">
                      Quantity
                    </label>
                    <select
                      id="quantity"
                      className="product-detail__select"
                      value={selectedOptions.quantity}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          quantity: parseInt(e.target.value) || e.target.value,
                        })
                      }
                    >
                      {getProductQuantities().map((qty) => (
                        <option key={qty.value} value={qty.value}>
                          {qty.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="product-detail__option">
                    <label htmlFor="size" className="product-detail__label">
                      Size
                    </label>
                    <select
                      id="size"
                      className="product-detail__select"
                      value={selectedOptions.size}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          size: e.target.value,
                        })
                      }
                    >
                      {getFlyerSizes().map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="product-detail__option">
                    <label className="product-detail__label">Orientation</label>
                    <div className="product-detail__radio-group">
                      <label className="product-detail__radio-label">
                        <input
                          type="radio"
                          name="orientation"
                          value="horizontal"
                          checked={selectedOptions.orientation === "horizontal"}
                          onChange={(e) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              orientation: e.target.value,
                            })
                          }
                        />
                        Horizontal
                      </label>
                      <label className="product-detail__radio-label">
                        <input
                          type="radio"
                          name="orientation"
                          value="vertical"
                          checked={selectedOptions.orientation === "vertical"}
                          onChange={(e) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              orientation: e.target.value,
                            })
                          }
                        />
                        Vertical
                      </label>
                    </div>
                  </div>

                  <div className="product-detail__option">
                    <label
                      htmlFor="paperType"
                      className="product-detail__label"
                    >
                      Paper
                    </label>
                    <select
                      id="paperType"
                      className="product-detail__select"
                      value={selectedOptions.paperType}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          paperType: e.target.value,
                        })
                      }
                    >
                      {getFlyerPaperTypes().map((paper) => (
                        <option key={paper.id} value={paper.id}>
                          {paper.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="product-detail__option">
                    <label htmlFor="color" className="product-detail__label">
                      Color Options
                    </label>
                    <select
                      id="color"
                      className="product-detail__select"
                      value={selectedOptions.color}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          color: e.target.value,
                        })
                      }
                    >
                      {getFlyerColors().map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {getProductRoundedCorners().length > 0 && (
                    <div className="product-detail__option">
                      <label
                        htmlFor="roundedCorner"
                        className="product-detail__label"
                      >
                        Rounded Corners
                      </label>
                      <select
                        id="roundedCorner"
                        className="product-detail__select"
                        value={selectedOptions.roundedCorner}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            roundedCorner: e.target.value,
                          })
                        }
                      >
                        {getProductRoundedCorners().map((corner) => (
                          <option key={corner.id} value={corner.id}>
                            {corner.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {getFlyerCoatings().length > 0 && (
                    <div className="product-detail__option">
                      <label
                        htmlFor="coating"
                        className="product-detail__label"
                      >
                        Coating
                      </label>
                      <select
                        id="coating"
                        className="product-detail__select"
                        value={selectedOptions.coating}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            coating: e.target.value,
                          })
                        }
                      >
                        {getFlyerCoatings().map((coating) => (
                          <option key={coating.id} value={coating.id}>
                            {coating.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {getProductRaisedPrint().length > 0 && (
                    <div className="product-detail__option">
                      <label
                        htmlFor="raisedPrint"
                        className="product-detail__label"
                      >
                        Raised Print
                      </label>
                      <select
                        id="raisedPrint"
                        className="product-detail__select"
                        value={selectedOptions.raisedPrint}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            raisedPrint: e.target.value,
                          })
                        }
                      >
                        {getProductRaisedPrint().map((raised) => (
                          <option key={raised.id} value={raised.id}>
                            {raised.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="product-detail__option">
                    <label htmlFor="quantity" className="product-detail__label">
                      Quantity
                    </label>
                    <select
                      id="quantity"
                      className="product-detail__select"
                      value={selectedOptions.quantity}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          quantity: parseInt(e.target.value) || e.target.value,
                        })
                      }
                    >
                      {getProductQuantities().map((qty) => (
                        <option key={qty.value} value={qty.value}>
                          {qty.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {getProductSizes().length > 0 && (
                    <div className="product-detail__option">
                      <label htmlFor="size" className="product-detail__label">
                        Size
                      </label>
                      <select
                        id="size"
                        className="product-detail__select"
                        value={selectedOptions.size}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            size: e.target.value,
                          })
                        }
                      >
                        {getProductSizes().map((size) => (
                          <option key={size.id} value={size.id}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {getProductOrientations().length > 0 && (
                    <div className="product-detail__option">
                      <label
                        htmlFor="orientation"
                        className="product-detail__label"
                      >
                        Orientation
                      </label>
                      <select
                        id="orientation"
                        className="product-detail__select"
                        value={selectedOptions.orientation}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            orientation: e.target.value,
                          })
                        }
                      >
                        {getProductOrientations().map((orientation) => (
                          <option key={orientation.id} value={orientation.id}>
                            {orientation.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="product-detail__option">
                    <label
                      htmlFor="paperType"
                      className="product-detail__label"
                    >
                      Paper Type
                    </label>
                    <select
                      id="paperType"
                      className="product-detail__select"
                      value={selectedOptions.paperType}
                      onChange={(e) =>
                        setSelectedOptions({
                          ...selectedOptions,
                          paperType: e.target.value,
                        })
                      }
                    >
                      {getProductPaperTypes().map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {getProductColors().length > 0 && (
                    <div className="product-detail__option">
                      <label htmlFor="color" className="product-detail__label">
                        Color Options
                      </label>
                      <select
                        id="color"
                        className="product-detail__select"
                        value={selectedOptions.color}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            color: e.target.value,
                          })
                        }
                      >
                        {getProductColors().map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {getProductRoundedCorners().length > 0 && (
                    <div className="product-detail__option">
                      <label
                        htmlFor="roundedCorner"
                        className="product-detail__label"
                      >
                        Rounded Corners
                      </label>
                      <select
                        id="roundedCorner"
                        className="product-detail__select"
                        value={selectedOptions.roundedCorner}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            roundedCorner: e.target.value,
                          })
                        }
                      >
                        {getProductRoundedCorners().map((corner) => (
                          <option key={corner.id} value={corner.id}>
                            {corner.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {getProductCoatings().length > 0 && (
                    <div className="product-detail__option">
                      <label
                        htmlFor="coating"
                        className="product-detail__label"
                      >
                        Coating
                      </label>
                      <select
                        id="coating"
                        className="product-detail__select"
                        value={selectedOptions.coating}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            coating: e.target.value,
                          })
                        }
                      >
                        {getProductCoatings().map((coating) => (
                          <option key={coating.id} value={coating.id}>
                            {coating.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {getProductRaisedPrint().length > 0 && (
                    <div className="product-detail__option">
                      <label
                        htmlFor="raisedPrint"
                        className="product-detail__label"
                      >
                        Raised Print
                      </label>
                      <select
                        id="raisedPrint"
                        className="product-detail__select"
                        value={selectedOptions.raisedPrint}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            raisedPrint: e.target.value,
                          })
                        }
                      >
                        {getProductRaisedPrint().map((raised) => (
                          <option key={raised.id} value={raised.id}>
                            {raised.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {getProductFinishes().length > 0 && (
                    <div className="product-detail__option">
                      <label htmlFor="finish" className="product-detail__label">
                        Finish
                      </label>
                      <select
                        id="finish"
                        className="product-detail__select"
                        value={selectedOptions.finish}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            finish: e.target.value,
                          })
                        }
                      >
                        {getProductFinishes().map((finish) => (
                          <option key={finish.id} value={finish.id}>
                            {finish.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="product-detail__option">
                <label className="product-detail__label">
                  Upload Front Design (PDF, JPG, PNG, SVG)
                </label>
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  onError={handleFileError}
                  currentFile={uploadedFile}
                />
              </div>

              {uploadedFile && uploadedFile.previewUrl && (
                <div className="product-detail__pdf-preview">
                  <div className="product-detail__preview-header">
                    <h3 className="product-detail__preview-title">
                      {hasBackSide() ? "Front Preview" : "Preview"}
                    </h3>
                    <div className="product-detail__preview-actions">
                      <button
                        type="button"
                        className="product-detail__delete-button"
                        onClick={handleDeleteFile}
                        title="Delete uploaded file"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                  <div className="product-detail__pdf-container">
                    <div className="product-detail__preview-wrapper">
                      <div
                        className="product-detail__content-area"
                        style={{
                          width: `${previewDimensions.width}px`,
                          height: `${previewDimensions.height}px`,
                        }}
                      >
                        <div className="product-detail__static-content">
                          {uploadedFile.fileType === "application/pdf" ? (
                            <Document
                              file={uploadedFile.previewUrl}
                              onLoadSuccess={onDocumentLoadSuccess}
                              loading={
                                <div className="product-detail__pdf-loading">
                                  Loading PDF...
                                </div>
                              }
                              error={
                                <div className="product-detail__pdf-error">
                                  Failed to load PDF
                                </div>
                              }
                            >
                              <Page
                                pageNumber={pageNumber}
                                height={previewDimensions.height}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                              />
                            </Document>
                          ) : (
                            <img
                              src={uploadedFile.previewUrl}
                              alt="Uploaded design preview"
                              className="product-detail__image-preview"
                            />
                          )}
                        </div>
                      </div>
                      <div className="product-detail__guide-overlay">
                        <div className="product-detail__bleed-line"></div>
                        <div className="product-detail__cut-line"></div>
                      </div>
                    </div>
                  </div>
                  <div className="product-detail__guide-legend">
                    <div className="product-detail__guide-item">
                      <span className="product-detail__guide-indicator product-detail__guide-indicator_bleed"></span>
                      <span className="product-detail__guide-text">
                        Bleed line (1/16")
                      </span>
                    </div>
                    <div className="product-detail__guide-item">
                      <span className="product-detail__guide-indicator product-detail__guide-indicator_cut"></span>
                      <span className="product-detail__guide-text">
                        Cut line (trim)
                      </span>
                    </div>
                  </div>
                  {uploadedFile.fileType === "application/pdf" &&
                    numPages &&
                    numPages > 1 && (
                      <div className="product-detail__pdf-controls">
                        <button
                          onClick={goToPrevPage}
                          disabled={pageNumber <= 1}
                          className="product-detail__pdf-button"
                          type="button"
                        >
                          ← Previous
                        </button>
                        <span className="product-detail__pdf-page-info">
                          Page {pageNumber} of {numPages}
                        </span>
                        <button
                          onClick={goToNextPage}
                          disabled={pageNumber >= numPages}
                          className="product-detail__pdf-button"
                          type="button"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                </div>
              )}

              {hasBackSide() && (
                <div className="product-detail__option">
                  <label className="product-detail__label">
                    Upload Back Design (PDF, JPG, PNG, SVG)
                  </label>
                  <FileUpload
                    onFileUploaded={handleBackFileUploaded}
                    onError={handleFileError}
                    currentFile={uploadedBackFile}
                  />
                </div>
              )}

              {hasBackSide() &&
                uploadedBackFile &&
                uploadedBackFile.previewUrl && (
                  <div className="product-detail__pdf-preview">
                    <div className="product-detail__preview-header">
                      <h3 className="product-detail__preview-title">
                        Back Preview
                      </h3>
                      <div className="product-detail__preview-actions">
                        <button
                          type="button"
                          className="product-detail__delete-button"
                          onClick={handleDeleteBackFile}
                          title="Delete uploaded file"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                    <div className="product-detail__pdf-container">
                      <div className="product-detail__preview-wrapper">
                        <div
                          className="product-detail__content-area"
                          style={{
                            width: `${previewDimensions.width}px`,
                            height: `${previewDimensions.height}px`,
                          }}
                        >
                          <div
                            className="product-detail__static-content"
                            style={{
                              filter:
                                selectedOptions.color === "full-front-grayscale"
                                  ? "grayscale(100%)"
                                  : "none",
                            }}
                          >
                            {uploadedBackFile.fileType === "application/pdf" ? (
                              <Document
                                file={uploadedBackFile.previewUrl}
                                loading={
                                  <div className="product-detail__pdf-loading">
                                    Loading PDF...
                                  </div>
                                }
                                error={
                                  <div className="product-detail__pdf-error">
                                    Failed to load PDF
                                  </div>
                                }
                              >
                                <Page
                                  pageNumber={1}
                                  height={previewDimensions.height}
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                />
                              </Document>
                            ) : (
                              <img
                                src={uploadedBackFile.previewUrl}
                                alt="Uploaded back design preview"
                                className="product-detail__image-preview"
                              />
                            )}
                          </div>
                        </div>
                        <div className="product-detail__guide-overlay">
                          <div className="product-detail__bleed-line"></div>
                          <div className="product-detail__cut-line"></div>
                        </div>
                      </div>
                    </div>
                    <div className="product-detail__guide-legend">
                      <div className="product-detail__guide-item">
                        <span className="product-detail__guide-indicator product-detail__guide-indicator_bleed"></span>
                        <span className="product-detail__guide-text">
                          Bleed line (1/16")
                        </span>
                      </div>
                      <div className="product-detail__guide-item">
                        <span className="product-detail__guide-indicator product-detail__guide-indicator_cut"></span>
                        <span className="product-detail__guide-text">
                          Cut line (trim)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="product-detail__price-section">
              <div className="product-detail__price">
                <span className="product-detail__price-label">Subtotal:</span>
                <span className="product-detail__price-value">
                  ${calculatePrice()}
                </span>
              </div>
              {shippingCalculated && shippingCost !== null && (
                <div className="product-detail__price">
                  <span className="product-detail__price-label">Shipping:</span>
                  <span className="product-detail__price-value">
                    ${shippingCost === 0 ? "TBD" : shippingCost.toFixed(2)}
                  </span>
                </div>
              )}
              {shippingCalculated && shippingCost > 0 && (
                <div
                  className="product-detail__price"
                  style={{
                    borderTop: "2px solid #00b4d8",
                    paddingTop: "10px",
                    marginTop: "10px",
                  }}
                >
                  <span
                    className="product-detail__price-label"
                    style={{ fontWeight: "600", fontSize: "18px" }}
                  >
                    Total:
                  </span>
                  <span
                    className="product-detail__price-value"
                    style={{ fontWeight: "600", fontSize: "18px" }}
                  >
                    ${(parseFloat(calculatePrice()) + shippingCost).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="product-detail__turnaround">
                <h4 className="product-detail__turnaround-title">
                  Turnaround Times
                </h4>
                <ul className="product-detail__turnaround-list">
                  <li>Standard Orders: 5-7 business days</li>
                  <li>Custom Orders: 7-10 business days</li>
                  <li>Rush Orders: Please call (661) 272-2869</li>
                </ul>
              </div>

              <button
                onClick={handleAddToCart}
                className="product-detail__add-button"
                type="button"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </main>
  );
}

export default ProductDetail;
