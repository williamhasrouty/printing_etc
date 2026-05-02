import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import CartContext from "../../contexts/CartContext";
import { getProducts } from "../../utils/api";
import "./Header.css";

function Header({ onLoginClick, onRegisterClick, onLogout }) {
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);
  const { cartItems } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleProductsClick = (e) => {
    // On mobile, toggle dropdown; on desktop, navigate to home
    if (window.innerWidth <= 768) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      // On desktop, navigate to home page
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          Printing Etc.
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
          <div
            className="header__dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <span className="header__link" onClick={handleProductsClick}>
              Products
            </span>
            {isDropdownOpen && products.length > 0 && (
              <div className="header__dropdown-menu">
                <div className="header__dropdown-content">
                  {[...products]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((product) => (
                      <button
                        key={product._id}
                        className="header__dropdown-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${product._id}`);
                          setIsDropdownOpen(false);
                          closeMobileMenu();
                        }}
                        type="button"
                      >
                        {product.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
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
              {currentUser?.role === "admin" && (
                <Link
                  to="/admin"
                  className="header__link header__link_admin"
                  onClick={closeMobileMenu}
                >
                  Admin Dashboard
                </Link>
              )}
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

        {isMobileMenuOpen && (
          <button
            type="button"
            className="header__overlay"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          />
        )}
      </div>
    </header>
  );
}

export default Header;
