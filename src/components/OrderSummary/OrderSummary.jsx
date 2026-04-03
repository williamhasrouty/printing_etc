import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./OrderSummary.css";

function OrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  // Redirect if no order data
  useEffect(() => {
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="order-summary">
      <div className="order-summary__container">
        <div className="order-summary__success-icon">✓</div>
        <h1 className="order-summary__title">Order Placed Successfully!</h1>
        <p className="order-summary__subtitle">
          Thank you for your order. We've received your request and sent an
          email confirmation to{" "}
          {orderData.guestInfo?.email || orderData.customerInfo?.email}.
        </p>

        <div className="order-summary__content">
          <section className="order-summary__section">
            <h2 className="order-summary__section-title">Order Details</h2>
            <div className="order-summary__info">
              {orderData.orderNumber && (
                <div className="order-summary__info-row">
                  <span className="order-summary__label">Order Number:</span>
                  <span className="order-summary__value order-summary__order-number">
                    {orderData.orderNumber}
                  </span>
                </div>
              )}
              <div className="order-summary__info-row">
                <span className="order-summary__label">Order Date:</span>
                <span className="order-summary__value">
                  {formatDate(orderData.createdAt)}
                </span>
              </div>
              <div className="order-summary__info-row">
                <span className="order-summary__label">Order Total:</span>
                <span className="order-summary__value">${orderData.total}</span>
              </div>
            </div>
          </section>

          {(orderData.customerInfo || orderData.guestInfo) && (
            <section className="order-summary__section">
              <h2 className="order-summary__section-title">
                Customer Information
              </h2>
              <div className="order-summary__info">
                <div className="order-summary__info-row">
                  <span className="order-summary__label">Name:</span>
                  <span className="order-summary__value">
                    {orderData.customerInfo?.name || orderData.guestInfo?.name}
                  </span>
                </div>
                <div className="order-summary__info-row">
                  <span className="order-summary__label">Email:</span>
                  <span className="order-summary__value">
                    {orderData.customerInfo?.email ||
                      orderData.guestInfo?.email}
                  </span>
                </div>
                <div className="order-summary__info-row">
                  <span className="order-summary__label">Phone:</span>
                  <span className="order-summary__value">
                    {orderData.customerInfo?.phone ||
                      orderData.guestInfo?.phone}
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="order-summary__section">
            <h2 className="order-summary__section-title">Items Ordered</h2>
            <div className="order-summary__items">
              {orderData.items.map((item, index) => (
                <div key={item._id || index} className="order-summary__item">
                  <img
                    src={item.product?.imageUrl || item.imageUrl}
                    alt={item.productName || item.name}
                    className="order-summary__item-image"
                  />
                  <div className="order-summary__item-info">
                    <p className="order-summary__item-name">
                      {item.productName || item.name}
                    </p>
                    <p className="order-summary__item-details">
                      {item.selectedOptions?.paperType} • Qty: {item.quantity}
                      {item.selectedOptions?.size &&
                        ` • ${item.selectedOptions.size}`}
                      {item.selectedOptions?.color &&
                        ` • ${item.selectedOptions.color}`}
                    </p>
                  </div>
                  <p className="order-summary__item-price">
                    ${(item.totalPrice || item.price || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {orderData.shippingAddress?.street && (
            <section className="order-summary__section">
              <h2 className="order-summary__section-title">Shipping Address</h2>
              <div className="order-summary__info">
                <p className="order-summary__address">
                  {orderData.shippingAddress.street}
                  <br />
                  {orderData.shippingAddress.city},{" "}
                  {orderData.shippingAddress.state}{" "}
                  {orderData.shippingAddress.zipCode}
                  <br />
                  {orderData.shippingAddress.country}
                </p>
              </div>
            </section>
          )}

          <div className="order-summary__actions">
            <Link to="/" className="order-summary__button">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default OrderSummary;
