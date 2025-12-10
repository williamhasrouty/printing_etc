import ProductCard from "../ProductCard/ProductCard";
import "./ProductGallery.css";

function ProductGallery({ products }) {
  return (
    <div className="product-gallery">
      {products.length === 0 ? (
        <p className="product-gallery__empty">No products available</p>
      ) : (
        products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))
      )}
    </div>
  );
}

export default ProductGallery;
