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
              Quality Printing & Affordable Prices. <br></br>
              Serving the Antelope Valley since 2008.
            </p>
          </div>
          <div className="main__hero-ticker">
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
            <ProductGallery products={products} />
          )}
          <p className="main__additional-products">
            We also offer a wide range of other printing services including:
            <br />
            Copies, Labels, Invoices, Brochures, Menus, A-Frames, Yard Signs,
            Booklets, Letterheads, Envelopes, Presentation Folders, etc.
            <br />
            <br />
            Contact us for a custom quote on any printing project!
            <br />
            <strong>We'll match any competitors' prices with proof.</strong>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Main;
