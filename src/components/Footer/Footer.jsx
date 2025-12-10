import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__column">
          <h3 className="footer__title">About Us</h3>
          <p className="footer__text">
            Professional printing services for businesses and individuals.
            Quality prints, fast turnaround.
          </p>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">Contact</h3>
          <p className="footer__text">Email: info@printshop.com</p>
          <p className="footer__text">Phone: (555) 123-4567</p>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">Hours</h3>
          <p className="footer__text">Mon-Fri: 9am - 6pm</p>
          <p className="footer__text">Sat: 10am - 4pm</p>
          <p className="footer__text">Sun: Closed</p>
        </div>
      </div>

      <div className="footer__copyright">
        © {currentYear} PrintShop. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
