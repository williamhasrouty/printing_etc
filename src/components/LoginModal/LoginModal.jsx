import { useState } from "react";
import ModalWithForm from "../ModalWithForm/ModalWithForm";
import { forgotPassword } from "../../utils/api";

function LoginModal({ onClose, onLogin, onRegisterClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

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

    onLogin(email, password, rememberMe)
      .catch((err) => {
        setErrors({ submit: "Login failed. Please check your credentials." });
        console.error(err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!isValidEmail(forgotPasswordEmail)) {
      setForgotPasswordMessage("Please enter a valid email address");
      return;
    }

    setIsSendingReset(true);
    setForgotPasswordMessage("");

    forgotPassword(forgotPasswordEmail)
      .then((response) => {
        setForgotPasswordMessage(
          response.message ||
            "If an account exists with this email, you will receive password reset instructions shortly.",
        );
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordEmail("");
          setForgotPasswordMessage("");
          setIsSendingReset(false);
        }, 4000);
      })
      .catch((err) => {
        console.error("Forgot password error:", err);
        setForgotPasswordMessage(
          "Unable to process request. Please try again later.",
        );
        setIsSendingReset(false);
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

      <div className="modal__remember-row">
        <label htmlFor="remember-me" className="modal__label modal__checkbox">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />{" "}
          Remember me
        </label>

        <button
          type="button"
          className="modal__link"
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </button>
      </div>

      {errors.submit && <span className="modal__error">{errors.submit}</span>}

      {showForgotPassword && (
        <div className="modal__forgot-password">
          <h4 className="modal__forgot-title">Reset Password</h4>
          <p className="modal__forgot-text">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
          <input
            type="email"
            className="modal__input"
            placeholder="Email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
          {forgotPasswordMessage && (
            <p
              className={
                forgotPasswordMessage.includes("valid")
                  ? "modal__error"
                  : "modal__success"
              }
            >
              {forgotPasswordMessage}
            </p>
          )}
          <div className="modal__forgot-actions">
            <button
              type="button"
              className="modal__forgot-btn modal__forgot-btn_submit"
              onClick={handleForgotPassword}
              disabled={isSendingReset}
            >
              {isSendingReset ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              className="modal__forgot-btn modal__forgot-btn_cancel"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail("");
                setForgotPasswordMessage("");
              }}
              disabled={isSendingReset}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </ModalWithForm>
  );
}

export default LoginModal;
