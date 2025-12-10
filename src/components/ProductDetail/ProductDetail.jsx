import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CartContext from "../../contexts/CartContext";
import {
  PAPER_TYPES,
  QUANTITIES,
  TURNAROUND_TIMES,
} from "../../utils/constants";
import "./ProductDetail.css";

function ProductDetail({ products }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const product = products.find((p) => p._id === id);

  const [selectedOptions, setSelectedOptions] = useState({
    paperType: PAPER_TYPES[0].id,
    quantity: QUANTITIES[2],
    turnaround: TURNAROUND_TIMES[0].id,
  });

  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else if (file) {
      alert("Please upload a PDF file");
      e.target.value = "";
    }
  };

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
    const turnaround = TURNAROUND_TIMES.find(
      (t) => t.id === selectedOptions.turnaround
    );
    const basePrice = product.basePrice * selectedOptions.quantity;
    return (basePrice * turnaround.multiplier).toFixed(2);
  };

  const handleAddToCart = () => {
    const paperType = PAPER_TYPES.find(
      (p) => p.id === selectedOptions.paperType
    );
    const turnaround = TURNAROUND_TIMES.find(
      (t) => t.id === selectedOptions.turnaround
    );

    addToCart({
      productId: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      options: {
        paperType: paperType.name,
        quantity: selectedOptions.quantity,
        turnaround: turnaround.name,
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
              <div className="product-detail__option">
                <label htmlFor="paperType" className="product-detail__label">
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

              <div className="product-detail__option">
                <label htmlFor="turnaround" className="product-detail__label">
                  Turnaround Time
                </label>
                <select
                  id="turnaround"
                  className="product-detail__select"
                  value={selectedOptions.turnaround}
                  onChange={(e) =>
                    setSelectedOptions({
                      ...selectedOptions,
                      turnaround: e.target.value,
                    })
                  }
                >
                  {TURNAROUND_TIMES.map((time) => (
                    <option key={time.id} value={time.id}>
                      {time.name}
                    </option>
                  ))}
                </select>
              </div>

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
            </div>

            <div className="product-detail__price-section">
              <div className="product-detail__price">
                <span className="product-detail__price-label">
                  Total Price:
                </span>
                <span className="product-detail__price-value">
                  ${calculatePrice()}
                </span>
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
    </main>
  );
}

export default ProductDetail;
