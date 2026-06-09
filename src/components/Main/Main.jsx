import { Link } from "react-router-dom";
import ProductGallery from "../ProductGallery/ProductGallery";
import "./Main.css";

function Main({ products, isLoading }) {
  const customerWorkModules = import.meta.glob(
    "../../assets/images/customer-work/*.{jpg,jpeg,png,webp}",
    { eager: true, import: "default" },
  );

  const images = Object.entries(customerWorkModules)
    .sort(([pathA], [pathB]) => {
      const fileA = pathA.split("/").pop() || "";
      const fileB = pathB.split("/").pop() || "";
      const numA = parseInt(fileA, 10);
      const numB = parseInt(fileB, 10);

      if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
        return numA - numB;
      }

      return fileA.localeCompare(fileB);
    })
    .map(([, img]) => img);

  return (
    <main className="main">
      <section className="main__hero">
        <div className="main__hero-container">
          <div className="main__hero-content">
            <h1 className="main__hero-title">Professional Printing Services</h1>
            <p className="main__hero-text">
              Quality Printing & Affordable Prices. Serving the Antelope Valley
              since 2008.
            </p>
          </div>
          <div className="main__hero-ticker">
            <p className="main__hero-ticker-text">Our Loyal Customers</p>
            <div className="main__hero-ticker-track">
              {images.map((img, index) => (
                <img
                  key={`first-${index}`}
                  src={img}
                  alt="Customer printed product"
                  className="main__hero-ticker-image"
                />
              ))}
              {images.map((img, index) => (
                <img
                  key={`second-${index}`}
                  src={img}
                  alt="Customer printed product"
                  className="main__hero-ticker-image"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="main__products">
        <div className="main__container">
          <h2 className="main__section-title">Shop Our Products</h2>
          {isLoading ? (
            <p className="main__loading">Loading products...</p>
          ) : (
            <ProductGallery
              products={products.filter(
                (product) =>
                  product.category !== "decals" &&
                  !product.name.toLowerCase().includes("t-shirt") &&
                  !product.name.toLowerCase().includes("invoice"),
              )}
            />
          )}
        </div>
      </section>

      {/* Advertisement Section for Call-to-Order Products */}
      <section className="main__featured">
        <div className="main__container">
          <h2 className="main__section-title">
            Also Available - <span className="main__blink">Call to Order</span>
          </h2>
          <p className="main__featured-subtitle">
            Need a custom quote? We're here to help with these specialty items.
          </p>
          <Link to="/contact" className="main__featured-cta-button">
            <span className="main__featured-cta-icon">📞</span>
            <span className="main__featured-cta-text">
              Contact Us for Quote
            </span>
          </Link>
          <div className="main__featured-grid">
            {products
              .filter(
                (product) =>
                  product.category === "decals" ||
                  product.name.toLowerCase().includes("t-shirt") ||
                  product.name.toLowerCase().includes("invoice"),
              )
              .map((product) => (
                <div key={product._id} className="main__featured-card">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="main__featured-image"
                  />
                  <div className="main__featured-content">
                    <h3 className="main__featured-title">{product.name}</h3>
                    <p className="main__featured-description">
                      {product.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <p className="main__additional-products">
        We offer a wide range of other printing services including:
        <br />
        Copies, Labels, Menus, A-Frames, Yard Signs, Booklets, Letterheads,
        Envelopes, Presentation Folders, etc.
        <br />
        <br />
        Contact us for a custom quote on any printing project!
        <br />
        <strong>We'll match any competitors' prices with proof.</strong>
        <br />
        <br />
        <em>Set up charge may apply to all products.</em>
      </p>
    </main>
  );
}

export default Main;
