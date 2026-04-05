import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import CartContext from "../../contexts/CartContext";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import NotificationModal from "../NotificationModal/NotificationModal";
import PaymentForm from "../PaymentForm/PaymentForm";
import { createOrder } from "../../utils/api";
import { uploadToCloudinary } from "../FileUpload/FileUpload";
import {
  applyImageTransform,
  getPrintDimensions,
} from "../../utils/imageTransform";
import { ANTELOPE_VALLEY_ZIPS, PICKUP_LOCATION } from "../../utils/constants";
import "./Checkout.css";

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const { currentUser } = useContext(CurrentUserContext);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    billingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState("shipping");

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [isCardReady, setIsCardReady] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState(null);
  const [notification, setNotification] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const taxRate = 0.1125; // Fixed 11.25% tax rate

  // Helper function to get user-friendly error messages
  const getPaymentErrorMessage = (error) => {
    const errorCode = error.code;
    const commonErrors = {
      card_declined:
        "Your card was declined. Please try a different payment method.",
      insufficient_funds:
        "Your card has insufficient funds. Please try a different card.",
      expired_card: "Your card has expired. Please use a different card.",
      incorrect_cvc:
        "The security code (CVC) is incorrect. Please check and try again.",
      processing_error:
        "An error occurred while processing your card. Please try again.",
      incorrect_number:
        "The card number is incorrect. Please check and try again.",
      invalid_expiry_year:
        "The expiration year is invalid. Please check and try again.",
      invalid_expiry_month:
        "The expiration month is invalid. Please check and try again.",
    };

    return (
      commonErrors[errorCode] ||
      error.message ||
      "Payment processing failed. Please try again."
    );
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems.length, navigate]);

  // Update shipping when delivery method changes
  useEffect(() => {
    if (deliveryMethod === "pickup") {
      setShippingCost(0);
    } else {
      // Recalculate shipping if we have a zip code
      const zipToUse = sameAsBilling
        ? formData.zipCode
        : formData.shippingZipCode;
      if (zipToUse.length === 5) {
        updateShippingAndTax(zipToUse);
      }
    }
  }, [deliveryMethod]);

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
    // If pickup is selected, shipping is always $0
    if (deliveryMethod === "pickup") {
      setShippingCost(0);
      setIsCalculatingShipping(false);
      return;
    }

    if (zipCode.length >= 5) {
      setIsCalculatingShipping(true);

      // Simulate slight delay for calculation (can be instant but gives user feedback)
      setTimeout(() => {
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
        setIsCalculatingShipping(false);
      }, 300);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

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

    // Format phone number
    if (name === "customerPhone") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
        .slice(0, 14);
    }

    setFormData({ ...formData, [name]: formattedValue });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation function
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Validate guest customer information if not logged in
    if (!currentUser) {
      if (!formData.customerName.trim()) {
        newErrors.customerName = "Name is required";
      }

      if (
        !formData.customerEmail.trim() ||
        !isValidEmail(formData.customerEmail)
      ) {
        newErrors.customerEmail = "Please enter a valid email address (e.g., name@email.com)";
      }

      if (
        !formData.customerPhone.trim() ||
        formData.customerPhone.replace(/\D/g, "").length < 10
      ) {
        newErrors.customerPhone = "Please enter a valid phone number";
      }
    }

    // Check if Stripe card is ready
    if (!isCardReady) {
      newErrors.payment = "Please complete your payment information";
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

    // Validate shipping address if different from billing and not pickup
    if (deliveryMethod === "shipping" && !sameAsBilling) {
      if (!formData.shippingAddress.trim()) {
        newErrors.shippingAddress = "Shipping address is required";
      }

      if (!formData.shippingCity.trim()) {
        newErrors.shippingCity = "City is required";
      }

      if (!formData.shippingState.trim()) {
        newErrors.shippingState = "State is required";
      }

      if (
        !formData.shippingZipCode.trim() ||
        formData.shippingZipCode.length < 5
      ) {
        newErrors.shippingZipCode = "Please enter a valid ZIP code";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        message: "Please fill in all required fields correctly",
        type: "error",
      });
      return;
    }

    if (!termsAccepted) {
      setNotification({
        message: "Please accept the terms and conditions to proceed",
        type: "error",
      });
      return;
    }

    if (!stripe || !elements) {
      setNotification({
        message: "Payment system not ready. Please refresh and try again.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload any user files to Cloudinary before creating the order
      const processedCartItems = await Promise.all(
        cartItems.map(async (item) => {
          let processedItem = { ...item };

          // Process front/main file
          if (
            item.uploadedFile &&
            item.uploadedFile.file &&
            !item.uploadedFile.cloudinaryUrl
          ) {
            try {
              let fileToUpload = item.uploadedFile.file;

              // Always apply transformations to ensure proper print dimensions
              // Even if user didn't manually edit position/zoom, we need to
              // fit the file to the correct print size
              const dimensions = getPrintDimensions(
                item.category,
                item.options,
              );
              fileToUpload = await applyImageTransform(
                item.uploadedFile,
                dimensions,
                false, // no grayscale for front
              );

              // Upload the (transformed) file to Cloudinary
              const uploadResult = await uploadToCloudinary(fileToUpload);

              // Replace local file data with Cloudinary URL
              processedItem.uploadedFile = {
                ...item.uploadedFile,
                cloudinaryUrl: uploadResult.url,
                publicId: uploadResult.publicId,
                // Remove the actual file object to avoid sending it to backend
                file: undefined,
                base64: undefined,
                previewUrl: undefined,
              };
            } catch (uploadError) {
              console.error("File upload failed:", uploadError);
              throw new Error(
                `Failed to upload ${item.uploadedFile.fileName}. Please try again.`,
              );
            }
          }

          // Process back file (for double-sided products)
          if (
            item.uploadedBackFile &&
            item.uploadedBackFile.file &&
            !item.uploadedBackFile.cloudinaryUrl
          ) {
            try {
              let fileToUpload = item.uploadedBackFile.file;

              // Always apply transformations for back file as well
              const dimensions = getPrintDimensions(
                item.category,
                item.options,
              );
              fileToUpload = await applyImageTransform(
                item.uploadedBackFile,
                dimensions,
                item.uploadedBackFile.applyGrayscale || false,
              );

              // Upload the (transformed) back file to Cloudinary
              const uploadResult = await uploadToCloudinary(fileToUpload);

              // Replace local file data with Cloudinary URL
              processedItem.uploadedBackFile = {
                ...item.uploadedBackFile,
                cloudinaryUrl: uploadResult.url,
                publicId: uploadResult.publicId,
                // Remove the actual file object to avoid sending it to backend
                file: undefined,
                base64: undefined,
                previewUrl: undefined,
              };
            } catch (uploadError) {
              console.error("Back file upload failed:", uploadError);
              throw new Error(
                `Failed to upload back design ${item.uploadedBackFile.fileName}. Please try again.`,
              );
            }
          }

          return processedItem;
        }),
      );

      // Create payment method with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: formData.customerName || currentUser?.name,
          email: formData.customerEmail || currentUser?.email,
          phone: formData.customerPhone,
          address: {
            line1: formData.billingAddress,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
          },
        },
      });

      if (error) {
        setNotification({
          message: getPaymentErrorMessage(error),
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      // Create order with payment method ID (never send raw card data!)
      const token = localStorage.getItem("jwt");
      const orderData = {
        // Note: userId is determined by backend from JWT token in Authorization header
        customerInfo: !currentUser
          ? {
              name: formData.customerName,
              email: formData.customerEmail,
              phone: formData.customerPhone,
            }
          : null,
        items: processedCartItems, // Use processed items with Cloudinary URLs
        total: calculateTotal(),
        paymentMethodId: paymentMethod.id, // Send only the Stripe payment method ID
        deliveryMethod: deliveryMethod,
        billingInfo: {
          billingAddress: formData.billingAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          shippingAddress:
            deliveryMethod === "pickup"
              ? PICKUP_LOCATION.address
              : sameAsBilling
                ? formData.billingAddress
                : formData.shippingAddress,
          shippingCity:
            deliveryMethod === "pickup"
              ? PICKUP_LOCATION.city
              : sameAsBilling
                ? formData.city
                : formData.shippingCity,
          shippingState:
            deliveryMethod === "pickup"
              ? PICKUP_LOCATION.state
              : sameAsBilling
                ? formData.state
                : formData.shippingState,
          shippingZipCode:
            deliveryMethod === "pickup"
              ? PICKUP_LOCATION.zipCode
              : sameAsBilling
                ? formData.zipCode
                : formData.shippingZipCode,
        },
        createdAt: new Date().toISOString(),
      };

      const result = await createOrder(orderData, token);

      // Clear cart and redirect to order summary immediately
      clearCart();
      navigate("/order-summary", { state: { orderData: result } });
    } catch (err) {
      console.error(err);
      setNotification({
        message: err.message || "Failed to place order. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="checkout">
      <div className="checkout__container">
        <h1 className="checkout__title">Checkout</h1>

        <div className="checkout__content">
          <form onSubmit={handleSubmit} className="checkout__form">
            {!currentUser && (
              <section className="checkout__section">
                <h2 className="checkout__section-title">
                  Customer Information
                </h2>

                <div className="checkout__field">
                  <label htmlFor="customerName" className="checkout__label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className={`checkout__input ${
                      errors.customerName ? "checkout__input_error" : ""
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.customerName && (
                    <span className="checkout__error">
                      {errors.customerName}
                    </span>
                  )}
                </div>

                <div className="checkout__field">
                  <label htmlFor="customerEmail" className="checkout__label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className={`checkout__input ${
                      errors.customerEmail ? "checkout__input_error" : ""
                    }`}
                    placeholder="example@email.com"
                  />
                  {errors.customerEmail && (
                    <span className="checkout__error">
                      {errors.customerEmail}
                    </span>
                  )}
                </div>

                <div className="checkout__field">
                  <label htmlFor="customerPhone" className="checkout__label">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className={`checkout__input ${
                      errors.customerPhone ? "checkout__input_error" : ""
                    }`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.customerPhone && (
                    <span className="checkout__error">
                      {errors.customerPhone}
                    </span>
                  )}
                </div>
              </section>
            )}

            <section className="checkout__section">
              <h2 className="checkout__section-title">Payment Information</h2>
              <p className="checkout__section-description">
                Your payment is secured by Stripe. We never see or store your
                card details.
              </p>
              <PaymentForm
                onPaymentMethodReady={setIsCardReady}
                isProcessing={isSubmitting}
              />
              {errors.payment && (
                <span className="checkout__error">{errors.payment}</span>
              )}
            </section>

            <section className="checkout__section">
              <h2 className="checkout__section-title">Billing Address</h2>

              <div className="checkout__field">
                <label htmlFor="billingAddress" className="checkout__label">
                  Street Address *
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
                    City *
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
                    State *
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
                    ZIP Code *
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
              <h2 className="checkout__section-title">Delivery Method</h2>

              <div className="checkout__delivery-options">
                <label className="checkout__radio-label">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="shipping"
                    checked={deliveryMethod === "shipping"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="checkout__radio"
                  />
                  <div className="checkout__radio-content">
                    <span className="checkout__radio-title">
                      Ship to Address
                    </span>
                    <span className="checkout__radio-description">
                      We'll ship your order to your specified address
                    </span>
                  </div>
                </label>

                <label className="checkout__radio-label">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === "pickup"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="checkout__radio"
                  />
                  <div className="checkout__radio-content">
                    <span className="checkout__radio-title">
                      Store Pickup (Free)
                    </span>
                    <span className="checkout__radio-description">
                      Pick up your order at our store
                    </span>
                  </div>
                </label>
              </div>

              {deliveryMethod === "pickup" && (
                <div className="checkout__pickup-info">
                  <h3 className="checkout__pickup-title">Pickup Location:</h3>
                  <p className="checkout__pickup-address">
                    <strong>{PICKUP_LOCATION.name}</strong>
                    <br />
                    {PICKUP_LOCATION.address}
                    <br />
                    {PICKUP_LOCATION.city}, {PICKUP_LOCATION.state}{" "}
                    {PICKUP_LOCATION.zipCode}
                    <br />
                    {PICKUP_LOCATION.phone}
                    <br />
                    <em>{PICKUP_LOCATION.hours}</em>
                  </p>
                </div>
              )}
            </section>

            {deliveryMethod === "shipping" && (
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
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="shippingAddress"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        className={`checkout__input ${
                          errors.shippingAddress ? "checkout__input_error" : ""
                        }`}
                        placeholder="123 Main St"
                      />
                      {errors.shippingAddress && (
                        <span className="checkout__error">
                          {errors.shippingAddress}
                        </span>
                      )}
                    </div>

                    <div className="checkout__row">
                      <div className="checkout__field">
                        <label
                          htmlFor="shippingCity"
                          className="checkout__label"
                        >
                          City *
                        </label>
                        <input
                          type="text"
                          id="shippingCity"
                          name="shippingCity"
                          value={formData.shippingCity}
                          onChange={handleInputChange}
                          className={`checkout__input ${
                            errors.shippingCity ? "checkout__input_error" : ""
                          }`}
                          placeholder="New York"
                        />
                        {errors.shippingCity && (
                          <span className="checkout__error">
                            {errors.shippingCity}
                          </span>
                        )}
                      </div>

                      <div className="checkout__field">
                        <label
                          htmlFor="shippingState"
                          className="checkout__label"
                        >
                          State *
                        </label>
                        <input
                          type="text"
                          id="shippingState"
                          name="shippingState"
                          value={formData.shippingState}
                          onChange={handleInputChange}
                          className={`checkout__input ${
                            errors.shippingState ? "checkout__input_error" : ""
                          }`}
                          placeholder="NY"
                        />
                        {errors.shippingState && (
                          <span className="checkout__error">
                            {errors.shippingState}
                          </span>
                        )}
                      </div>

                      <div className="checkout__field">
                        <label
                          htmlFor="shippingZipCode"
                          className="checkout__label"
                        >
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          id="shippingZipCode"
                          name="shippingZipCode"
                          value={formData.shippingZipCode}
                          onChange={handleInputChange}
                          className={`checkout__input ${
                            errors.shippingZipCode
                              ? "checkout__input_error"
                              : ""
                          }`}
                          placeholder="10001"
                        />
                        {errors.shippingZipCode && (
                          <span className="checkout__error">
                            {errors.shippingZipCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

            <section className="checkout__section checkout__turnaround">
              <h3 className="checkout__turnaround-title">Turnaround Times</h3>
              <div className="checkout__turnaround-info">
                <p className="checkout__turnaround-item">
                  <strong>Standard Orders:</strong> 5-7 business
                  days
                </p>
                <p className="checkout__turnaround-item">
                  <strong>Custom Orders:</strong> 7-10 business
                  days
                </p>
                <p className="checkout__turnaround-item">
                  <strong>Rush Orders:</strong> Please call to confirm availability
                </p>
              </div>
            </section>

            <section className="checkout__section checkout__terms">
              <div className="checkout__terms-notice">
                <p className="checkout__terms-heading">
                  Are you sure you want to submit your order?
                </p>
                <p className="checkout__terms-text">
                  Please review all details and attached files carefully before
                  submitting.
                </p>
                <p className="checkout__terms-warning">
                  All sales are final once an order has been submitted. Due to
                  the custom nature of our printing services, cancellations are
                  not permitted, and full charges will apply.*
                </p>
              </div>

              <label className="checkout__terms-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="checkout__terms-checkbox"
                  required
                />
                <span className="checkout__terms-agreement">
                  I accept the terms and conditions *
                </span>
              </label>
            </section>

            <button
              type="submit"
              className="checkout__submit"
              disabled={isSubmitting || !termsAccepted}
            >
              {isSubmitting ? (
                <span className="checkout__submit-content">
                  <span className="checkout__spinner"></span>
                  Processing Payment...
                </span>
              ) : (
                "Place Order"
              )}
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
                      {item.options.paperType} • Qty: {item.options.quantity}
                      {item.options.size && ` • ${item.options.size}`}
                      {item.options.color && ` • ${item.options.color}`}
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
                  {deliveryMethod === "pickup" ? (
                    "FREE (Pickup)"
                  ) : isCalculatingShipping ? (
                    <span className="checkout__calculating">
                      <span className="checkout__calculating-spinner"></span>
                      Calculating...
                    </span>
                  ) : shippingCost !== null ? (
                    shippingCost === 10 ? (
                      "$10.00 (Local Delivery)"
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )
                  ) : (
                    "Enter ZIP code"
                  )}
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
      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
          onClose={() => {
            if (notification.type === "success") {
              clearCart();
              if (currentUser) {
                navigate("/profile");
              } else {
                // Navigate to order summary for guests
                navigate("/order-summary", {
                  state: {
                    orderData: {
                      customerInfo: {
                        name: formData.customerName,
                        email: formData.customerEmail,
                        phone: formData.customerPhone,
                      },
                      items: cartItems,
                      total: calculateTotal(),
                      billingInfo: formData,
                      createdAt: new Date().toISOString(),
                    },
                  },
                });
              }
            }
            setNotification(null);
          }}
        />
      )}
    </main>
  );
}

export default Checkout;
