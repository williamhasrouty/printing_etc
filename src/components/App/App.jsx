import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Main from "../Main/Main";
import ProductDetail from "../ProductDetail/ProductDetail";
import Cart from "../Cart/Cart";
import Checkout from "../Checkout/Checkout";
import OrderSummary from "../OrderSummary/OrderSummary";
import Profile from "../Profile/Profile";
import Admin from "../Admin/Admin";
import Contact from "../Contact/Contact";
import ResetPassword from "../ResetPassword/ResetPassword";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import LoginModal from "../LoginModal/LoginModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import CartContext from "../../contexts/CartContext";
import { getProducts } from "../../utils/api";
import {
  checkToken,
  clearAuthToken,
  getStoredToken,
  login as loginUser,
  register as registerUser,
  storeAuthToken,
} from "../../utils/auth";
import "./App.css";

// Initialize Stripe with your publishable key
// IMPORTANT: Replace this with your actual Stripe publishable key
// Get your key from: https://dashboard.stripe.com/apikeys
const stripePromise = loadStripe(
  "pk_test_51TGTogEAmwu5KmQ8ONfqPvSccHHsL2vFxzrMwAox0E8XUqkwRyHztOgGYEEgS2wdIO4BeMv2iP4CRmF8ocVxvcEk001TxeRkBu",
);

