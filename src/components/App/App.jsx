import { useState, useEffect } from "react";
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
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import LoginModal from "../LoginModal/LoginModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import CartContext from "../../contexts/CartContext";
import { getProducts } from "../../utils/api";
import {
  checkToken,
  login as loginUser,
  register as registerUser,
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
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
    const token = localStorage.getItem("jwt");
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
        localStorage.removeItem("jwt");
      })
      .finally(() => setIsCheckingAuth(false));
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage (excluding large file data)
  useEffect(() => {
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
      localStorage.setItem("cart", JSON.stringify(cartToSave));
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        console.warn("Cart data too large for localStorage, clearing old data");
        // Clear cart from localStorage if quota exceeded
        localStorage.removeItem("cart");
      } else {
        console.error("Error saving cart:", error);
      }
    }
  }, [cartItems]);

  // Modal handlers
  const handleOpenLoginModal = () => setActiveModal("login");
  const handleOpenRegisterModal = () => setActiveModal("register");
  const closeActiveModal = () => setActiveModal("");

  // Auth handlers
  const handleLogin = (email, password) => {
    return loginUser(email, password).then((data) => {
      localStorage.setItem("jwt", data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      closeActiveModal();
    });
  };

  const handleRegister = (email, password, name) => {
    return registerUser(email, password, name).then((data) => {
      localStorage.setItem("jwt", data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      closeActiveModal();
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setCurrentUser(null);
    setIsLoggedIn(false);
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
                  <Admin />
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
