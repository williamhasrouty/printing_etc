import { useEffect } from "react";
import "./NotificationModal.css";

function NotificationModal({ message, type = "success", onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="notification-modal" onClick={handleOverlayClick}>
      <div
        className={`notification-modal__content notification-modal__content--${type}`}
      >
        <button
          onClick={onClose}
          className="notification-modal__close"
          type="button"
          aria-label="Close"
        >
          ×
        </button>
        <div className="notification-modal__icon">
          {type === "success" ? "✓" : "⚠"}
        </div>
        <p className="notification-modal__message">{message}</p>
        <button
          onClick={onClose}
          className="notification-modal__button"
          type="button"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default NotificationModal;
