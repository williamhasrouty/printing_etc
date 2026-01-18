import { useState } from "react";
import ModalWithForm from "../ModalWithForm/ModalWithForm";

function RegisterModal({ onClose, onRegister, onLoginClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accountType, setAccountType] = useState("individual"); // 'individual' or 'business'
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    email.includes("@") &&
    password.length >= 6 &&
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

    onRegister(email, password, name)
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
    >
      <label htmlFor="register-email" className="modal__label">
        Email
        <input
          type="email"
          id="register-email"
          className="modal__input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label htmlFor="register-password" className="modal__label">
        Password
        <input
          type="password"
          id="register-password"
          className="modal__input"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
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
            First Name
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
            Last Name
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
