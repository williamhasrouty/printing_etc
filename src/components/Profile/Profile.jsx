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
    if (token) {
      getUserOrders(token)
        .then((data) => {
          // Sort orders by creation date (newest first) or by id if no createdAt
          const sortedOrders = data.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Fallback to id comparison if no createdAt
            return (b.id || "").localeCompare(a.id || "");
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
  }, []);

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
          <h1 className="profile__title">My Profile</h1>

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
                    <span className="profile__order-id">
                      Order #
                      {(order?._id || order?.id || index).toString().slice(-6)}
                    </span>
                    {order?.createdAt && (
                      <span className="profile__order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="profile__order-items">
                    {order?.items?.map((item, index) => (
                      <p key={index} className="profile__order-item">
                        {item.name} - Qty: {item?.options?.quantity || 1}
                      </p>
                    )) || <p>No items</p>}
                  </div>
                  <div className="profile__order-footer">
                    <span className="profile__order-status">
                      Status: {order?.status || "Processing"}
                    </span>
                    <span className="profile__order-total">
                      ${order?.total || "0.00"}
                    </span>
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
