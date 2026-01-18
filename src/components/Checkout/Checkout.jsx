import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CartContext from "../../contexts/CartContext";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { createOrder } from "../../utils/api";
import { CARD_PATTERNS, ANTELOPE_VALLEY_ZIPS } from "../../utils/constants";
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
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCost, setShippingCost] = useState(null);
  const taxRate = 0.1125; // Fixed 11.25% tax rate

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * taxRate;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const shipping = shippingCost || 0;
    return (subtotal + tax + shipping).toFixed(2);
  };

  // Estimate weight based on product type and quantity
  const calculateTotalWeight = () => {
    return cartItems.reduce((totalWeight, item) => {
      const quantity = item.options?.quantity || 1;
      let weightPerUnit = 0; // in pounds

      // Weight estimates based on product category
      if (item.category === "business-cards") {
        weightPerUnit = 0.002; // ~2 lbs per 1000 cards
      } else if (
        item.category === "flyers" ||
        item.category === "door-hangers"
      ) {
        weightPerUnit = 0.05; // ~5 lbs per 100 flyers
      } else if (item.category === "brochures") {
        weightPerUnit = 0.08; // ~8 lbs per 100 brochures
      } else if (item.category === "postcards") {
        weightPerUnit = 0.03; // ~3 lbs per 100 postcards
      } else if (item.category === "posters") {
        weightPerUnit = 0.15; // ~15 lbs per 100 posters
      } else if (item.category === "banners") {
        weightPerUnit = 0.5; // ~0.5 lbs per banner
      } else if (item.category === "stickers" || item.category === "decals") {
        weightPerUnit = 0.02; // ~2 lbs per 100 stickers
      } else if (item.category === "booklets") {
        weightPerUnit = 0.1; // ~10 lbs per 100 booklets
      } else if (item.category === "tshirts") {
        weightPerUnit = 0.35; // ~0.35 lbs per shirt
      } else if (item.category === "blueprints") {
        weightPerUnit = 0.1; // ~10 lbs per 100 prints
      } else {
        weightPerUnit = 0.05; // default weight
      }

      return totalWeight + weightPerUnit * quantity;
    }, 0);
  };

  // Calculate shipping when zip code changes
  const updateShippingAndTax = (zipCode) => {
    if (zipCode.length >= 5) {
      // Check if it's Antelope Valley for local delivery
      if (ANTELOPE_VALLEY_ZIPS.includes(zipCode)) {
        setShippingCost(10); // Flat rate local delivery
      } else {
        // National shipping based on package weight (USPS/UPS/FedEx style)
        const totalWeight = calculateTotalWeight();

        // Shipping tiers based on weight (in pounds)
        let shipping = 8; // Minimum shipping cost
        if (totalWeight > 1 && totalWeight <= 3) {
          shipping = 12;
        } else if (totalWeight > 3 && totalWeight <= 5) {
          shipping = 18;
        } else if (totalWeight > 5 && totalWeight <= 10) {
          shipping = 28;
        } else if (totalWeight > 10 && totalWeight <= 20) {
          shipping = 42;
        } else if (totalWeight > 20 && totalWeight <= 40) {
          shipping = 60;
        } else if (totalWeight > 40) {
          shipping = 85;
        }

        setShippingCost(shipping);
      }
    }
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s/g, "");
    return Object.values(CARD_PATTERNS).some((pattern) =>
      pattern.test(cleanNumber),
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

    // Format ZIP code
    if (name === "zipCode") {
      formattedValue = value.replace(/\D/g, "").slice(0, 5);
      if (formattedValue.length === 5) {
        updateShippingAndTax(formattedValue);
      }
    }

    // Format shipping ZIP code
    if (name === "shippingZipCode") {
      formattedValue = value.replace(/\D/g, "").slice(0, 5);
      if (formattedValue.length === 5 && !sameAsBilling) {
        updateShippingAndTax(formattedValue);
      }
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
      userId: currentUser?.id,
      items: cartItems,
      total: calculateTotal(),
      billingInfo: formData,
      createdAt: new Date().toISOString(),
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

            <section className="checkout__section">
              <h2 className="checkout__section-title">Shipping Address</h2>

              <div className="checkout__field">
                <label className="checkout__checkbox-label">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => {
                      setSameAsBilling(e.target.checked);
                      if (e.target.checked) {
                        // Use billing zip for shipping calculation
                        if (formData.zipCode.length === 5) {
                          updateShippingAndTax(formData.zipCode);
                        }
                      }
                    }}
                    className="checkout__checkbox"
                  />
                  Same as Billing Address
                </label>
              </div>

              {!sameAsBilling && (
                <>
                  <div className="checkout__field">
                    <label
                      htmlFor="shippingAddress"
                      className="checkout__label"
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      className="checkout__input"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="checkout__row">
                    <div className="checkout__field">
                      <label htmlFor="shippingCity" className="checkout__label">
                        City
                      </label>
                      <input
                        type="text"
                        id="shippingCity"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        className="checkout__input"
                        placeholder="New York"
                      />
                    </div>

                    <div className="checkout__field">
                      <label
                        htmlFor="shippingState"
                        className="checkout__label"
                      >
                        State
                      </label>
                      <input
                        type="text"
                        id="shippingState"
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleInputChange}
                        className="checkout__input"
                        placeholder="NY"
                      />
                    </div>

                    <div className="checkout__field">
                      <label
                        htmlFor="shippingZipCode"
                        className="checkout__label"
                      >
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="shippingZipCode"
                        name="shippingZipCode"
                        value={formData.shippingZipCode}
                        onChange={handleInputChange}
                        className="checkout__input"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </>
              )}
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

            <div className="checkout__totals">
              <div className="checkout__total-row">
                <span className="checkout__total-label">Subtotal:</span>
                <span className="checkout__total-value">
                  ${calculateSubtotal().toFixed(2)}
                </span>
              </div>
              {taxRate > 0 && (
                <div className="checkout__total-row">
                  <span className="checkout__total-label">
                    Tax ({(taxRate * 100).toFixed(2)}%):
                  </span>
                  <span className="checkout__total-value">
                    ${calculateTax().toFixed(2)}
                  </span>
                </div>
              )}
              <div className="checkout__total-row">
                <span className="checkout__total-label">Shipping:</span>
                <span className="checkout__total-value">
                  {shippingCost !== null
                    ? shippingCost === 10
                      ? "$10.00 (Local Delivery)"
                      : `$${shippingCost.toFixed(2)}`
                    : "TBD"}
                </span>
              </div>
              <div
                className="checkout__total"
                style={{
                  borderTop: "2px solid #00b4d8",
                  paddingTop: "10px",
                  marginTop: "10px",
                }}
              >
                <span
                  className="checkout__total-label"
                  style={{ fontWeight: "600", fontSize: "18px" }}
                >
                  Total:
                </span>
                <span
                  className="checkout__total-value"
                  style={{ fontWeight: "600", fontSize: "18px" }}
                >
                  ${calculateTotal()}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
