import "./Contact.css";
import printingPress1 from "../../assets/images/Old_Threshers_Miehle_Press_Drum.jpg";
import printingPress2 from "../../assets/images/printing-press-invention.webp";
import printingPress3 from "../../assets/images/history-of-printing.jpg";
import printingPress4 from "../../assets/images/Letterpress-printing-offers-a-unique-and-sophisticated-product-with-superior-quality..jpg";
import printingPress5 from "../../assets/images/ghows-NY-4b80397e-4b7b-25b0-e053-0100007ffaf9-ce1a0fe0.webp";

function Contact() {
  const customerProductImages = [
    printingPress1,
    printingPress2,
    printingPress3,
    printingPress4,
    printingPress5,
  ];

  return (
    <main className="contact">
      <div className="contact__container">
        <h1 className="contact__title">Contact Us</h1>
{/* 
        <section
          className="contact__gallery"
          aria-label="Customer product gallery"
        >
          <div className="contact__gallery-track">
            {customerProductImages.map((img, index) => (
              <img
                key={`contact-gallery-first-${index}`}
                src={img}
                alt="Printing press"
                className="contact__gallery-image"
              />
            ))}
            {customerProductImages.map((img, index) => (
              <img
                key={`contact-gallery-second-${index}`}
                src={img}
                alt="Printing press"
                className="contact__gallery-image"
              />
            ))}
          </div>
        </section> */}

        <div className="contact__content">
          <section className="contact__info">
            <h2 className="contact__subtitle">Get in Touch</h2>
            <p className="contact__text">
              We'd love to hear from you! Reach out to discuss your printing
              needs or get a quote for your project.
            </p>

            <div className="contact__details">
              <div className="contact__detail">
                <h3 className="contact__detail-title">Phone</h3>
                <p className="contact__detail-text-phone">(661) 272-2869</p>
              </div>

              <div className="contact__detail">
                <h3 className="contact__detail-title">Address</h3>
                <p className="contact__detail-text">
                  1747 E Ave Q Ste B2
                  <br />
                  Palmdale, CA 93550
                </p>
              </div>

              <div className="contact__detail">
                <h3 className="contact__detail-title">Hours</h3>
                <p className="contact__detail-text">
                  Monday - Friday: 9:00 AM - 5:00 PM
                  <br />
                  Saturday - Sunday: Closed
                </p>
              </div>

              <div className="contact__detail contact__detail_turnaround">
                <h3 className="contact__detail-title">Turnaround Times</h3>
                <p className="contact__detail-text">
                  <strong>Standard Orders:</strong> 5-7 business days
                  <br />
                  <strong>Custom Orders:</strong> 7-10 business days
                  <br />
                  <strong>Rush Orders:</strong> Please call to confirm
                  availability
                </p>
              </div>
            </div>
          </section>

          <section className="contact__map">
            <iframe
              title="Printing Etc Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3289.754328!2d-118.089845!3d34.579582!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c25da1b7a7a6a9%3A0x7a8e8a1e0e8e8e8e!2s1747%20E%20Ave%20Q%20Ste%20B2%2C%20Palmdale%2C%20CA%2093550!5e0!3m2!1sen!2sus!4v1705539600000!5m2!1sen!2sus"
              className="contact__map-iframe"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Contact;
