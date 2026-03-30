import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./PaymentForm.css";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#666",
      fontFamily: '"Roboto", Arial, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#999",
      },
    },
    invalid: {
      color: "#ff6b6b",
      iconColor: "#ff6b6b",
    },
  },
  hidePostalCode: true, // We'll collect this separately in billing address
};

function PaymentForm({ onPaymentMethodReady, isProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isCardComplete, setIsCardComplete] = useState(false);

  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : null);
    setIsCardComplete(event.complete);

    // Notify parent when card is ready
    if (onPaymentMethodReady) {
      onPaymentMethodReady(event.complete && !event.error);
    }
  };

  return (
    <div className="payment-form">
      <div className="payment-form__card-element">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={handleCardChange}
        />
      </div>
      {error && <div className="payment-form__error">{error}</div>}
      <div className="payment-form__secure-notice">
        <svg
          className="payment-form__lock-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
        <span className="payment-form__secure-text">
          Your payment information is encrypted and secured by Stripe
        </span>
      </div>
    </div>
  );
}

export default PaymentForm;
