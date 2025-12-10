import { useState, useEffect, useContext } from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { getUserOrders } from "../../utils/api";
import "./Profile.css";

function Profile() {
  const { currentUser } = useContext(CurrentUserContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      getUserOrders(token)
        .then((data) => {
          setOrders(data);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  return (
    <main className="profile">
      <div className="profile__container">
        <section className="profile__info">
          <h1 className="profile__title">My Profile</h1>
          <div className="profile__details">
            <p className="profile__detail">
              <span className="profile__detail-label">Name:</span>
              <span className="profile__detail-value">
                {currentUser?.name || "User"}
              </span>
            </p>
            <p className="profile__detail">
              <span className="profile__detail-label">Email:</span>
              <span className="profile__detail-value">
                {currentUser?.email || ""}
              </span>
            </p>
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
              {orders.map((order) => (
                <div key={order._id} className="profile__order">
                  <div className="profile__order-header">
                    <span className="profile__order-id">
                      Order #{order._id.slice(-6)}
                    </span>
                    <span className="profile__order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="profile__order-items">
                    {order.items.map((item, index) => (
                      <p key={index} className="profile__order-item">
                        {item.name} - Qty: {item.options.quantity}
                      </p>
                    ))}
                  </div>
                  <div className="profile__order-footer">
                    <span className="profile__order-status">
                      Status: {order.status || "Processing"}
                    </span>
                    <span className="profile__order-total">${order.total}</span>
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
