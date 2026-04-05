import { useState } from "react";
import ModalWithForm from "../ModalWithForm/ModalWithForm";

function LoginModal({ onClose, onLogin, onRegisterClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const isValid = isValidEmail(email) && isValidPassword(password);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    onLogin(email, password)
      .catch((err) => {
        setErrors({ submit: "Login failed. Please check your credentials." });
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <ModalWithForm
      title="Log In"
      buttonText={isSubmitting ? "Logging in..." : "Log In"}
      onClose={onClose}
      onSubmit={handleSubmit}
      isValid={isValid && !isSubmitting}
      redirectText="or Sign Up"
      onRedirectClick={onRegisterClick}
    >
      <label htmlFor="login-email" className="modal__label">
        Email*
        <input
          type="email"
          id="login-email"
          className="modal__input"
          placeholder="Email"
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

      <label htmlFor="login-password" className="modal__label">
        Password*
        <input
          type="password"
          id="login-password"
          className="modal__input"
          placeholder="Password"
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

      {errors.submit && <span className="modal__error">{errors.submit}</span>}
    </ModalWithForm>
  );
}

export default LoginModal;
