import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../../contexts/CartContext";
import "./Cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateCartItemQuantity } =
    useContext(CartContext);
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart">
        <div className="cart__container">
          <h1 className="cart__title">Shopping Cart</h1>
          <div className="cart__empty">
            <p className="cart__empty-text">Your cart is empty</p>
            <button
              onClick={() => navigate("/")}
              className="cart__continue-button"
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart">
      <div className="cart__container">
        <h1 className="cart__title">Shopping Cart</h1>

        <div className="cart__content">
          <div className="cart__items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart__item">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="cart__item-image"
                />

                <div className="cart__item-details">
                  <h3 className="cart__item-name">{item.name}</h3>
                  <div className="cart__item-options">
                    <p className="cart__item-option">
                      Paper: {item.options.paperType}
                    </p>
                    <p className="cart__item-option">
                      Quantity: {item.options.quantity}
                    </p>
                    <p className="cart__item-option">
                      Turnaround: {item.options.turnaround}
                    </p>
                  </div>
                </div>

                <div className="cart__item-actions">
                  <p className="cart__item-price">${item.price.toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="cart__item-remove"
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart__summary">
            <h2 className="cart__summary-title">Order Summary</h2>
            <div className="cart__summary-row">
              <span className="cart__summary-label">Items:</span>
              <span className="cart__summary-value">{cartItems.length}</span>
            </div>
            <div className="cart__summary-row cart__summary-row_type_total">
              <span className="cart__summary-label">Total:</span>
              <span className="cart__summary-value">${calculateTotal()}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="cart__checkout-button"
              type="button"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => navigate("/")}
              className="cart__continue-shopping"
              type="button"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Cart;
