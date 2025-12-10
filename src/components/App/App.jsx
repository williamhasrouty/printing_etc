import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Main from "../Main/Main";
import ProductDetail from "../ProductDetail/ProductDetail";
import Cart from "../Cart/Cart";
import Checkout from "../Checkout/Checkout";
import Profile from "../Profile/Profile";
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

function App() {
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
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
      .finally(() => setIsLoading(false));
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
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
        JSON.stringify(cartItem.options) === JSON.stringify(item.options)
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.productId === item.productId &&
          JSON.stringify(cartItem.options) === JSON.stringify(item.options)
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, id: Date.now() }]);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateCartItemQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCartItems(
        cartItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CurrentUserContext.Provider value={{ currentUser, isLoggedIn }}>
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
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
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
            />
          )}
        </div>
      </CartContext.Provider>
    </CurrentUserContext.Provider>
  );
}

export default App;
