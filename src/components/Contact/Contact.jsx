import "./Contact.css";

function Contact() {
  return (
    <main className="contact">
      <div className="contact__container">
        <h1 className="contact__title">Contact Us</h1>

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
                <a href="tel:6612722869" className="contact__detail-link">
                  (661) 272-2869
                </a>
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
            </div>
          </section>

          <section className="contact__map">
            <iframe
              title="Printing Etc Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3289.8!2d-118.1!3d34.58!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM0JzQ4LjAiTiAxMTjCsDA2JzAwLjAiVw!5e0!3m2!1sen!2sus!4v1234567890"
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
