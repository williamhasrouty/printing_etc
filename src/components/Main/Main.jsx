import ProductGallery from "../ProductGallery/ProductGallery";
import "./Main.css";

function Main({ products, isLoading }) {
  return (
    <main className="main">
      <section className="main__hero">
        <div className="main__hero-content">
          <h1 className="main__hero-title">Professional Printing Services</h1>
          <p className="main__hero-text">
            High-quality printing for business cards, flyers, brochures, and
            more. Fast turnaround, competitive pricing.
          </p>
        </div>
      </section>

      <section className="main__products">
        <div className="main__container">
          <h2 className="main__section-title">Our Products</h2>
          {isLoading ? (
            <p className="main__loading">Loading products...</p>
          ) : (
            <ProductGallery products={products} />
          )}
        </div>
      </section>
    </main>
  );
}

export default Main;
