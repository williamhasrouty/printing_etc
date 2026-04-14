import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import CartContext from "../../contexts/CartContext";
import { getUserOrders } from "../../utils/api";
import { getStoredToken, updateUser, updatePassword } from "../../utils/auth";
import "./Profile.css";

function Profile() {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [email, setEmail] = useState(currentUser?.email || "");
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(currentUser?.email || "");
    setName(currentUser?.name || "");
    setPhone(currentUser?.phone || "");
  }, [currentUser]);

  const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleReorder = (order) => {
    // Convert order items to cart format
    order.items.forEach((item) => {
      const cartItem = {
        productId: item.product?._id || item.product,
        name: item.productName || item.name,
        imageUrl: item.productImage || item.product?.imageUrl,
        category: item.productCategory || item.product?.category,
        options: item.selectedOptions || {},
        uploadedFile: null, // Can't restore uploaded files from previous orders
        uploadedBackFile: null,
        shippingCost: 0,
        quantity: 1,
        price: item.price || 0,
      };
      addToCart(cartItem);
    });

    // Show success message
    setMessage("Items added to cart! Redirecting...");

    // Navigate to cart after a short delay
    setTimeout(() => {
      navigate("/cart");
    }, 1000);
  };

  useEffect(() => {
    const token = getStoredToken();
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

    const token = getStoredToken();
    updateUser({ name }, token)
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

  const handleUpdatePhone = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    const token = getStoredToken();
    updateUser({ phone }, token)
      .then((updatedUser) => {
        if (setCurrentUser) {
          setCurrentUser(updatedUser);
        }
        setPhone(updatedUser?.phone || "");
        setMessage("Phone number updated successfully");
        setIsEditingPhone(false);
        setTimeout(() => setMessage(""), 3000);
      })
      .catch((err) => {
        setError("Failed to update phone number");
        console.error(err);
      });
  };

  const handleUpdateEmail = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const token = getStoredToken();
    updateUser({ email }, token)
      .then((updatedUser) => {
        if (setCurrentUser) {
          setCurrentUser(updatedUser);
        }
        setEmail(updatedUser?.email || "");
        setMessage("Email updated successfully");
        setIsEditingEmail(false);
        setTimeout(() => setMessage(""), 3000);
      })
      .catch((err) => {
        const msg = String(err);
        if (msg.includes("409") || msg.toLowerCase().includes("exists")) {
          setError("This email is already in use.");
        } else {
          setError("Failed to update email");
        }
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

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const token = getStoredToken();
    updatePassword(currentPassword, newPassword, token)
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

            <div className="profile__detail">
              <span className="profile__detail-label">Email:</span>
              {!isEditingEmail ? (
                <div className="profile__detail-content">
                  <span className="profile__detail-value">
                    {currentUser?.email || ""}
                  </span>
                  <button
                    className="profile__edit-btn"
                    onClick={() => setIsEditingEmail(true)}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleUpdateEmail}
                  className="profile__edit-form"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="profile__input"
                    placeholder="Email"
                  />
                  <button type="submit" className="profile__save-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="profile__cancel-btn"
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmail(currentUser?.email || "");
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            <div className="profile__detail">
              <span className="profile__detail-label">Phone:</span>
              {!isEditingPhone ? (
                <div className="profile__detail-content">
                  <span className="profile__detail-value">
                    {currentUser?.phone || "Not added"}
                  </span>
                  <button
                    className="profile__edit-btn"
                    onClick={() => setIsEditingPhone(true)}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleUpdatePhone}
                  className="profile__edit-form"
                >
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="profile__input"
                    placeholder="(123) 456-7890"
                  />
                  <button type="submit" className="profile__save-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="profile__cancel-btn"
                    onClick={() => {
                      setIsEditingPhone(false);
                      setPhone(currentUser?.phone || "");
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

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
                    placeholder="Current Password*"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="profile__input"
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 8 characters)*"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="profile__input"
                    minLength={8}
                  />
                  {newPassword.length > 0 && newPassword.length < 8 && (
                    <span
                      className="profile__error"
                      style={{
                        fontSize: "14px",
                        color: "#ff4444",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      Password must be at least 8 characters long
                    </span>
                  )}
                  <input
                    type="password"
                    placeholder="Confirm New Password*"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="profile__input"
                  />
                  {confirmPassword.length > 0 &&
                    newPassword !== confirmPassword && (
                      <span
                        className="profile__error"
                        style={{
                          fontSize: "14px",
                          color: "#ff4444",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        Passwords do not match
                      </span>
                    )}
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
                          {order.deliveryMethod === "pickup"
                            ? "Pickup Location"
                            : "Shipping Address"}
                        </h4>
                        <p className="profile__order-address">
                          {order.shippingAddress.street &&
                            `${order.shippingAddress.street}, `}
                          {order.shippingAddress.city &&
                            `${order.shippingAddress.city}, `}
                          {order.shippingAddress.state &&
                            `${order.shippingAddress.state} `}
                          {order.shippingAddress.zipCode}
                          {order.deliveryMethod === "pickup" && (
                            <>
                              <br />
                              <em style={{ fontSize: "14px", color: "#666" }}>
                                (Store Pickup - FREE)
                              </em>
                            </>
                          )}
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
                    <button
                      type="button"
                      className="profile__reorder-btn"
                      onClick={() => handleReorder(order)}
                      title="Add these items to your cart again"
                    >
                      <svg
                        className="profile__reorder-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reorder
                    </button>
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
