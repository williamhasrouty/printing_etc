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
          <p className="footer__text">Phone: (661) 272-2869</p>
          <p className="footer__text">1747 E Ave Q Ste B2</p>
          <p className="footer__text">Palmdale, CA 93550</p>
        </div>

        <div className="footer__column">
          <h3 className="footer__title">Hours</h3>
          <p className="footer__text">Mon-Fri: 9am - 5pm</p>
          <p className="footer__text">Sat-Sun: Closed</p>
        </div>
      </div>

      <div className="footer__copyright">
        © {currentYear} Printing Etc, LLC - All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
