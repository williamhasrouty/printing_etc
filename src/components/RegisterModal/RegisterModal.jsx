import { useState } from "react";
import ModalWithForm from "../ModalWithForm/ModalWithForm";

function RegisterModal({ onClose, onRegister, onLoginClick, onGuestCheckout }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("individual"); // 'individual' or 'business'
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  const isValid =
    isValidEmail(email) &&
    isValidPassword(password) &&
    password === confirmPassword &&
    confirmPassword.length > 0 &&
    phone.replace(/\D/g, "").length >= 10 &&
    (accountType === "individual"
      ? firstName.trim().length > 0 && lastName.trim().length > 0
      : companyName.trim().length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const name =
      accountType === "individual"
        ? `${firstName.trim()} ${lastName.trim()}`
        : companyName.trim();

    // Strip formatting from phone number before sending to backend
    const cleanPhone = phone.replace(/\D/g, "");

    onRegister(email, password, name, cleanPhone)
      .catch((err) => {
        console.error("Registration error:", err);
        setErrors({
          submit: `Registration failed: ${err}`,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <ModalWithForm
      title="Sign Up"
      buttonText={isSubmitting ? "Signing up..." : "Sign Up"}
      onClose={onClose}
      onSubmit={handleSubmit}
      isValid={isValid && !isSubmitting}
      redirectText="or Log In"
      onRedirectClick={onLoginClick}
      guestCheckoutText="- Checkout as Guest -"
      onGuestCheckoutClick={onGuestCheckout}
    >
      <label htmlFor="register-email" className="modal__label">
        Email*
        <input
          type="email"
          id="register-email"
          className="modal__input"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {email.length > 0 && !isValidEmail(email) && (
          <span className="modal__error">
            Please enter a valid email address
          </span>
        )}
      </label>

      <label htmlFor="register-password" className="modal__label">
        Password*
        <input
          type="password"
          id="register-password"
          className="modal__input"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {password.length > 0 && !isValidPassword(password) && (
          <span className="modal__error">
            Password must be at least 8 characters long
          </span>
        )}
      </label>

      <label htmlFor="register-confirm-password" className="modal__label">
        Confirm Password*
        <input
          type="password"
          id="register-confirm-password"
          className="modal__input"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <span className="modal__error">Passwords do not match</span>
        )}
      </label>

      <label htmlFor="register-phone" className="modal__label">
        Phone Number*
        <input
          type="tel"
          id="register-phone"
          className="modal__input"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => {
            const value = e.target.value;
            // Format phone number as (123) 456-7890
            const formattedPhone = value
              .replace(/\D/g, "")
              .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
              .slice(0, 14);
            setPhone(formattedPhone);
          }}
          required
        />
      </label>

      <div className="modal__radio-group">
        <label className="modal__radio-label">
          <input
            type="radio"
            name="accountType"
            value="individual"
            checked={accountType === "individual"}
            onChange={(e) => setAccountType(e.target.value)}
          />
          Individual
        </label>
        <label className="modal__radio-label">
          <input
            type="radio"
            name="accountType"
            value="business"
            checked={accountType === "business"}
            onChange={(e) => setAccountType(e.target.value)}
          />
          Business
        </label>
      </div>

      {accountType === "individual" ? (
        <>
          <label htmlFor="register-firstName" className="modal__label">
            First Name*
            <input
              type="text"
              id="register-firstName"
              className="modal__input"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </label>

          <label htmlFor="register-lastName" className="modal__label">
            Last Name*
            <input
              type="text"
              id="register-lastName"
              className="modal__input"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </label>
        </>
      ) : (
        <label htmlFor="register-companyName" className="modal__label">
          Company/Business Name
          <input
            type="text"
            id="register-companyName"
            className="modal__input"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </label>
      )}

      {errors.submit && <span className="modal__error">{errors.submit}</span>}
    </ModalWithForm>
  );
}

export default RegisterModal;
