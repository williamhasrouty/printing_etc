import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import CartContext from "../../contexts/CartContext";
import logo from "../../assets/images/printingetclogoold.jpg";
import "./Header.css";

function Header({ onLoginClick, onRegisterClick, onLogout }) {
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);
  const { cartItems } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <img
            src={logo}
            alt="Printing Etc Logo"
            className="header__logo-image"
          />
        </Link>

        <button
          className={`header__hamburger ${isMobileMenuOpen ? "header__hamburger_active" : ""}`}
          onClick={toggleMobileMenu}
          type="button"
          aria-label="Toggle menu"
        >
          <span className="header__hamburger-line"></span>
          <span className="header__hamburger-line"></span>
          <span className="header__hamburger-line"></span>
        </button>

        <nav
          className={`header__nav ${isMobileMenuOpen ? "header__nav_open" : ""}`}
        >
          <Link to="/" className="header__link" onClick={closeMobileMenu}>
            Products
          </Link>
          <Link
            to="/contact"
            className="header__link"
            onClick={closeMobileMenu}
          >
            Contact
          </Link>
          <Link
            to="/cart"
            className="header__link header__cart"
            onClick={closeMobileMenu}
          >
            Cart
            {cartItemCount > 0 && (
              <span className="header__cart-badge">{cartItemCount}</span>
            )}
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="header__link header__link_profile"
                onClick={closeMobileMenu}
              >
                {currentUser?.name || "Profile"}
              </Link>
              <button
                onClick={() => {
                  onLogout();
                  closeMobileMenu();
                }}
                className="header__button"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onLoginClick();
                  closeMobileMenu();
                }}
                className="header__button"
                type="button"
              >
                Customer Login
              </button>
              <button
                onClick={() => {
                  onRegisterClick();
                  closeMobileMenu();
                }}
                className="header__button header__button_type_signup"
                type="button"
              >
                New Customer
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
