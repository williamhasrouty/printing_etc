import { Link } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card__image-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-card__image"
        />
      </div>
      <div className="product-card__content">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">
            Starting at ${product.basePrice.toFixed(2)}
          </span>
          <span className="product-card__link-text">View Details →</span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
