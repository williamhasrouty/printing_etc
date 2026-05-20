import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../../contexts/CartContext";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import "./Cart.css";

function Cart({ onLoginClick, onRegisterClick }) {
  const { cartItems, removeFromCart, updateCartItemQuantity } =
    useContext(CartContext);
  const { isLoggedIn } = useContext(CurrentUserContext);
  const navigate = useNavigate();

  const handleEditItem = (item) => {
    navigate(`/products/${item.productId}`, {
      state: { editingCartItem: item },
    });
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      onRegisterClick();
      return;
    }
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
                      Print Quantity: {item.options.quantity}
                    </p>
                    {item.options.size && (
                      <p className="cart__item-option">
                        Size: {item.options.size}
                      </p>
                    )}
                    {item.options.sizeDistribution && (
                      <div className="cart__item-option">
                        <strong>Sizes:</strong>
                        <ul className="cart__size-distribution">
                          {Object.entries(item.options.sizeDistribution).map(
                            ([size, qty]) => (
                              <li key={size}>
                                {size}: {qty}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                    {item.options.orientation && (
                      <p className="cart__item-option">
                        Orientation: {item.options.orientation}
                      </p>
                    )}
                    {item.options.color && (
                      <p className="cart__item-option">
                        Color: {item.options.color}
                      </p>
                    )}
                    {item.options.roundedCorner &&
                      item.options.roundedCorner !== "none" && (
                        <p className="cart__item-option">
                          Rounded Corner: {item.options.roundedCorner}
                        </p>
                      )}
                    {item.options.coating && (
                      <p className="cart__item-option">
                        Coating: {item.options.coating}
                      </p>
                    )}
                    {item.options.raisedPrint && (
                      <p className="cart__item-option">
                        Raised Print: {item.options.raisedPrint}
                      </p>
                    )}
                    {item.options.velvetFinish && (
                      <p className="cart__item-option">
                        Velvet Finish: {item.options.velvetFinish}
                      </p>
                    )}
                    {item.uploadedFile && (
                      <p className="cart__item-option cart__item-option_success">
                        File: {item.uploadedFile.fileName || item.uploadedFile}{" "}
                        ✓
                      </p>
                    )}
                    {!item.uploadedFile && (
                      <p className="cart__item-option cart__item-option_warning">
                        ⚠️ File Required: Please edit this item to upload your
                        design file
                      </p>
                    )}
                    {item.shippingCost > 0 && (
                      <p className="cart__item-option">
                        Shipping: ${item.shippingCost.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="cart__item-quantity">
                    <label className="cart__item-quantity-label">
                      Quantity:
                    </label>
                    <div className="cart__item-quantity-controls">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantity - 1)
                        }
                        className="cart__item-quantity-btn"
                        type="button"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="cart__item-quantity-value">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantity + 1)
                        }
                        className="cart__item-quantity-btn"
                        type="button"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="cart__item-actions">
                  <p className="cart__item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                    {item.quantity > 1 && (
                      <span className="cart__item-price-unit">
                        {" "}
                        (${item.price.toFixed(2)} each)
                      </span>
                    )}
                  </p>
                  <div className="cart__item-buttons">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="cart__item-edit"
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="cart__item-remove"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
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
            <div className="cart__summary-row">
              <span className="cart__summary-label">Subtotal:</span>
              <span className="cart__summary-value">${calculateTotal()}</span>
            </div>
            <div className="cart__summary-row">
              <span className="cart__summary-label">Tax:</span>
              <span className="cart__summary-value cart__summary-value_pending">
                Added at checkout
              </span>
            </div>
            <div className="cart__summary-row">
              <span className="cart__summary-label">Shipping:</span>
              <span className="cart__summary-value cart__summary-value_pending">
                Added at checkout
              </span>
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
