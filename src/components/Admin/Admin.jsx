import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { getAllOrders, updateOrderStatus } from "../../utils/api";
import "./Admin.css";

function Admin() {
  const { currentUser, isCheckingAuth } = useContext(CurrentUserContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!isCheckingAuth && (!currentUser || currentUser.role !== "admin")) {
      navigate("/");
    }
  }, [currentUser, isCheckingAuth, navigate]);

  // Fetch all orders
  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      const token = localStorage.getItem("jwt");
      setIsLoading(true);

      getAllOrders(token)
        .then((data) => {
          setOrders(data);
          setFilteredOrders(data);
        })
        .catch((err) => {
          console.error("Failed to fetch orders:", err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [currentUser]);

  // Filter orders based on status and search
  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by search query (order number, customer name, email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        const orderNumber = order.orderNumber?.toLowerCase() || "";
        const customerName =
          order.user?.name?.toLowerCase() ||
          order.guestInfo?.name?.toLowerCase() ||
          "";
        const customerEmail =
          order.user?.email?.toLowerCase() ||
          order.guestInfo?.email?.toLowerCase() ||
          "";

        return (
          orderNumber.includes(query) ||
          customerName.includes(query) ||
          customerEmail.includes(query)
        );
      });
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery]);

  const handleStatusUpdate = async (
    orderId,
    newStatus,
    trackingNumber = "",
  ) => {
    setIsUpdatingStatus(true);
    setUpdateError("");
    setUpdateSuccess("");

    const token = localStorage.getItem("jwt");
    const statusData = { status: newStatus };
    if (trackingNumber.trim()) {
      statusData.trackingNumber = trackingNumber;
    }

    try {
      const updatedOrder = await updateOrderStatus(orderId, statusData, token);

      // Update the orders list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder._id === updatedOrder._id) {
        setSelectedOrder(updatedOrder);
      }

      setUpdateSuccess(`Order status updated to "${newStatus}"`);
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update order status:", err);
      setUpdateError("Failed to update order status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    // Open Cloudinary URL in new tab for download
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, "");
    // Format as (123) 456-7890
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    // Return original if not 10 digits
    return phone;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: "admin__status-badge_pending",
      confirmed: "admin__status-badge_confirmed",
      processing: "admin__status-badge_processing",
      shipped: "admin__status-badge_shipped",
      delivered: "admin__status-badge_delivered",
      completed: "admin__status-badge_completed",
      cancelled: "admin__status-badge_cancelled",
    };
    return `admin__status-badge ${statusMap[status] || ""}`;
  };

  if (isCheckingAuth || isLoading) {
    return (
      <main className="admin">
        <div className="admin__loading">Loading...</div>
      </main>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return (
    <main className="admin">
      <div className="admin__container">
        <div className="admin__header">
          <h1 className="admin__title">Admin Dashboard</h1>
          <p className="admin__subtitle">Manage orders and track shipments</p>
        </div>

        <div className="admin__controls">
          <div className="admin__search">
            <input
              type="text"
              className="admin__search-input"
              placeholder="Search by order number, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin__filter">
            <label htmlFor="statusFilter" className="admin__filter-label">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              className="admin__filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="admin__stats">
          <div className="admin__stat-card">
            <span className="admin__stat-value">{orders.length}</span>
            <span className="admin__stat-label">Total Orders</span>
          </div>
          <div className="admin__stat-card">
            <span className="admin__stat-value">
              {orders.filter((o) => o.status === "pending").length}
            </span>
            <span className="admin__stat-label">Pending</span>
          </div>
          <div className="admin__stat-card">
            <span className="admin__stat-value">
              {orders.filter((o) => o.status === "processing").length}
            </span>
            <span className="admin__stat-label">Processing</span>
          </div>
          <div className="admin__stat-card">
            <span className="admin__stat-value">
              {orders.filter((o) => o.status === "shipped").length}
            </span>
            <span className="admin__stat-label">Shipped</span>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="admin__empty">
            <p>No orders found</p>
          </div>
        ) : (
          <div className="admin__orders">
            {filteredOrders.map((order) => (
              <div key={order._id} className="admin__order-card">
                <div className="admin__order-header">
                  <div className="admin__order-info">
                    <h3 className="admin__order-number">
                      Order #{order.orderNumber}
                    </h3>
                    <span className="admin__order-date">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="admin__order-meta">
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                    <span className="admin__order-total">
                      ${(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="admin__order-customer">
                  <p className="admin__customer-name">
                    <strong>Customer:</strong>{" "}
                    {order.user?.name || order.guestInfo?.name || "Guest"}
                  </p>
                  <p className="admin__customer-email">
                    <strong>Email:</strong>{" "}
                    {order.user?.email || order.guestInfo?.email || "N/A"}
                  </p>
                  <p className="admin__customer-phone">
                    <strong>Phone:</strong>{" "}
                    {formatPhoneNumber(
                      order.user?.phone || order.guestInfo?.phone,
                    )}
                  </p>
                  {order.deliveryMethod === "pickup" ? (
                    <p className="admin__delivery-method">
                      <strong>Delivery:</strong> Store Pickup (FREE)
                    </p>
                  ) : (
                    <>
                      <p className="admin__shipping-address">
                        <strong>Shipping:</strong>{" "}
                        {order.shippingAddress?.street},{" "}
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state}{" "}
                        {order.shippingAddress?.zipCode}
                      </p>
                      {order.trackingNumber && (
                        <p className="admin__tracking">
                          <strong>Tracking:</strong> {order.trackingNumber}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="admin__order-items">
                  <h4 className="admin__items-title">Order Items:</h4>
                  {order.items?.map((item, index) => (
                    <div key={index} className="admin__item">
                      <div className="admin__item-header">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="admin__item-image"
                          />
                        )}
                        <div className="admin__item-details">
                          <div className="admin__item-info">
                            <span className="admin__item-name">
                              {item.productName || "Unknown Product"}
                            </span>
                            <span className="admin__item-price">
                              ${(item.price || 0).toFixed(2)} ×{" "}
                              {item.quantity ||
                                item.selectedOptions?.quantity ||
                                1}{" "}
                              = ${(item.totalPrice || 0).toFixed(2)}
                            </span>
                          </div>

                          {/* Product Options/Specifications */}
                          {item.selectedOptions &&
                            Object.keys(item.selectedOptions).length > 0 && (
                              <div className="admin__item-options">
                                <strong>Specifications:</strong>
                                <ul className="admin__options-list">
                                  {item.selectedOptions.paperType && (
                                    <li>
                                      Paper: {item.selectedOptions.paperType}
                                    </li>
                                  )}
                                  {item.selectedOptions.size && (
                                    <li>Size: {item.selectedOptions.size}</li>
                                  )}
                                  {item.selectedOptions.color && (
                                    <li>Color: {item.selectedOptions.color}</li>
                                  )}
                                  {item.selectedOptions.coating && (
                                    <li>
                                      Coating: {item.selectedOptions.coating}
                                    </li>
                                  )}
                                  {item.selectedOptions.corners && (
                                    <li>
                                      Corners: {item.selectedOptions.corners}
                                    </li>
                                  )}
                                  {item.selectedOptions.turnaround && (
                                    <li>
                                      Turnaround:{" "}
                                      {item.selectedOptions.turnaround}
                                    </li>
                                  )}
                                  {item.selectedOptions.quantity && (
                                    <li>
                                      Quantity: {item.selectedOptions.quantity}
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Display uploaded files with download buttons */}
                      {item.customizations?.files &&
                        item.customizations.files.length > 0 && (
                          <div className="admin__item-files">
                            <strong>📎 Uploaded Files:</strong>
                            <div className="admin__files-grid">
                              {item.customizations.files.map(
                                (file, fileIndex) => (
                                  <button
                                    key={fileIndex}
                                    type="button"
                                    className="admin__download-btn"
                                    onClick={() =>
                                      handleDownloadFile(file.url, file.name)
                                    }
                                    title="Download file"
                                  >
                                    📥 {file.name || `File ${fileIndex + 1}`}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                <div className="admin__order-actions">
                  <button
                    type="button"
                    className="admin__action-btn admin__action-btn_details"
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder?._id === order._id ? null : order,
                      )
                    }
                  >
                    {selectedOrder?._id === order._id
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </div>

                {/* Expanded order details */}
                {selectedOrder?._id === order._id && (
                  <div className="admin__order-details">
                    <h4 className="admin__details-title">
                      Update Order Status
                    </h4>

                    {updateError && (
                      <div className="admin__message admin__message_error">
                        {updateError}
                      </div>
                    )}

                    {updateSuccess && (
                      <div className="admin__message admin__message_success">
                        {updateSuccess}
                      </div>
                    )}

                    <div className="admin__status-update">
                      <div className="admin__status-buttons">
                        {/* Show different status flow based on delivery method */}
                        {order.deliveryMethod === "pickup"
                          ? [
                              "pending",
                              "confirmed",
                              "processing",
                              "completed",
                              "cancelled",
                            ].map((status) => (
                              <button
                                key={status}
                                type="button"
                                className={`admin__status-btn ${
                                  order.status === status
                                    ? "admin__status-btn_active"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleStatusUpdate(order._id, status)
                                }
                                disabled={
                                  isUpdatingStatus || order.status === status
                                }
                              >
                                {status}
                              </button>
                            ))
                          : [
                              "pending",
                              "confirmed",
                              "processing",
                              "shipped",
                              "delivered",
                              "cancelled",
                            ].map((status) => (
                              <button
                                key={status}
                                type="button"
                                className={`admin__status-btn ${
                                  order.status === status
                                    ? "admin__status-btn_active"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleStatusUpdate(order._id, status)
                                }
                                disabled={
                                  isUpdatingStatus || order.status === status
                                }
                              >
                                {status}
                              </button>
                            ))}
                      </div>

                      {order.deliveryMethod !== "pickup" && (
                        <div className="admin__tracking-input">
                          <label
                            htmlFor={`tracking-${order._id}`}
                            className="admin__tracking-label"
                          >
                            Tracking Number:
                          </label>
                          <div className="admin__tracking-form">
                            <input
                              type="text"
                              id={`tracking-${order._id}`}
                              className="admin__tracking-field"
                              placeholder="Enter tracking number"
                              defaultValue={order.trackingNumber || ""}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleStatusUpdate(
                                    order._id,
                                    "shipped",
                                    e.target.value,
                                  );
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="admin__tracking-submit"
                              onClick={(e) => {
                                const input = e.target.previousElementSibling;
                                handleStatusUpdate(
                                  order._id,
                                  "shipped",
                                  input.value,
                                );
                              }}
                              disabled={isUpdatingStatus}
                            >
                              Update & Ship
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="admin__order-summary">
                      <h4 className="admin__summary-title">Order Summary</h4>
                      <div className="admin__summary-row">
                        <span>Subtotal:</span>
                        <span>${(order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {order.tax > 0 && (
                        <div className="admin__summary-row">
                          <span>Tax:</span>
                          <span>${(order.tax || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="admin__summary-row">
                        <span>Shipping:</span>
                        <span>
                          {order.deliveryMethod === "pickup"
                            ? "FREE (Pickup)"
                            : `$${(order.shipping || 0).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="admin__summary-row admin__summary-total">
                        <span>Total:</span>
                        <span>${(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Admin;
