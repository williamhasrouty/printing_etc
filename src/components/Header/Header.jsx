import { useContext } from "react";
import { Link } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import CartContext from "../../contexts/CartContext";
import "./Header.css";

function Header({ onLoginClick, onRegisterClick, onLogout }) {
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);
  const { cartItems } = useContext(CartContext);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          Printing Etc.
        </Link>

        <nav className="header__nav">
          <Link to="/" className="header__link">
            Products
          </Link>
          <Link to="/contact" className="header__link">
            Contact
          </Link>
          <Link to="/cart" className="header__link header__cart">
            Cart
            {cartItemCount > 0 && (
              <span className="header__cart-badge">{cartItemCount}</span>
            )}
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/profile" className="header__link">
                {currentUser?.name || "Profile"}
              </Link>
              <button
                onClick={onLogout}
                className="header__button"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="header__button"
                type="button"
              >
                Login
              </button>
              <button
                onClick={onRegisterClick}
                className="header__button header__button_type_signup"
                type="button"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
