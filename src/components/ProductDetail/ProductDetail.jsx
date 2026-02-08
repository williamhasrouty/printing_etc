import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import CartContext from "../../contexts/CartContext";
import NotificationModal from "../NotificationModal/NotificationModal";

// Set up PDF.js worker from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
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

  // Get initial quantity from first available option for selected paper
  const getInitialQuantity = () => {
    if (isBusinessCard) {
      const firstPaper = BUSINESS_CARD_PAPER[0];
      if (firstPaper.pricing) {
        return parseInt(Object.keys(firstPaper.pricing)[0]);
      }
      return BUSINESS_CARD_QUANTITIES[0];
    }
    return QUANTITIES[2];
  };

  const [selectedOptions, setSelectedOptions] = useState({
    paperType: isBusinessCard
      ? BUSINESS_CARD_PAPER[0].id
      : isFlyer
        ? FLYER_PAPER[0].id
        : PAPER_TYPES[0].id,
    quantity: getInitialQuantity(),
    size: isBusinessCard ? "2x3.5" : isFlyer ? FLYER_SIZES[0].id : "",
    orientation: "horizontal",
    color: isBusinessCard
      ? BUSINESS_CARD_COLORS[0].id
      : isFlyer
        ? FLYER_COLORS[0].id
        : "",
    roundedCorner: "none",
    coating: isBusinessCard ? BUSINESS_CARD_COATING[0].id : "",
    raisedPrint: isBusinessCard ? BUSINESS_CARD_RAISED[0].id : "",
    velvetFinish: isBusinessCard ? BUSINESS_CARD_VELVET[0].id : "",
    zipCode: "",
    addressType: "residential",
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
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
        return QUANTITIES[2];
      };

      setSelectedOptions({
        paperType: isBC
          ? BUSINESS_CARD_PAPER[0].id
          : isFly
            ? FLYER_PAPER[0].id
            : PAPER_TYPES[0].id,
        quantity: getQty(),
        size: isBC ? "2x3.5" : isFly ? FLYER_SIZES[0].id : "",
        orientation: "horizontal",
        color: isBC
          ? BUSINESS_CARD_COLORS[0].id
          : isFly
            ? FLYER_COLORS[0].id
            : "",
        roundedCorner: "none",
        coating: isBC ? BUSINESS_CARD_COATING[0].id : "",
        raisedPrint: isBC ? BUSINESS_CARD_RAISED[0].id : "",
        velvetFinish: isBC ? BUSINESS_CARD_VELVET[0].id : "",
        zipCode: "",
        addressType: "residential",
      });
    }
  }, [product]);

  // Get available coating options based on selected color and paper type
  const getAvailableCoating = () => {
    const selectedPaper = BUSINESS_CARD_PAPER.find(
      (p) => p.id === selectedOptions.paperType,
    );

    // If uncoated paper, return empty array (no coating options)
    if (
      selectedPaper?.id.includes("uncoated") ||
      selectedPaper?.id.includes("linen") ||
      selectedPaper?.id.includes("trifecta")
    ) {
      return [];
    }

    const selectedColor = BUSINESS_CARD_COLORS.find(
      (c) => c.id === selectedOptions.color,
    );

    // Determine coating type based on paper
    let coatingType = null;
    if (selectedPaper?.id.includes("matte")) {
      coatingType = "matte";
    } else if (selectedPaper?.id.includes("gloss")) {
      coatingType = "gloss";
    }

    // Filter by coating type first
    let availableCoatings = BUSINESS_CARD_COATING;
    if (coatingType) {
      availableCoatings = availableCoatings.filter(
        (c) => c.type === coatingType,
      );
    }

    // Then filter by sides based on color selection
    if (selectedColor?.id === "full-both") {
      return availableCoatings; // Show all coating options for this type
    }

    // Otherwise, only show front coating
    return availableCoatings.filter((c) => c.sides === "front");
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      // Create preview URL for the PDF
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      setPageNumber(1);
    } else if (file) {
      setNotification({ message: "Please upload a PDF file", type: "warning" });
      e.target.value = "";
    }
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

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

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

      return price.toFixed(2);
    } else {
      const basePrice = product.basePrice * selectedOptions.quantity;
      return basePrice.toFixed(2);
    }
  };

  const handleAddToCart = () => {
    const paperType = isBusinessCard
      ? BUSINESS_CARD_PAPER.find((p) => p.id === selectedOptions.paperType)
      : PAPER_TYPES.find((p) => p.id === selectedOptions.paperType);

    addToCart({
      productId: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      options: {
        paperType: paperType?.name || "Standard",
        quantity: selectedOptions.quantity,
      },
      uploadedFile: uploadedFile ? uploadedFile.name : null,
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
                        let coatingType = null;
                        if (newPaperType.includes("matte")) {
                          coatingType = "matte";
                        } else if (newPaperType.includes("gloss")) {
                          coatingType = "gloss";
                        }

                        // Get available coatings for new paper type
                        let availableCoatings = BUSINESS_CARD_COATING;
                        if (coatingType) {
                          availableCoatings = availableCoatings.filter(
                            (c) => c.type === coatingType,
                          );
                        }

                        // Filter by sides if needed
                        if (selectedOptions.color !== "full-both") {
                          availableCoatings = availableCoatings.filter(
                            (c) => c.sides === "front",
                          );
                        }

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
                          e.target.value === "full-both"
                            ? BUSINESS_CARD_COATING
                            : BUSINESS_CARD_COATING.filter(
                                (c) => c.sides === "front",
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
                    <label
                      htmlFor="paperType"
                      className="product-detail__label"
                    >
                      Paper Thickness
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
                      {FLYER_PAPER.map((paper) => (
                        <option key={paper.id} value={paper.id}>
                          {paper.name}
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
                      {FLYER_SIZES.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
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
                      {FLYER_COLORS.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      {QUANTITIES.map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
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
                      {PAPER_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      {QUANTITIES.map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="product-detail__option">
                <label htmlFor="pdfUpload" className="product-detail__label">
                  Upload Design (PDF)
                </label>
                <input
                  type="file"
                  id="pdfUpload"
                  className="product-detail__file-input"
                  accept=".pdf"
                  onChange={handleFileUpload}
                />
                {uploadedFile && (
                  <p className="product-detail__file-name">
                    ✓ {uploadedFile.name}
                  </p>
                )}
              </div>

              {filePreviewUrl && (
                <div className="product-detail__pdf-preview">
                  <h3 className="product-detail__preview-title">Preview</h3>
                  <div className="product-detail__pdf-container">
                    <Document
                      file={filePreviewUrl}
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
                        width={400}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>
                  {numPages && numPages > 1 && (
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
