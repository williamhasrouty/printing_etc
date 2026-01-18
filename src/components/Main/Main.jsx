import ProductGallery from "../ProductGallery/ProductGallery";
import "./Main.css";
import printingPress1 from "../../assets/images/Old_Threshers_Miehle_Press_Drum.jpg";
import printingPress2 from "../../assets/images/printing-press-invention.webp";
import printingPress3 from "../../assets/images/history-of-printing.jpg";
import printingPress4 from "../../assets/images/Letterpress-printing-offers-a-unique-and-sophisticated-product-with-superior-quality..jpg";
import printingPress5 from "../../assets/images/ghows-NY-4b80397e-4b7b-25b0-e053-0100007ffaf9-ce1a0fe0.webp";

function Main({ products, isLoading }) {
  const images = [
    printingPress1,
    printingPress2,
    printingPress3,
    printingPress4,
    printingPress5,
  ];

  return (
    <main className="main">
      <section className="main__hero">
        <div className="main__hero-content">
          <h1 className="main__hero-title">Professional Printing Services</h1>
          <p className="main__hero-text">
            Quality Printing & Affordable Prices
          </p>
        </div>
        <div className="main__hero-ticker">
          <div className="main__hero-ticker-track">
            {images.map((img, index) => (
              <img
                key={`first-${index}`}
                src={img}
                alt="Printing press"
                className="main__hero-ticker-image"
              />
            ))}
            {images.map((img, index) => (
              <img
                key={`second-${index}`}
                src={img}
                alt="Printing press"
                className="main__hero-ticker-image"
              />
            ))}
          </div>
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
          <p className="main__additional-products">
            We also offer a wide range of other printing services including:
            <br />
            Copies, Labels, Invoices, Brochures, Menus, A-Frames, Yard Signs, Car Magnets,
           Letterheads, Envelopes, Presentation Folders, etc.
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
