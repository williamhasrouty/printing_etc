import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CartContext from "../../contexts/CartContext";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import NotificationModal from "../NotificationModal/NotificationModal";
import FileUpload from "../FileUpload/FileUpload";

// Set up PDF.js worker from public directory
pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`;
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
  const location = useLocation();
  const { addToCart, updateCartItem } = useContext(CartContext);
  const { currentUser } = useContext(CurrentUserContext);

  // Check if we're editing an existing cart item
  const editingCartItem = location.state?.editingCartItem || null;
  const isEditMode = !!editingCartItem;

  const product = products.find((p) => p._id === id);
  const isBusinessCard = product?.category === "business-cards";
  const isFlyer = product?.category === "flyers";
  const isPostcard = product?.category === "postcards";

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

    return [];
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
    return [];
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
    return [];
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
    return [];
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

    return [];
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

  const getProductPaperTypes = () => mapOptionArray("paperTypes", []);
  const getProductSizes = () => mapOptionArray("sizes", []);
  const getProductOrientations = () => mapOptionArray("orientations", []);
  const getProductColors = () => mapOptionArray("colors", []);
  const getProductCoatings = () => mapOptionArray("coatings", []);
  const getProductFinishes = () => mapOptionArray("finishes", []);
  const getProductRoundedCorners = () => mapOptionArray("roundedCorners", []);
  const getProductRaisedPrint = () => mapOptionArray("raisedPrint", []);

  // Get custom option categories (e.g., Materials for banners)
  const getCustomOptions = () => {
    return product?.options?.customOptions || {};
  };

  const getCustomOptionValues = (categoryKey) => {
    const customOpts = getCustomOptions();
    const category = customOpts[categoryKey];
    if (!category || !category.options || category.options.length === 0) {
      return [];
    }
    return category.options.map((item, index) => ({
      id: item.id || toSlug(item.name) || `${categoryKey}-${index}`,
      name: item.name,
      priceModifier: Number(item.priceModifier) || 0,
    }));
  };

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
    customOptions: {}, // Initialize empty, will be populated in useEffect
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedBackFile, setUploadedBackFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [shippingCost, setShippingCost] = useState(null);
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sizeDistribution, setSizeDistribution] = useState({}); // { "small": 2, "medium": 3, ... }
  const [activeInfoTab, setActiveInfoTab] = useState("turnaround"); // 'turnaround' or 'file-prep'

  // Check if product needs size distribution (has multiple sizes and is apparel/shirts)
  const needsSizeDistribution = () => {
    const sizes = getProductSizes();
    return (
      sizes.length > 1 &&
      (product?.name?.toLowerCase().includes("shirt") ||
        product?.name?.toLowerCase().includes("tshirt") ||
        product?.name?.toLowerCase().includes("t-shirt") ||
        product?.name?.toLowerCase().includes("apparel") ||
        product?.category === "tshirts")
    );
  };

  // Calculate total of size distribution
  const getTotalDistributed = () => {
    return Object.values(sizeDistribution).reduce(
      (sum, qty) => sum + (parseInt(qty) || 0),
      0,
    );
  };

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

      // Initialize custom options with first value from each category
      const initialCustomOptions = {};
      const customOpts = product?.options?.customOptions || {};
      Object.keys(customOpts).forEach((categoryKey) => {
        const categoryData = customOpts[categoryKey];
        if (
          categoryData &&
          categoryData.options &&
          categoryData.options.length > 0
        ) {
          const firstOption = categoryData.options[0];
          initialCustomOptions[categoryKey] =
            firstOption.id || toSlug(firstOption.name) || firstOption.name;
        }
      });

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
        customOptions: initialCustomOptions,
      });
    }
  }, [product]);

  // Clear back file if back side is no longer needed
  useEffect(() => {
    if (!hasBackSide() && uploadedBackFile) {
      handleDeleteBackFile();
    }
  }, [selectedOptions.color]);

  // Initialize size distribution when product changes or quantity changes
  useEffect(() => {
    if (product && needsSizeDistribution()) {
      // Initialize all sizes to 0
      const initialDistribution = {};
      getProductSizes().forEach((size) => {
        initialDistribution[size.id] = 0;
      });
      setSizeDistribution(initialDistribution);
    } else {
      setSizeDistribution({});
    }
  }, [product, selectedOptions.quantity]);

  // Pre-populate form when editing an existing cart item
  useEffect(() => {
    if (editingCartItem && editingCartItem.rawOptions) {
      setSelectedOptions(editingCartItem.rawOptions);
      if (editingCartItem.rawSizeDistribution) {
        setSizeDistribution(editingCartItem.rawSizeDistribution);
      }
      if (editingCartItem.uploadedFile) {
        setUploadedFile(editingCartItem.uploadedFile);
      }
      if (editingCartItem.uploadedBackFile) {
        setUploadedBackFile(editingCartItem.uploadedBackFile);
      }
      if (editingCartItem.shippingCost !== undefined) {
        setShippingCost(editingCartItem.shippingCost);
        setShippingCalculated(editingCartItem.shippingCost > 0);
      }
    }
  }, [editingCartItem]);

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
    if (isBusinessCard || isPostcard) {
      // Business cards & postcards: back needed for full-both and full-front-grayscale
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
    // First check if pricing table is enabled (newest approach - most accurate)
    if (
      product?.pricingTable?.enabled &&
      product.pricingTable.variants?.length > 0
    ) {
      console.log("=== PRICING TABLE DEBUG ===");
      console.log(
        "Product pricing table:",
        JSON.stringify(product.pricingTable, null, 2),
      );

      // Determine which variant to use based on selected paper type or material
      const paperOption = isFlyer
        ? getFlyerPaperTypes().find((p) => p.id === selectedOptions.paperType)
        : getProductPaperTypes().find(
            (p) => p.id === selectedOptions.paperType,
          );

      const paperName = paperOption?.name || selectedOptions.paperType || "";
      const normalize = (str) =>
        String(str || "")
          .trim()
          .toLowerCase();

      console.log("Looking for paper type:", paperName);
      console.log("Selected options:", selectedOptions);

      // Find matching variant by paper type name
      // If no paper types are configured, use the first variant
      let variant;
      if (paperName) {
        variant = product.pricingTable.variants.find(
          (v) =>
            normalize(v.variantName) === normalize(paperName) ||
            normalize(v.variantId) === normalize(paperName),
        );
      } else if (product.pricingTable.variants.length === 1) {
        // If only one variant and no paper type, use it
        variant = product.pricingTable.variants[0];
      }

      console.log("Variant found:", variant?.variantName);

      if (variant) {
        // Handle MongoDB Map format - prices might be an object or Map
        let pricesObj = variant.prices;
        if (pricesObj instanceof Map) {
          pricesObj = Object.fromEntries(pricesObj);
        }

        console.log("Prices object:", pricesObj);

        if (pricesObj && typeof pricesObj === "object") {
          // Get size and quantity from selections
          const sizeOption = isFlyer
            ? getFlyerSizes().find((s) => s.id === selectedOptions.size)
            : getProductSizes().find((s) => s.id === selectedOptions.size);
          const sizeName = sizeOption?.name || selectedOptions.size || "";
          const quantity = selectedOptions.quantity;

          // Normalize size name to match pricing table format
          // Remove quotes, convert " x " to "x", remove spaces
          const normalizedSize = sizeName
            .replace(/"/g, "")
            .replace(/\s*[x×]\s*/gi, "x")
            .replace(/\s+/g, "")
            .toLowerCase();

          // Build lookup key: "size-quantity" (e.g., "4x6-250")
          const priceKey = `${normalizedSize}-${quantity}`;
          const price = pricesObj[priceKey];

          console.log("Size:", sizeName);
          console.log("Normalized size:", normalizedSize);
          console.log("Quantity:", quantity);
          console.log("Price key:", priceKey);
          console.log("Price found:", price);
          console.log("Available keys:", Object.keys(pricesObj));
          console.log("=== END DEBUG ===");

          if (price !== undefined && price > 0) {
            // Apply 25% markup for Full Color Both Sides
            const colorOption = isFlyer
              ? getFlyerColors().find((c) => c.id === selectedOptions.color)
              : getProductColors().find((c) => c.id === selectedOptions.color);

            if (colorOption?.name?.toLowerCase().includes("both")) {
              return (price * 1.25).toFixed(2);
            }
            return price.toFixed(2);
          }
        }
      }

      console.log("No price found in table, falling back to old system");
      console.log("=== END DEBUG ===");
    }

    // Second try pricing matrix lookup (old approach)
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

        // Apply 25% markup for Full Color Both Sides
        if (colorOption?.name?.toLowerCase().includes("both")) {
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

      // Get custom option values and their price modifiers
      const customOptionModifiers = Object.keys(
        selectedOptions.customOptions || {},
      ).reduce((sum, categoryKey) => {
        const selectedId = selectedOptions.customOptions[categoryKey];
        const options = getCustomOptionValues(categoryKey);
        const selectedOption = options.find((opt) => opt.id === selectedId);
        return sum + (Number(selectedOption?.priceModifier) || 0);
      }, 0);

      const selectedOptionModifiers =
        [
          paperOption,
          sizeOption,
          orientationOption,
          colorOption,
          coatingOption,
          roundedCornerOption,
          raisedPrintOption,
          finishOption,
        ].reduce(
          (sum, option) => sum + (Number(option?.priceModifier) || 0),
          0,
        ) + customOptionModifiers;

      const baseTierPrice =
        qtyOption && qtyOption.priceModifier > 0
          ? qtyOption.priceModifier
          : product.basePrice;
      let price = baseTierPrice + selectedOptionModifiers;

      // Apply 25% markup for Full Color Both Sides
      if (colorOption?.name?.toLowerCase().includes("both")) {
        price = price * 1.25;
      }

      return price.toFixed(2);
    }
  };

  const handleAddToCart = () => {
    // Validate size distribution if needed
    if (needsSizeDistribution()) {
      const totalDistributed = getTotalDistributed();
      if (totalDistributed !== selectedOptions.quantity) {
        setNotification({
          message: `Please distribute all ${selectedOptions.quantity} items across sizes. Currently distributed: ${totalDistributed}`,
          type: "error",
        });
        return;
      }

      // Check if at least one size has a quantity
      if (totalDistributed === 0) {
        setNotification({
          message: "Please select at least one size",
          type: "error",
        });
        return;
      }
    }

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

    // Build custom options with human-readable names
    const customOptionsForCart = {};
    Object.keys(selectedOptions.customOptions || {}).forEach((categoryKey) => {
      const categoryData = getCustomOptions()[categoryKey];
      const selectedId = selectedOptions.customOptions[categoryKey];
      const options = getCustomOptionValues(categoryKey);
      const selectedOption = options.find((opt) => opt.id === selectedId);
      if (selectedOption && categoryData) {
        customOptionsForCart[categoryData.label || categoryKey] =
          selectedOption.name;
      }
    });

    // Build size distribution with human-readable names
    const sizeDistributionForCart = {};
    if (needsSizeDistribution()) {
      const sizes = getProductSizes();
      Object.keys(sizeDistribution).forEach((sizeId) => {
        const qty = parseInt(sizeDistribution[sizeId]) || 0;
        if (qty > 0) {
          const sizeOption = sizes.find((s) => s.id === sizeId);
          if (sizeOption) {
            sizeDistributionForCart[sizeOption.name] = qty;
          }
        }
      });
    }

    addToCart({
      productId: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      category: product.category,
      options: {
        paperType: paperType?.name || "Standard",
        quantity: selectedOptions.quantity,
        size: needsSizeDistribution()
          ? "Multiple Sizes"
          : sizeOption?.name || selectedOptions.size || "",
        sizeDistribution:
          Object.keys(sizeDistributionForCart).length > 0
            ? sizeDistributionForCart
            : undefined,
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
        ...customOptionsForCart, // Spread custom options (e.g., "Materials": "Vinyl")
      },
      rawOptions: selectedOptions, // Store raw option IDs for editing
      rawSizeDistribution: sizeDistribution, // Store size distribution for editing
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

    // Show success notification
    setNotification({
      message: isEditMode
        ? "Cart item updated successfully!"
        : "Product added to cart!",
      type: "success",
    });

    // Navigate to cart after short delay
    setTimeout(() => {
      navigate("/cart");
    }, 1500);
  };

  const handleCartAction = () => {
    if (isEditMode) {
      // Update existing cart item
      updateCartItem(editingCartItem.id, {
        productId: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        category: product.category,
        options: buildCartOptions(),
        rawOptions: selectedOptions, // Store raw option IDs for editing
        rawSizeDistribution: sizeDistribution, // Store size distribution for editing
        uploadedFile: buildUploadedFileData(),
        uploadedBackFile: buildUploadedBackFileData(),
        shippingCost: shippingCost || 0,
        quantity: 1,
        price: parseFloat(calculatePrice()),
      });

      setNotification({
        message: "Cart item updated successfully!",
        type: "success",
      });

      setTimeout(() => {
        navigate("/cart");
      }, 1500);
    } else {
      // Add new item to cart
      handleAddToCart();
    }
  };

  // Helper function to build cart options
  const buildCartOptions = () => {
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

    const customOptionsForCart = {};
    Object.keys(selectedOptions.customOptions || {}).forEach((categoryKey) => {
      const categoryData = getCustomOptions()[categoryKey];
      const selectedId = selectedOptions.customOptions[categoryKey];
      const options = getCustomOptionValues(categoryKey);
      const selectedOption = options.find((opt) => opt.id === selectedId);
      if (selectedOption && categoryData) {
        customOptionsForCart[categoryData.label || categoryKey] =
          selectedOption.name;
      }
    });

    const sizeDistributionForCart = {};
    if (needsSizeDistribution()) {
      const sizes = getProductSizes();
      Object.keys(sizeDistribution).forEach((sizeId) => {
        const qty = parseInt(sizeDistribution[sizeId]) || 0;
        if (qty > 0) {
          const sizeOption = sizes.find((s) => s.id === sizeId);
          if (sizeOption) {
            sizeDistributionForCart[sizeOption.name] = qty;
          }
        }
      });
    }

    return {
      paperType: paperType?.name || "Standard",
      quantity: selectedOptions.quantity,
      size: needsSizeDistribution()
        ? "Multiple Sizes"
        : sizeOption?.name || selectedOptions.size || "",
      sizeDistribution:
        Object.keys(sizeDistributionForCart).length > 0
          ? sizeDistributionForCart
          : undefined,
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
      ...customOptionsForCart,
    };
  };

  const buildUploadedFileData = () => {
    if (!uploadedFile) return null;
    return {
      file: uploadedFile.file,
      base64: uploadedFile.base64,
      previewUrl: uploadedFile.previewUrl,
      fileName: uploadedFile.fileName,
      fileSize: uploadedFile.fileSize,
      fileType: uploadedFile.fileType,
      resourceType: uploadedFile.resourceType,
      pageNumber:
        uploadedFile.fileType === "application/pdf" ? pageNumber : undefined,
    };
  };

  const buildUploadedBackFileData = () => {
    if (!uploadedBackFile) return null;
    return {
      file: uploadedBackFile.file,
      base64: uploadedBackFile.base64,
      previewUrl: uploadedBackFile.previewUrl,
      fileName: uploadedBackFile.fileName,
      fileSize: uploadedBackFile.fileSize,
      fileType: uploadedBackFile.fileType,
      resourceType: uploadedBackFile.resourceType,
      applyGrayscale: selectedOptions.color === "full-front-grayscale",
    };
  };

  return (
    <main className="product-detail">
      <div className="product-detail__container">
        <div className="product-detail__header">
          <button
            onClick={() => navigate("/")}
            className="product-detail__back"
            type="button"
          >
            ← Back to Products
          </button>
          {currentUser?.role === "admin" && (
            <button
              onClick={() =>
                navigate("/admin", {
                  state: { tab: "products", editProduct: product },
                })
              }
              className="product-detail__edit"
              type="button"
            >
              ✎ Edit Product
            </button>
          )}
        </div>

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

                  {getFlyerSizes().length > 0 && (
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
                  )}

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

                  {getFlyerPaperTypes().length > 0 && (
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
                  )}

                  {getFlyerColors().length > 0 && (
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

                  {getProductSizes().length > 0 &&
                    (needsSizeDistribution() ? (
                      <div className="product-detail__option">
                        <label className="product-detail__label">
                          Size Distribution (Total: {selectedOptions.quantity})
                        </label>
                        <div className="product-detail__size-distribution">
                          {getProductSizes().map((size) => (
                            <div
                              key={size.id}
                              className="product-detail__size-row"
                            >
                              <label
                                htmlFor={`size-${size.id}`}
                                className="product-detail__size-label"
                              >
                                {size.name}
                              </label>
                              <input
                                id={`size-${size.id}`}
                                type="number"
                                min="0"
                                max={selectedOptions.quantity}
                                className="product-detail__size-input"
                                value={sizeDistribution[size.id] || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setSizeDistribution({
                                    ...sizeDistribution,
                                    [size.id]: Math.max(
                                      0,
                                      Math.min(value, selectedOptions.quantity),
                                    ),
                                  });
                                }}
                              />
                            </div>
                          ))}
                          <div className="product-detail__distribution-summary">
                            <strong>Distributed:</strong>{" "}
                            {getTotalDistributed()} / {selectedOptions.quantity}
                            {getTotalDistributed() !==
                              selectedOptions.quantity && (
                              <span className="product-detail__distribution-warning">
                                ⚠️{" "}
                                {getTotalDistributed() <
                                selectedOptions.quantity
                                  ? `${selectedOptions.quantity - getTotalDistributed()} remaining`
                                  : `${getTotalDistributed() - selectedOptions.quantity} too many`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
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
                    ))}

                  {getProductOrientations().length > 0 && (
                    <div className="product-detail__option">
                      <label className="product-detail__label">
                        Orientation
                      </label>
                      <div className="product-detail__radio-group">
                        {getProductOrientations().map((orientation) => (
                          <label
                            key={orientation.id}
                            className="product-detail__radio-label"
                          >
                            <input
                              type="radio"
                              name="orientation"
                              value={orientation.id}
                              checked={
                                selectedOptions.orientation === orientation.id
                              }
                              onChange={(e) =>
                                setSelectedOptions({
                                  ...selectedOptions,
                                  orientation: e.target.value,
                                })
                              }
                            />
                            {orientation.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {getProductPaperTypes().length > 0 && (
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
                  )}

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

                  {/* Render custom option categories (e.g., Materials for banners) */}
                  {Object.keys(getCustomOptions()).map((categoryKey) => {
                    const categoryData = getCustomOptions()[categoryKey];
                    const categoryLabel = categoryData?.label || categoryKey;
                    const options = getCustomOptionValues(categoryKey);

                    if (options.length === 0) return null;

                    return (
                      <div key={categoryKey} className="product-detail__option">
                        <label
                          htmlFor={categoryKey}
                          className="product-detail__label"
                        >
                          {categoryLabel}
                        </label>
                        <select
                          id={categoryKey}
                          className="product-detail__select"
                          value={
                            selectedOptions.customOptions?.[categoryKey] || ""
                          }
                          onChange={(e) =>
                            setSelectedOptions({
                              ...selectedOptions,
                              customOptions: {
                                ...selectedOptions.customOptions,
                                [categoryKey]: e.target.value,
                              },
                            })
                          }
                        >
                          {options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
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

              <button
                onClick={handleCartAction}
                className="product-detail__add-button"
                type="button"
              >
                {isEditMode ? "Update Cart" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* Info Tabs Section */}
        <div className="product-detail__info-tabs">
          <div className="product-detail__tab-buttons">
            <button
              className={`product-detail__tab-button ${
                activeInfoTab === "turnaround"
                  ? "product-detail__tab-button_active"
                  : ""
              }`}
              onClick={() => setActiveInfoTab("turnaround")}
              type="button"
            >
              Turnaround Times
            </button>
            <button
              className={`product-detail__tab-button ${
                activeInfoTab === "file-prep"
                  ? "product-detail__tab-button_active"
                  : ""
              }`}
              onClick={() => setActiveInfoTab("file-prep")}
              type="button"
            >
              File Preparation
            </button>
          </div>

          <div className="product-detail__tab-content">
            {activeInfoTab === "turnaround" && (
              <div className="product-detail__turnaround">
                <ul className="product-detail__turnaround-list">
                  <li>Standard Orders: 5-7 business days</li>
                  <li>Custom Orders: 7-10 business days</li>
                  <li>Rush Orders: Please call (661) 272-2869</li>
                </ul>
              </div>
            )}

            {activeInfoTab === "file-prep" && (
              <div className="product-detail__file-prep">
                <h4 className="product-detail__file-prep-title">
                  File Preparation Guidelines
                </h4>

                <div className="product-detail__file-prep-section">
                  <p>
                    In order to ensure your files are print-ready, we recommend
                    that you upload them in <strong>PDF format</strong>. When
                    you generate a print-ready PDF, your computer will use the
                    settings in Adobe Acrobat Distiller or any other PDF
                    generating programs you may use. Please make sure that these
                    are set properly before generating your PDF file.
                  </p>

                  <p>
                    If you are uploading PDF files created in Photoshop, please
                    be sure all layers are flattened.
                  </p>

                  <p>
                    We also accept{" "}
                    <strong>.JPG (JPEG), .EPS and .TIF (TIFF)</strong> file
                    types, however PDF is the preferred format.
                  </p>
                  <p>AI files must be outlined or vectorized.</p>
                </div>

                <div className="product-detail__file-prep-section">
                  <h5 className="product-detail__file-prep-subtitle">
                    File Creation Guidelines
                  </h5>
                  <ul className="product-detail__file-prep-list">
                    <li>
                      <strong>Color Mode:</strong> Use the CMYK colorspace
                      (Cyan, Magenta, Yellow, black). These are industry
                      standard printing colors. CMYK colors are different than
                      RGB (Red, Green, Blue), which are used to display colors
                      on your screen.
                    </li>
                    <li>
                      <strong>Resolution:</strong> Use a minimum resolution of
                      150 dpi at 100% size for image files. 300-350 DPI is
                      recommended for best results.
                    </li>
                    <li>
                      <strong>Bleed:</strong> Artwork should have 1/8" (0.125")
                      bleed extending past the trim line. This prevents minor
                      cutting variations from leaving unintended results at the
                      trim edge.
                    </li>
                    <li>
                      <strong>Crop Marks:</strong> Specify trim area with crop
                      marks. Don't place crop marks inside the work area.
                    </li>
                    <li>
                      <strong>Safe Area:</strong> The 1/4" (0.25") area inside
                      the trim line. Do not put critical information or images
                      within the Safe Area to prevent minor cutting variations.
                    </li>
                    <li>
                      <strong>Borders:</strong> If you want printed borders,
                      they must be placed a minimum of 1/8" (0.125") inside the
                      trim line and include bleed.
                    </li>
                  </ul>
                </div>

                <div className="product-detail__file-prep-section">
                  <h5 className="product-detail__file-prep-subtitle">
                    Technical Specifications
                  </h5>
                  <ul className="product-detail__file-prep-list">
                    <li>
                      <strong>Bleed:</strong> 0.1" - 0.125"
                    </li>
                    <li>
                      <strong>Resolution:</strong> 300-350 DPI
                    </li>
                    <li>
                      <strong>Color Mode:</strong> CMYK
                    </li>
                    <li>
                      <strong>File Formats:</strong> PDF (preferred), TIF, TIFF,
                      EPS, AI, PSD, BMP, GIF, JPG, PNG
                    </li>
                    <li>
                      <strong>Max File Upload Size:</strong> 75MB
                    </li>
                  </ul>
                </div>

                <div className="product-detail__file-prep-section">
                  <h5 className="product-detail__file-prep-subtitle">
                    Proofing Options
                  </h5>
                  <ul className="product-detail__file-prep-list">
                    <li>
                      <strong>Instant Online Proof:</strong> An instant proof
                      will be available for you to review and approve. You must
                      check your files for errors, as we will not provide an
                      additional proof.
                    </li>
                    <li>
                      <strong>Manually Processed, PDF Proof:</strong> 24 Hours
                      (Excluding Weekends and Holidays). We will check your
                      files and ensure they have the correct specifications. If
                      we find any problems, we'll contact you, otherwise you'll
                      receive a link to your proof within 1 business day.
                    </li>
                  </ul>
                </div>

                <div className="product-detail__file-prep-note">
                  <p>
                    <strong>Note:</strong> Prices include processing one set of
                    uploaded files and creating a single proof. You can view the
                    status of your order online 24/7 under "My Account." Files
                    not built correctly may delay the order.
                  </p>
                </div>
              </div>
            )}
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
