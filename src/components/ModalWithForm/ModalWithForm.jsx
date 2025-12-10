import { useEffect } from "react";
import "./ModalWithForm.css";

function ModalWithForm({
  children,
  title,
  buttonText,
  onClose,
  onSubmit,
  isValid,
  redirectText,
  onRedirectClick,
}) {
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
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal__content">
        <button
          onClick={onClose}
          className="modal__close"
          type="button"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="modal__title">{title}</h2>
        <form onSubmit={onSubmit} className="modal__form">
          {children}
          <button type="submit" className="modal__submit" disabled={!isValid}>
            {buttonText}
          </button>
          {redirectText && (
            <button
              type="button"
              onClick={onRedirectClick}
              className="modal__redirect"
            >
              {redirectText}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ModalWithForm;
