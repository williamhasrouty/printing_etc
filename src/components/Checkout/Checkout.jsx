import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../../contexts/CartContext";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { createOrder } from "../../utils/api";
import { CARD_PATTERNS } from "../../utils/constants";
import "./Checkout.css";

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const { currentUser } = useContext(CurrentUserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, "");
    return Object.values(CARD_PATTERNS).some((pattern) =>
      pattern.test(cleanNumber)
    );
  };

  const validateExpiryDate = (date) => {
    const [month, year] = date.split("/");
    if (!month || !year) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    }

    // Format expiry date
    if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    }

    // Format CVV
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setFormData({ ...formData, [name]: formattedValue });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardNumber || !validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = "Please enter a valid card number";
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    }

    if (!formData.expiryDate || !validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = "Please enter a valid expiry date";
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "Please enter a valid CVV";
    }

    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = "Billing address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.zipCode.trim() || formData.zipCode.length < 5) {
      newErrors.zipCode = "Please enter a valid ZIP code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const token = localStorage.getItem("jwt");
    const orderData = {
      items: cartItems,
      total: calculateTotal(),
      billingInfo: formData,
    };

    createOrder(orderData, token)
      .then(() => {
        clearCart();
        alert("Order placed successfully!");
        navigate("/profile");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to place order. Please try again.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <main className="checkout">
      <div className="checkout__container">
        <h1 className="checkout__title">Checkout</h1>

        <div className="checkout__content">
          <form onSubmit={handleSubmit} className="checkout__form">
            <section className="checkout__section">
              <h2 className="checkout__section-title">Payment Information</h2>

              <div className="checkout__field">
                <label htmlFor="cardNumber" className="checkout__label">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={`checkout__input ${
                    errors.cardNumber ? "checkout__input_error" : ""
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                {errors.cardNumber && (
                  <span className="checkout__error">{errors.cardNumber}</span>
                )}
              </div>

              <div className="checkout__field">
                <label htmlFor="cardName" className="checkout__label">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  className={`checkout__input ${
                    errors.cardName ? "checkout__input_error" : ""
                  }`}
                  placeholder="John Doe"
                />
                {errors.cardName && (
                  <span className="checkout__error">{errors.cardName}</span>
                )}
              </div>

              <div className="checkout__row">
                <div className="checkout__field">
                  <label htmlFor="expiryDate" className="checkout__label">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={`checkout__input ${
                      errors.expiryDate ? "checkout__input_error" : ""
                    }`}
                    placeholder="MM/YY"
                  />
                  {errors.expiryDate && (
                    <span className="checkout__error">{errors.expiryDate}</span>
                  )}
                </div>

                <div className="checkout__field">
                  <label htmlFor="cvv" className="checkout__label">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className={`checkout__input ${
                      errors.cvv ? "checkout__input_error" : ""
                    }`}
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <span className="checkout__error">{errors.cvv}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="checkout__section">
              <h2 className="checkout__section-title">Billing Address</h2>

              <div className="checkout__field">
                <label htmlFor="billingAddress" className="checkout__label">
                  Street Address
                </label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  className={`checkout__input ${
                    errors.billingAddress ? "checkout__input_error" : ""
                  }`}
                  placeholder="123 Main St"
                />
                {errors.billingAddress && (
                  <span className="checkout__error">
                    {errors.billingAddress}
                  </span>
                )}
              </div>

              <div className="checkout__row">
                <div className="checkout__field">
                  <label htmlFor="city" className="checkout__label">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`checkout__input ${
                      errors.city ? "checkout__input_error" : ""
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <span className="checkout__error">{errors.city}</span>
                  )}
                </div>

                <div className="checkout__field">
                  <label htmlFor="state" className="checkout__label">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`checkout__input ${
                      errors.state ? "checkout__input_error" : ""
                    }`}
                    placeholder="NY"
                  />
                  {errors.state && (
                    <span className="checkout__error">{errors.state}</span>
                  )}
                </div>

                <div className="checkout__field">
                  <label htmlFor="zipCode" className="checkout__label">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`checkout__input ${
                      errors.zipCode ? "checkout__input_error" : ""
                    }`}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <span className="checkout__error">{errors.zipCode}</span>
                  )}
                </div>
              </div>
            </section>

            <button
              type="submit"
              className="checkout__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </form>

          <aside className="checkout__summary">
            <h2 className="checkout__summary-title">Order Summary</h2>

            <div className="checkout__items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout__item">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="checkout__item-image"
                  />
                  <div className="checkout__item-info">
                    <p className="checkout__item-name">{item.name}</p>
                    <p className="checkout__item-details">
                      Qty: {item.options.quantity}
                    </p>
                  </div>
                  <p className="checkout__item-price">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="checkout__total">
              <span className="checkout__total-label">Total:</span>
              <span className="checkout__total-value">${calculateTotal()}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
