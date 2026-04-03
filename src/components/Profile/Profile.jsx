import { useState, useEffect, useContext } from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { getUserOrders } from "../../utils/api";
import { updateUser, updatePassword } from "../../utils/auth";
import "./Profile.css";

function Profile() {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(currentUser?.name || "");
  }, [currentUser]);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token && currentUser) {
      getUserOrders(token)
        .then((data) => {
          // Backend already filters to current user via /orders/me endpoint
          // Sort orders by creation date (newest first)
          const sortedOrders = data.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Fallback to _id comparison if no createdAt
            return (b._id || "").localeCompare(a._id || "");
          });
          setOrders(sortedOrders);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [currentUser]);

  const handleUpdateName = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    updateUser(currentUser.id, name)
      .then((updatedUser) => {
        if (setCurrentUser) {
          setCurrentUser(updatedUser);
        }
        setMessage("Name updated successfully");
        setIsEditingName(false);
        setTimeout(() => setMessage(""), 3000);
      })
      .catch((err) => {
        setError("Failed to update name");
        console.error(err);
      });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    updatePassword(currentUser.id, currentPassword, newPassword)
      .then(() => {
        setMessage("Password updated successfully");
        setIsEditingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage(""), 3000);
      })
      .catch((err) => {
        setError(err);
      });
  };

  return (
    <main className="profile">
      <div className="profile__container">
        <section className="profile__info">
          <h1 className="profile__title">Customer Profile</h1>

          {message && (
            <p className="profile__message profile__message_success">
              {message}
            </p>
          )}
          {error && (
            <p className="profile__message profile__message_error">{error}</p>
          )}

          <div className="profile__details">
            <div className="profile__detail">
              <span className="profile__detail-label">Name:</span>
              {!isEditingName ? (
                <div className="profile__detail-content">
                  <span className="profile__detail-value">
                    {currentUser?.name || "User"}
                  </span>
                  <button
                    className="profile__edit-btn"
                    onClick={() => setIsEditingName(true)}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleUpdateName}
                  className="profile__edit-form"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="profile__input"
                  />
                  <button type="submit" className="profile__save-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="profile__cancel-btn"
                    onClick={() => {
                      setIsEditingName(false);
                      setName(currentUser?.name || "");
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            <p className="profile__detail">
              <span className="profile__detail-label">Email:</span>
              <span className="profile__detail-value">
                {currentUser?.email || ""}
              </span>
            </p>

            <div className="profile__detail">
              <span className="profile__detail-label">Password:</span>
              {!isEditingPassword ? (
                <div className="profile__detail-content">
                  <span className="profile__detail-value">••••••••</span>
                  <button
                    className="profile__edit-btn"
                    onClick={() => setIsEditingPassword(true)}
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleUpdatePassword}
                  className="profile__password-form"
                >
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="profile__input"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="profile__input"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="profile__input"
                  />
                  <div className="profile__form-buttons">
                    <button type="submit" className="profile__save-btn">
                      Update Password
                    </button>
                    <button
                      type="button"
                      className="profile__cancel-btn"
                      onClick={() => {
                        setIsEditingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="profile__orders">
          <h2 className="profile__subtitle">My Orders</h2>
          {isLoading ? (
            <p className="profile__loading">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="profile__empty">No orders yet</p>
          ) : (
            <div className="profile__order-list">
              {orders.map((order, index) => (
                <div
                  key={order?._id || order?.id || index}
                  className="profile__order"
                >
                  <div className="profile__order-header">
                    <div className="profile__order-header-info">
                      <span className="profile__order-number">
                        {order?.orderNumber ||
                          `Order #${(order?._id || order?.id || index).toString().slice(-6)}`}
                      </span>
                      {order?.createdAt && (
                        <span className="profile__order-date">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      )}
                    </div>
                    <span
                      className={`profile__order-status profile__order-status_${order?.status || "pending"}`}
                    >
                      {order?.status || "pending"}
                    </span>
                  </div>

                  <div className="profile__order-body">
                    <div className="profile__order-items">
                      {order?.items?.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="profile__order-item-card"
                        >
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName || item.name}
                              className="profile__order-item-image"
                            />
                          )}
                          <div className="profile__order-item-details">
                            <h4 className="profile__order-item-name">
                              {item.productName || item.name}
                            </h4>
                            {item.productCategory && (
                              <p className="profile__order-item-category">
                                {item.productCategory.replace(/-/g, " ")}
                              </p>
                            )}
                            {item.selectedOptions && (
                              <div className="profile__order-item-options">
                                {item.selectedOptions.quantity && (
                                  <span className="profile__order-item-option">
                                    Qty: {item.selectedOptions.quantity}
                                  </span>
                                )}
                                {item.selectedOptions.paperType && (
                                  <span className="profile__order-item-option">
                                    Paper: {item.selectedOptions.paperType}
                                  </span>
                                )}
                                {item.selectedOptions.size && (
                                  <span className="profile__order-item-option">
                                    Size: {item.selectedOptions.size}
                                  </span>
                                )}
                                {item.selectedOptions.color && (
                                  <span className="profile__order-item-option">
                                    {item.selectedOptions.color}
                                  </span>
                                )}
                                {item.selectedOptions.coating &&
                                  item.selectedOptions.coating !== "none" && (
                                    <span className="profile__order-item-option">
                                      Coating: {item.selectedOptions.coating}
                                    </span>
                                  )}
                              </div>
                            )}
                            {(item.uploadedFile?.cloudinaryUrl ||
                              item.uploadedFile?.fileName) && (
                              <p className="profile__order-item-file">
                                📎 Custom design:{" "}
                                {item.uploadedFile.fileName || "Uploaded"}
                              </p>
                            )}
                          </div>
                          <div className="profile__order-item-price">
                            ${(item.totalPrice || item.price || 0).toFixed(2)}
                          </div>
                        </div>
                      )) || <p>No items</p>}
                    </div>

                    {order?.shippingAddress && (
                      <div className="profile__order-shipping">
                        <h4 className="profile__order-section-title">
                          Shipping Address
                        </h4>
                        <p className="profile__order-address">
                          {order.shippingAddress.street &&
                            `${order.shippingAddress.street}, `}
                          {order.shippingAddress.city &&
                            `${order.shippingAddress.city}, `}
                          {order.shippingAddress.state &&
                            `${order.shippingAddress.state} `}
                          {order.shippingAddress.zipCode}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="profile__order-footer">
                    <div className="profile__order-summary">
                      <div className="profile__order-summary-row">
                        <span>Subtotal:</span>
                        <span>${(order?.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {order?.tax > 0 && (
                        <div className="profile__order-summary-row">
                          <span>Tax:</span>
                          <span>${(order.tax || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {order?.shipping > 0 && (
                        <div className="profile__order-summary-row">
                          <span>Shipping:</span>
                          <span>${(order.shipping || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="profile__order-summary-row profile__order-summary-total">
                        <span>Total:</span>
                        <span>${(order?.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
