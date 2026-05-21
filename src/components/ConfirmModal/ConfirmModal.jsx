import { useEffect } from "react";
import "./ConfirmModal.css";

function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-modal" onClick={handleOverlayClick}>
      <div className="confirm-modal__content">
        <button
          onClick={onCancel}
          className="confirm-modal__close"
          type="button"
          aria-label="Close"
        >
          ×
        </button>
        <div className="confirm-modal__icon">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="confirm-modal__message">{message}</p>
        <div className="confirm-modal__buttons">
          <button
            onClick={onCancel}
            className="confirm-modal__button confirm-modal__button--cancel"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="confirm-modal__button confirm-modal__button--confirm"
            type="button"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
