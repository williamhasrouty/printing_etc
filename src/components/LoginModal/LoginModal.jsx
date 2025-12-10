import { useState } from "react";
import ModalWithForm from "../ModalWithForm/ModalWithForm";

function LoginModal({ onClose, onLogin, onRegisterClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = email.includes("@") && password.length >= 6;

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
        Email
        <input
          type="email"
          id="login-email"
          className="modal__input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label htmlFor="login-password" className="modal__label">
        Password
        <input
          type="password"
          id="login-password"
          className="modal__input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </label>

      {errors.submit && <span className="modal__error">{errors.submit}</span>}
    </ModalWithForm>
  );
}

export default LoginModal;
