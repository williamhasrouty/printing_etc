import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../utils/api";
import "./ResetPassword.css";

function ResetPassword({ onLoginClick }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid password reset link");
    }
  }, [token]);

  const isValidPassword = (pwd) => {
    return pwd.length >= 8;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid password reset link");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    resetPassword(token, password)
      .then((response) => {
        setIsSuccess(true);
        setMessage(
          response.message ||
            "Password successfully reset. You can now log in with your new password.",
        );
        setTimeout(() => {
          navigate("/");
          if (onLoginClick) {
            onLoginClick();
          }
        }, 3000);
      })
      .catch((err) => {
        console.error("Reset password error:", err);
        setError(
          err.includes("expired")
            ? "This reset link has expired. Please request a new password reset."
            : "Unable to reset password. Please try again or request a new reset link.",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="reset-password">
      <div className="reset-password__container">
        <h1 className="reset-password__title">Reset Password</h1>

        {!token ? (
          <div className="reset-password__error">
            <p>Invalid or missing password reset link.</p>
            <button
              type="button"
              className="reset-password__back-btn"
              onClick={() => navigate("/")}
            >
              Return to Home
            </button>
          </div>
        ) : isSuccess ? (
          <div className="reset-password__success">
            <p className="reset-password__success-icon">✓</p>
            <p>{message}</p>
            <p className="reset-password__redirect">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-password__form">
            <p className="reset-password__instructions">
              Please enter your new password below.
            </p>

            <div className="reset-password__field">
              <label htmlFor="password" className="reset-password__label">
                New Password *
              </label>
              <input
                type="password"
                id="password"
                className="reset-password__input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              {password.length > 0 && !isValidPassword(password) && (
                <span className="reset-password__field-error">
                  Password must be at least 8 characters long
                </span>
              )}
            </div>

            <div className="reset-password__field">
              <label
                htmlFor="confirmPassword"
                className="reset-password__label"
              >
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="reset-password__input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <span className="reset-password__field-error">
                  Passwords do not match
                </span>
              )}
            </div>

            {error && <div className="reset-password__error">{error}</div>}
            {message && (
              <div className="reset-password__message">{message}</div>
            )}

            <button
              type="submit"
              className="reset-password__submit"
              disabled={
                isSubmitting ||
                !isValidPassword(password) ||
                password !== confirmPassword
              }
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>

            <button
              type="button"
              className="reset-password__back-btn"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