function App() {
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // Use ref to track which user we've initialized the cart for
  // This prevents re-running merge on every render
  const initializedUserIdRef = useRef(null);

  // Helper function to get cart key for current user
  const getCartKey = (user) => {
    return user ? `cart_${user._id}` : "cart_guest";
  };

  // Initialize cart from localStorage synchronously
  const [cartItems, setCartItems] = useState(() => {
    try {
      // Try to get user from token to load their cart
      const token = getStoredToken();
      let cartKey = "cart_guest";

      if (token) {
        try {
          // Decode JWT to get user ID (simple decode, not verification)
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload._id) {
            cartKey = `cart_${payload._id}`;
          }
        } catch (e) {
          // If token decode fails, use guest cart
          console.log("Using guest cart");
        }
      }

      const savedCart = localStorage.getItem(cartKey);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  const navigate = useNavigate();

  // Load products
  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Check token on mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    checkToken(token)
      .then((user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch((err) => {
        console.error(err);
        clearAuthToken();
      })
      .finally(() => setIsCheckingAuth(false));
  }, []);

  // Mark cart as loaded after initial render
  useEffect(() => {
    setIsCartLoaded(true);
  }, []);

  // Load user's cart when they log in and merge with guest cart
  useEffect(() => {
    // Only run when user is present and cart is loaded
    if (!currentUser || !isCartLoaded) {
      return;
    }

    // Check if we've already initialized for this user
    if (initializedUserIdRef.current === currentUser._id) {
      return;
    }

    const userCartKey = getCartKey(currentUser);
    const guestCartKey = "cart_guest";

    try {
      // Mark as initialized first to prevent this effect from running again
      initializedUserIdRef.current = currentUser._id;

      // If cart already has items (page refresh scenario), don't reload
      if (cartItems.length > 0) {
        return;
      }

      // Get guest cart from localStorage
      const savedGuestCart = localStorage.getItem(guestCartKey);
      const guestCart = savedGuestCart ? JSON.parse(savedGuestCart) : [];

      // Get user's saved cart from localStorage
      const savedUserCart = localStorage.getItem(userCartKey);
      const userCart = savedUserCart ? JSON.parse(savedUserCart) : [];

      // Start with user's saved cart
      const mergedCart = [...userCart];

      // If there's a guest cart, merge it with user cart
      if (guestCart.length > 0) {
        guestCart.forEach((guestItem) => {
          const existingIndex = mergedCart.findIndex(
            (item) =>
              item.productId === guestItem.productId &&
              JSON.stringify(item.options) ===
                JSON.stringify(guestItem.options),
          );

          if (existingIndex >= 0) {
            // Item exists, increase quantity
            mergedCart[existingIndex] = {
              ...mergedCart[existingIndex],
              quantity:
                mergedCart[existingIndex].quantity + (guestItem.quantity || 1),
            };
          } else {
            // Item doesn't exist, add it
            mergedCart.push(guestItem);
          }
        });

        // Clear guest cart after merging
        localStorage.removeItem(guestCartKey);
      }

      // Update state with user's cart (merged with guest if applicable)
      if (mergedCart.length > 0) {
        setCartItems(mergedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      initializedUserIdRef.current = currentUser._id;
    }
  }, [currentUser?._id, isCartLoaded]);

  // Save cart to localStorage (excluding large file data) - only after cart is loaded
  useEffect(() => {
    if (!isCartLoaded) return; // Don't save on initial mount

    const cartKey = getCartKey(currentUser);

    try {
      // Remove large file data before saving to avoid quota exceeded errors
      const cartToSave = cartItems.map((item) => {
        const { uploadedFile, uploadedBackFile, ...itemWithoutFiles } = item;
        return {
          ...itemWithoutFiles,
          // Only save file metadata, not actual file data
          uploadedFile: uploadedFile
            ? {
                fileName: uploadedFile.fileName,
                fileSize: uploadedFile.fileSize,
                fileType: uploadedFile.fileType,
                // Indicate file was uploaded but not persisted
                _fileNotPersisted: true,
              }
            : null,
          uploadedBackFile: uploadedBackFile
            ? {
                fileName: uploadedBackFile.fileName,
                fileSize: uploadedBackFile.fileSize,
                fileType: uploadedBackFile.fileType,
                _fileNotPersisted: true,
              }
            : null,
        };
      });
      localStorage.setItem(cartKey, JSON.stringify(cartToSave));
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        console.warn("Cart data too large for localStorage, clearing old data");
        // Clear cart from localStorage if quota exceeded
        localStorage.removeItem(cartKey);
      } else {
        console.error("Error saving cart:", error);
      }
    }
  }, [cartItems, isCartLoaded, currentUser]);

  // Modal handlers
  const handleOpenLoginModal = () => setActiveModal("login");
  const handleOpenRegisterModal = () => setActiveModal("register");
  const closeActiveModal = () => setActiveModal("");

  // Auth handlers
  const handleLogin = (email, password, rememberMe = false) => {
    return loginUser(email, password).then((data) => {
      storeAuthToken(data.token, rememberMe);
      initializedUserIdRef.current = null; // Reset to allow cart merge
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      closeActiveModal();

      // Redirect admin users to admin dashboard
      if (data.user.role === "admin") {
        navigate("/admin");
      }
    });
  };

  const handleRegister = (email, password, name, phone) => {
    return registerUser(email, password, name, phone).then((data) => {
      storeAuthToken(data.token, true);
      initializedUserIdRef.current = null; // Reset to allow cart merge
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      closeActiveModal();
    });
  };

  const handleLogout = () => {
    // Save current cart to user's localStorage before clearing state
    if (currentUser && cartItems.length > 0) {
      const userCartKey = `cart_${currentUser._id}`;
      try {
        const cartToSave = cartItems.map((item) => {
          const { uploadedFile, uploadedBackFile, ...itemWithoutFiles } = item;
          return {
            ...itemWithoutFiles,
            uploadedFile: uploadedFile
              ? {
                  fileName: uploadedFile.fileName,
                  fileSize: uploadedFile.fileSize,
                  fileType: uploadedFile.fileType,
                  _fileNotPersisted: true,
                }
              : null,
            uploadedBackFile: uploadedBackFile
              ? {
                  fileName: uploadedBackFile.fileName,
                  fileSize: uploadedBackFile.fileSize,
                  fileType: uploadedBackFile.fileType,
                  _fileNotPersisted: true,
                }
              : null,
          };
        });
        localStorage.setItem(userCartKey, JSON.stringify(cartToSave));
      } catch (error) {
        console.error("Error saving cart on logout:", error);
      }
    }

    clearAuthToken();
    initializedUserIdRef.current = null; // Reset for next login
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCartItems([]);
    navigate("/");
  };

  // Cart handlers
  const addToCart = (item) => {
    const existingItem = cartItems.find(
      (cartItem) =>
        cartItem.productId === item.productId &&
        JSON.stringify(cartItem.options) === JSON.stringify(item.options),
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.productId === item.productId &&
          JSON.stringify(cartItem.options) === JSON.stringify(item.options)
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem,
        ),
      );
    } else {
      setCartItems([...cartItems, { ...item, id: Date.now() }]);
    }
  };

  const removeFromCart = (id) => {
    // Clean up blob URLs for the item being removed
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (itemToRemove) {
      if (itemToRemove.uploadedFile?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.uploadedFile.previewUrl);
      }
      if (itemToRemove.uploadedBackFile?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.uploadedBackFile.previewUrl);
      }
    }
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateCartItemQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const clearCart = () => {
    // Clean up blob URLs before clearing cart to prevent memory leaks
    cartItems.forEach((item) => {
      if (item.uploadedFile?.previewUrl) {
        URL.revokeObjectURL(item.uploadedFile.previewUrl);
      }
      if (item.uploadedBackFile?.previewUrl) {
        URL.revokeObjectURL(item.uploadedBackFile.previewUrl);
      }
    });
    setCartItems([]);
  };

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, setCurrentUser, isLoggedIn, isCheckingAuth }}
    >
      <CartContext.Provider
        value={{
          cartItems,
          addToCart,
          removeFromCart,
          updateCartItemQuantity,
          clearCart,
        }}
      >
        <div className="page">
          <ScrollToTop />
          <Header
            onLoginClick={handleOpenLoginModal}
            onRegisterClick={handleOpenRegisterModal}
            onLogout={handleLogout}
          />
          <Routes>
            <Route
              path="/"
              element={<Main products={products} isLoading={isLoading} />}
            />
            <Route
              path="/products/:id"
              element={<ProductDetail products={products} />}
            />
            <Route
              path="/cart"
              element={
                <Cart
                  onLoginClick={handleOpenLoginModal}
                  onRegisterClick={handleOpenRegisterModal}
                />
              }
            />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/reset-password"
              element={<ResetPassword onLoginClick={handleOpenLoginModal} />}
            />
            <Route
              path="/checkout"
              element={
                <Elements stripe={stripePromise}>
                  <Checkout />
                </Elements>
              }
            />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin onProductsChange={setProducts} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />

          {activeModal === "login" && (
            <LoginModal
              onClose={closeActiveModal}
              onLogin={handleLogin}
              onRegisterClick={handleOpenRegisterModal}
            />
          )}

          {activeModal === "register" && (
            <RegisterModal
              onClose={closeActiveModal}
              onRegister={handleRegister}
              onLoginClick={handleOpenLoginModal}
              onGuestCheckout={() => {
                closeActiveModal();
                navigate("/checkout");
              }}
            />
          )}
        </div>
      </CartContext.Provider>
    </CurrentUserContext.Provider>
  );
}

export default App;
