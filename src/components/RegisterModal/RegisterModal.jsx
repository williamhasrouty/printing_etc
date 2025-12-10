import { useState } from "react";
import ModalWithForm from "../ModalWithForm/ModalWithForm";

function RegisterModal({ onClose, onRegister, onLoginClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    email.includes("@") && password.length >= 6 && name.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

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

      <label htmlFor="register-name" className="modal__label">
        Name
        <input
          type="text"
          id="register-name"
          className="modal__input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      {errors.submit && <span className="modal__error">{errors.submit}</span>}
    </ModalWithForm>
  );
}

export default RegisterModal;
