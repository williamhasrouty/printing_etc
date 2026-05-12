import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import CartContext from "../../contexts/CartContext";
import { getProducts, getAllOrders } from "../../utils/api";
import { getStoredToken } from "../../utils/auth";
import "./Header.css";

function Header({ onLoginClick, onRegisterClick, onLogout }) {
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);
  const { cartItems } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const prevOrdersCount = useRef(0);
  const isInitialLoad = useRef(true);
  const navigate = useNavigate();

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  // Fetch new orders count for admin users
  useEffect(() => {
    const fetchNewOrders = () => {
      if (currentUser?.role === "admin") {
        const token = getStoredToken();
        if (token) {
          getAllOrders(token, "pending")
            .then((orders) => {
              const newCount = orders.length;

              // Get last acknowledged order count from localStorage
              const lastAcknowledgedCount = parseInt(
                localStorage.getItem("lastAcknowledgedOrderCount") || "0",
                10,
              );

              console.log(
                "Fetching orders - Current:",
                newCount,
                "Previous:",
                prevOrdersCount.current,
                "Last Acknowledged:",
                lastAcknowledgedCount,
                "Initial:",
                isInitialLoad.current,
              );

              // Show notification only if count increased beyond last acknowledged
              if (isInitialLoad.current && newCount > lastAcknowledgedCount) {
                console.log(
                  "Showing notification - new orders since last visit!",
                );
                setShowNotification(true);
              } else if (
                !isInitialLoad.current &&
                newCount > prevOrdersCount.current
              ) {
                console.log("Showing notification - new orders detected!");
                setShowNotification(true);
              }

              prevOrdersCount.current = newCount;
              setNewOrdersCount(newCount);
              isInitialLoad.current = false;
            })
            .catch((err) => console.error("Failed to fetch orders:", err));
        }
      }
    };

    fetchNewOrders();

    // Poll for new orders every 30 seconds if user is admin
    if (currentUser?.role === "admin") {
      const interval = setInterval(fetchNewOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleAdminDashboardClick = () => {
    setShowNotification(false);
    // Save current order count as acknowledged when navigating to admin/orders
    localStorage.setItem(
      "lastAcknowledgedOrderCount",
      newOrdersCount.toString(),
    );
    closeMobileMenu();
  };

  const handleNotificationClick = () => {
    setShowNotification(false);
    // Save current order count as acknowledged when clicking notification
    localStorage.setItem(
      "lastAcknowledgedOrderCount",
      newOrdersCount.toString(),
    );
    closeMobileMenu();
    navigate("/admin", { state: { tab: "orders" } });
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
                  state={{ tab: "orders" }}
                  className="header__link header__link_admin header__admin-link"
                  onClick={handleAdminDashboardClick}
                >
                  Admin Dashboard
                  <span
                    className={`header__notification-badge ${newOrdersCount > 0 ? "header__notification-badge_active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick();
                    }}
                  >
                    <svg
                      className="header__notification-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="header__notification-count">
                      {newOrdersCount}
                    </span>
                  </span>
                </Link>
              )}
              {currentUser?.role !== "admin" && (
                <Link
                  to="/profile"
                  className="header__link header__link_profile"
                  onClick={closeMobileMenu}
                >
                  {currentUser?.name || "Profile"}
                </Link>
              )}
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

      {/* New Order Notification Popup */}
      {showNotification && (
        <div className="header__notification-popup">
          <div
            className="header__notification-content"
            onClick={handleNotificationClick}
          >
            <svg
              className="header__notification-popup-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="header__notification-text">
              <strong>New Order!</strong>
              <p>You have new pending orders to review</p>
            </div>
            <button
              className="header__notification-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotification(false);
                // Save current order count as acknowledged when closing notification
                localStorage.setItem(
                  "lastAcknowledgedOrderCount",
                  newOrdersCount.toString(),
                );
              }}
              type="button"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
