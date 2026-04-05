import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import {
  getAllOrders,
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../utils/api";
import "./Admin.css";

function Admin({ onProductsChange }) {
  const { currentUser, isCheckingAuth } = useContext(CurrentUserContext);
  const navigate = useNavigate();

  // Tab state - restore from localStorage
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("adminActiveTab") || "orders",
  ); // "orders" or "products"

  // Orders state
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Products state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [draggedProductId, setDraggedProductId] = useState(null);
  const [draggedOption, setDraggedOption] = useState(null);
  const [removeCategoryConfirm, setRemoveCategoryConfirm] = useState({
    isOpen: false,
    optionType: "",
    categoryLabel: "",
  });
  const [productFormData, setProductFormData] = useState({
    name: "",
    description: "",
    category: "",
    basePrice: "",
    imageUrl: "",
    options: {
      quantities: [],
      sizes: [],
      orientations: [],
      colors: [],
      paperTypes: [],
      roundedCorners: [],
      coatings: [],
      raisedPrint: [],
      finishes: [],
      customOptions: {}, // For admin-defined option categories
    },
    pricing: [], // Price matrix entries
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isCheckingAuth && (!currentUser || currentUser.role !== "admin")) {
      navigate("/");
    }
  }, [currentUser, isCheckingAuth, navigate]);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

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

  // Fetch all products when Products tab is active
  useEffect(() => {
    if (
      currentUser &&
      currentUser.role === "admin" &&
      activeTab === "products"
    ) {
      setIsLoadingProducts(true);
      getProducts()
        .then((data) => {
          setProducts(data);
          setFilteredProducts(data);
        })
        .catch((err) => {
          console.error("Failed to fetch products:", err);
        })
        .finally(() => setIsLoadingProducts(false));
    }
  }, [currentUser, activeTab]);

  // Filter products based on search
  useEffect(() => {
    let filtered = products;

    if (productSearchQuery.trim()) {
      const query = productSearchQuery.toLowerCase();
      filtered = filtered.filter((product) => {
        return (
          product.name?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredProducts(filtered);
  }, [products, productSearchQuery]);

  // Product management functions
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      basePrice: product.basePrice || "",
      imageUrl: product.imageUrl || "",
      options: {
        quantities: product.options?.quantities || [],
        sizes: product.options?.sizes || [],
        orientations: product.options?.orientations || [],
        colors: product.options?.colors || [],
        paperTypes: product.options?.paperTypes || [],
        roundedCorners: product.options?.roundedCorners || [],
        coatings: product.options?.coatings || [],
        raisedPrint: product.options?.raisedPrint || [],
        finishes: product.options?.finishes || [],
        customOptions: product.options?.customOptions || {},
      },
      pricing: product.pricing || [],
    });
    setIsAddingProduct(false);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      name: "",
      description: "",
      category: "",
      basePrice: "",
      imageUrl: "",
      options: {
        quantities: [],
        sizes: [],
        orientations: [],
        colors: [],
        paperTypes: [],
        roundedCorners: [],
        coatings: [],
        raisedPrint: [],
        finishes: [],
        customOptions: {},
      },
      pricing: [],
    });
    setIsAddingProduct(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwt");

    // Strip _id from option array items (added by Mongoose) so validation passes
    const stripIds = (arr) => (arr || []).map(({ _id, __v, ...rest }) => rest);
    const sanitizeOptionItem = (item) => {
      const cleaned = { ...item };

      // Joi.string() does not allow empty string by default.
      // Omit optional dimensions when left blank.
      if (
        typeof cleaned.dimensions === "string" &&
        !cleaned.dimensions.trim()
      ) {
        delete cleaned.dimensions;
      }

      return cleaned;
    };

    const cleanOptions = {};
    const optionArrayKeys = [
      "quantities",
      "sizes",
      "orientations",
      "paperTypes",
      "finishes",
      "colors",
      "roundedCorners",
      "coatings",
      "raisedPrint",
    ];
    optionArrayKeys.forEach((key) => {
      if (productFormData.options[key]) {
        cleanOptions[key] = stripIds(productFormData.options[key]).map(
          sanitizeOptionItem,
        );
      }
    });
    if (productFormData.options.customOptions) {
      cleanOptions.customOptions = {};
      Object.entries(productFormData.options.customOptions).forEach(
        ([k, v]) => {
          cleanOptions.customOptions[k] = {
            label: v.label,
            options: stripIds(v.options || []).map(sanitizeOptionItem),
          };
        },
      );
    }

    const cleanData = { ...productFormData, options: cleanOptions };
    console.log("Sending product data:", JSON.stringify(cleanData, null, 2));

    try {
      if (editingProduct) {
        // Update existing product
        const updated = await updateProduct(
          editingProduct._id,
          cleanData,
          token,
        );
        const updatedList = products.map((p) =>
          p._id === updated._id ? updated : p,
        );
        setProducts(updatedList);
        if (onProductsChange) onProductsChange(updatedList);
        setUpdateSuccess("Product updated successfully");
      } else {
        // Create new product
        const newProduct = await createProduct(cleanData, token);
        const createdList = [...products, newProduct];
        setProducts(createdList);
        if (onProductsChange) onProductsChange(createdList);
        setUpdateSuccess("Product created successfully");
      }
      setEditingProduct(null);
      setIsAddingProduct(false);
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      setUpdateError("Failed to save product: " + err);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setIsAddingProduct(false);
    setUpdateError("");
  };

  const moveItemInArray = (arr, fromIndex, toIndex) => {
    const next = [...arr];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  };

  const persistProductOrder = async (orderedProducts) => {
    const token = localStorage.getItem("jwt");

    try {
      await Promise.all(
        orderedProducts.map((product, index) =>
          updateProduct(product._id, { position: index }, token),
        ),
      );
      setUpdateSuccess("Product order updated");
      setTimeout(() => setUpdateSuccess(""), 2000);
    } catch (err) {
      setUpdateError("Failed to save product order: " + err);
    }
  };

  const handleProductDragStart = (productId) => {
    setDraggedProductId(productId);
  };

  const handleProductDrop = async (targetProductId) => {
    if (!draggedProductId || draggedProductId === targetProductId) {
      setDraggedProductId(null);
      return;
    }

    const fromIndex = products.findIndex((p) => p._id === draggedProductId);
    const toIndex = products.findIndex((p) => p._id === targetProductId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedProductId(null);
      return;
    }

    const reordered = moveItemInArray(products, fromIndex, toIndex);
    setProducts(reordered);
    if (onProductsChange) onProductsChange(reordered);
    await persistProductOrder(reordered);
    setDraggedProductId(null);
  };

  const handleOptionDragStart = (optionType, index) => {
    setDraggedOption({ kind: "standard", optionType, index });
  };

  const handleOptionDrop = (optionType, targetIndex) => {
    if (
      !draggedOption ||
      draggedOption.kind !== "standard" ||
      draggedOption.optionType !== optionType ||
      draggedOption.index === targetIndex
    ) {
      setDraggedOption(null);
      return;
    }

    const reordered = moveItemInArray(
      productFormData.options[optionType] || [],
      draggedOption.index,
      targetIndex,
    );

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        [optionType]: reordered,
      },
    });

    setDraggedOption(null);
  };

  const handleCustomOptionDragStart = (categoryKey, index) => {
    setDraggedOption({ kind: "custom", categoryKey, index });
  };

  const handleCustomOptionDrop = (categoryKey, targetIndex) => {
    if (
      !draggedOption ||
      draggedOption.kind !== "custom" ||
      draggedOption.categoryKey !== categoryKey ||
      draggedOption.index === targetIndex
    ) {
      setDraggedOption(null);
      return;
    }

    const currentOptions =
      productFormData.options.customOptions?.[categoryKey]?.options || [];
    const reordered = moveItemInArray(
      currentOptions,
      draggedOption.index,
      targetIndex,
    );

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        customOptions: {
          ...productFormData.options.customOptions,
          [categoryKey]: {
            ...productFormData.options.customOptions[categoryKey],
            options: reordered,
          },
        },
      },
    });

    setDraggedOption(null);
  };

  // Option management handlers
  const handleAddOption = (optionType) => {
    const newOption =
      optionType === "sizes"
        ? { name: "", dimensions: "", priceModifier: 0 }
        : { name: "", priceModifier: 0 };

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        [optionType]: [
          ...(productFormData.options[optionType] || []),
          newOption,
        ],
      },
    });
  };

  const handleAddCustomOptionCategory = () => {
    const categoryName = prompt(
      "Enter the name for this option category (e.g., 'Binding Type', 'Lamination'):",
    );
    if (!categoryName || categoryName.trim() === "") return;

    const categoryKey = categoryName.toLowerCase().replace(/\s+/g, "");

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        customOptions: {
          ...productFormData.options.customOptions,
          [categoryKey]: {
            label: categoryName,
            options: [],
          },
        },
      },
    });
  };

  const handleRemoveCustomOptionCategory = (categoryKey) => {
    const updatedCustomOptions = { ...productFormData.options.customOptions };
    delete updatedCustomOptions[categoryKey];

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        customOptions: updatedCustomOptions,
      },
    });
  };

  const handleAddCustomOption = (categoryKey) => {
    const newOption = { name: "", priceModifier: 0 };

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        customOptions: {
          ...productFormData.options.customOptions,
          [categoryKey]: {
            ...productFormData.options.customOptions[categoryKey],
            options: [
              ...productFormData.options.customOptions[categoryKey].options,
              newOption,
            ],
          },
        },
      },
    });
  };

  const handleRemoveCustomOption = (categoryKey, index) => {
    const updatedOptions = productFormData.options.customOptions[
      categoryKey
    ].options.filter((_, i) => i !== index);

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        customOptions: {
          ...productFormData.options.customOptions,
          [categoryKey]: {
            ...productFormData.options.customOptions[categoryKey],
            options: updatedOptions,
          },
        },
      },
    });
  };

  const handleUpdateCustomOption = (categoryKey, index, field, value) => {
    const updatedOptions = [
      ...productFormData.options.customOptions[categoryKey].options,
    ];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === "priceModifier" ? parseFloat(value) || 0 : value,
    };

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        customOptions: {
          ...productFormData.options.customOptions,
          [categoryKey]: {
            ...productFormData.options.customOptions[categoryKey],
            options: updatedOptions,
          },
        },
      },
    });
  };

  const handleRemoveOption = (optionType, index) => {
    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        [optionType]: productFormData.options[optionType].filter(
          (_, i) => i !== index,
        ),
      },
    });
  };

  const handleRemoveOptionCategory = (optionType) => {
    const categoryLabel = optionType.replace(/([A-Z])/g, " $1").toLowerCase();
    setRemoveCategoryConfirm({
      isOpen: true,
      optionType,
      categoryLabel,
    });
  };

  const confirmRemoveOptionCategory = () => {
    if (!removeCategoryConfirm.optionType) return;

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        [removeCategoryConfirm.optionType]: [],
      },
    });

    setRemoveCategoryConfirm({
      isOpen: false,
      optionType: "",
      categoryLabel: "",
    });
  };

  const cancelRemoveOptionCategory = () => {
    setRemoveCategoryConfirm({
      isOpen: false,
      optionType: "",
      categoryLabel: "",
    });
  };

  const handleUpdateOption = (optionType, index, field, value) => {
    const updatedOptions = [...productFormData.options[optionType]];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === "priceModifier" ? parseFloat(value) || 0 : value,
    };

    setProductFormData({
      ...productFormData,
      options: {
        ...productFormData.options,
        [optionType]: updatedOptions,
      },
    });
  };

  // Pricing matrix handlers
  const handleAddPricingEntry = () => {
    setProductFormData({
      ...productFormData,
      pricing: [
        ...(productFormData.pricing || []),
        {
          quantity: "",
          size: "",
          paperType: "",
          orientation: "",
          color: "",
          coating: "",
          finish: "",
          roundedCorner: "",
          raisedPrint: "",
          price: 0,
        },
      ],
    });
  };

  const handleUpdatePricingEntry = (index, field, value) => {
    const updatedPricing = [...(productFormData.pricing || [])];
    updatedPricing[index] = {
      ...updatedPricing[index],
      [field]: field === "price" ? parseFloat(value) || 0 : value,
    };

    setProductFormData({
      ...productFormData,
      pricing: updatedPricing,
    });
  };

  const handleRemovePricingEntry = (index) => {
    const updatedPricing = productFormData.pricing.filter(
      (_, i) => i !== index,
    );
    setProductFormData({
      ...productFormData,
      pricing: updatedPricing,
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const token = localStorage.getItem("jwt");
    try {
      await deleteProduct(productId, token);
      const deletedList = products.filter((p) => p._id !== productId);
      setProducts(deletedList);
      if (onProductsChange) onProductsChange(deletedList);
      setUpdateSuccess("Product deleted successfully");
      setTimeout(() => setUpdateSuccess(""), 3000);
    } catch (err) {
      setUpdateError("Failed to delete product: " + err);
    }
  };

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
          <p className="admin__subtitle">
            Manage orders, products, and inventory
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="admin__tabs">
          <button
            className={`admin__tab ${activeTab === "orders" ? "admin__tab_active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`admin__tab ${activeTab === "products" ? "admin__tab_active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
        </div>

        {/* Success/Error Messages */}
        {updateSuccess && (
          <div className="admin__message admin__message_success">
            {updateSuccess}
          </div>
        )}
        {updateError && (
          <div className="admin__message admin__message_error">
            {updateError}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
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
                                Object.keys(item.selectedOptions).length >
                                  0 && (
                                  <div className="admin__item-options">
                                    <strong>Specifications:</strong>
                                    <ul className="admin__options-list">
                                      {item.selectedOptions.paperType && (
                                        <li>
                                          Paper:{" "}
                                          {item.selectedOptions.paperType}
                                        </li>
                                      )}
                                      {item.selectedOptions.size && (
                                        <li>
                                          Size: {item.selectedOptions.size}
                                        </li>
                                      )}
                                      {item.selectedOptions.color && (
                                        <li>
                                          Color: {item.selectedOptions.color}
                                        </li>
                                      )}
                                      {item.selectedOptions.coating && (
                                        <li>
                                          Coating:{" "}
                                          {item.selectedOptions.coating}
                                        </li>
                                      )}
                                      {item.selectedOptions.corners && (
                                        <li>
                                          Corners:{" "}
                                          {item.selectedOptions.corners}
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
                                          Quantity:{" "}
                                          {item.selectedOptions.quantity}
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
                                          handleDownloadFile(
                                            file.url,
                                            file.name,
                                          )
                                        }
                                        title="Download file"
                                      >
                                        📥{" "}
                                        {file.name || `File ${fileIndex + 1}`}
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
                                      isUpdatingStatus ||
                                      order.status === status
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
                                      isUpdatingStatus ||
                                      order.status === status
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
                                    const input =
                                      e.target.previousElementSibling;
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
                          <h4 className="admin__summary-title">
                            Order Summary
                          </h4>
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
          </>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div className="admin__controls">
              <div className="admin__search">
                <input
                  type="text"
                  className="admin__search-input"
                  placeholder="Search products by name, category..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
              <button className="admin__add-btn" onClick={handleAddNewProduct}>
                + Add New Product
              </button>
            </div>

            {isLoadingProducts ? (
              <div className="admin__loading">Loading products...</div>
            ) : (
              <>
                {/* Product Form */}
                {(editingProduct || isAddingProduct) && (
                  <div className="admin__product-form">
                    <form onSubmit={handleSaveProduct} className="admin__form">
                      <div className="admin__form-top-bar">
                        <h3 className="admin__form-title">
                          {editingProduct ? "Edit Product" : "Add New Product"}
                        </h3>
                        <div className="admin__form-top-actions">
                          <button type="submit" className="admin__save-btn">
                            {editingProduct
                              ? "Update Product"
                              : "Create Product"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="admin__close-btn"
                            aria-label="Close product form"
                            title="Close"
                          >
                            x
                          </button>
                        </div>
                      </div>

                      <div className="admin__form-grid">
                        <div className="admin__form-field">
                          <label>Product Name *</label>
                          <input
                            type="text"
                            value={productFormData.name}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                name: e.target.value,
                              })
                            }
                            required
                            className="admin__form-input"
                          />
                        </div>

                        <div className="admin__form-field">
                          <label>Category *</label>
                          <select
                            value={productFormData.category}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                category: e.target.value,
                              })
                            }
                            required
                            className="admin__form-input"
                          >
                            <option value="">Select category</option>
                            <option value="business-cards">
                              Business Cards
                            </option>
                            <option value="flyers">Flyers</option>
                            <option value="brochures">Brochures</option>
                            <option value="banners">Banners</option>
                            <option value="posters">Posters</option>
                            <option value="stickers">Stickers</option>
                            <option value="invitations">Invitations</option>
                          </select>
                        </div>

                        <div className="admin__form-field">
                          <label>Base Price ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={productFormData.basePrice}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                basePrice: e.target.value,
                              })
                            }
                            required
                            className="admin__form-input"
                          />
                        </div>

                        <div className="admin__form-field">
                          <label>Image URL *</label>
                          <input
                            type="url"
                            value={productFormData.imageUrl}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                imageUrl: e.target.value,
                              })
                            }
                            required
                            className="admin__form-input"
                            placeholder="https://..."
                          />
                        </div>

                        <div className="admin__form-field admin__form-field_full">
                          <label>Description *</label>
                          <textarea
                            value={productFormData.description}
                            onChange={(e) =>
                              setProductFormData({
                                ...productFormData,
                                description: e.target.value,
                              })
                            }
                            required
                            className="admin__form-textarea"
                            rows="4"
                          />
                        </div>
                      </div>

                      {/* Product Options */}
                      <div className="admin__options-section">
                        <h4 className="admin__options-title">
                          Product Options & Pricing
                        </h4>

                        {/* Sizes */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">Sizes</label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() => handleAddOption("sizes")}
                                className="admin__add-option-btn"
                              >
                                + Add Size
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("sizes")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.sizes.map((size, index) => (
                            <div
                              key={index}
                              className="admin__option-item admin__option-item_draggable"
                              draggable
                              onDragStart={() =>
                                handleOptionDragStart("sizes", index)
                              }
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleOptionDrop("sizes", index)}
                            >
                              <input
                                type="text"
                                placeholder="Size name (e.g., Small, 4x6)"
                                value={size.name}
                                onChange={(e) =>
                                  handleUpdateOption(
                                    "sizes",
                                    index,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="admin__option-input"
                              />
                              <input
                                type="text"
                                placeholder="Dimensions (e.g., 4x6 inches)"
                                value={size.dimensions || ""}
                                onChange={(e) =>
                                  handleUpdateOption(
                                    "sizes",
                                    index,
                                    "dimensions",
                                    e.target.value,
                                  )
                                }
                                className="admin__option-input"
                              />
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Price modifier"
                                value={size.priceModifier}
                                onChange={(e) =>
                                  handleUpdateOption(
                                    "sizes",
                                    index,
                                    "priceModifier",
                                    e.target.value,
                                  )
                                }
                                className="admin__option-input admin__option-input_price"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOption("sizes", index)
                                }
                                className="admin__remove-option-btn"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Colors */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">
                              Colors
                            </label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() => handleAddOption("colors")}
                                className="admin__add-option-btn"
                              >
                                + Add Color
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("colors")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.colors.map(
                            (color, index) => (
                              <div
                                key={index}
                                className="admin__option-item admin__option-item_draggable"
                                draggable
                                onDragStart={() =>
                                  handleOptionDragStart("colors", index)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleOptionDrop("colors", index)}
                              >
                                <input
                                  type="text"
                                  placeholder="Color name (e.g., Full Color, Black & White)"
                                  value={color.name}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "colors",
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_name"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price modifier"
                                  value={color.priceModifier}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "colors",
                                      index,
                                      "priceModifier",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_price"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption("colors", index)
                                  }
                                  className="admin__remove-option-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Paper Types */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">
                              Paper Types
                            </label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() => handleAddOption("paperTypes")}
                                className="admin__add-option-btn"
                              >
                                + Add Paper Type
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("paperTypes")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.paperTypes.map(
                            (paper, index) => (
                              <div
                                key={index}
                                className="admin__option-item admin__option-item_draggable"
                                draggable
                                onDragStart={() =>
                                  handleOptionDragStart("paperTypes", index)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() =>
                                  handleOptionDrop("paperTypes", index)
                                }
                              >
                                <input
                                  type="text"
                                  placeholder="Paper type (e.g., Glossy, Matte, Premium)"
                                  value={paper.name}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "paperTypes",
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_name"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price modifier"
                                  value={paper.priceModifier}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "paperTypes",
                                      index,
                                      "priceModifier",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_price"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption("paperTypes", index)
                                  }
                                  className="admin__remove-option-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Finishes */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">
                              Finishes
                            </label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() => handleAddOption("finishes")}
                                className="admin__add-option-btn"
                              >
                                + Add Finish
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("finishes")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.finishes.map(
                            (finish, index) => (
                              <div
                                key={index}
                                className="admin__option-item admin__option-item_draggable"
                                draggable
                                onDragStart={() =>
                                  handleOptionDragStart("finishes", index)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() =>
                                  handleOptionDrop("finishes", index)
                                }
                              >
                                <input
                                  type="text"
                                  placeholder="Finish type (e.g., Laminated, UV Coating)"
                                  value={finish.name}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "finishes",
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_name"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price modifier"
                                  value={finish.priceModifier}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "finishes",
                                      index,
                                      "priceModifier",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_price"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption("finishes", index)
                                  }
                                  className="admin__remove-option-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Quantities */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">
                              Quantities
                            </label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() => handleAddOption("quantities")}
                                className="admin__add-option-btn"
                              >
                                + Add Quantity
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("quantities")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.quantities?.map(
                            (quantity, index) => (
                              <div
                                key={index}
                                className="admin__option-item admin__option-item_draggable"
                                draggable
                                onDragStart={() =>
                                  handleOptionDragStart("quantities", index)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() =>
                                  handleOptionDrop("quantities", index)
                                }
                              >
                                <input
                                  type="text"
                                  placeholder="Quantity (e.g., 100, 250, 500)"
                                  value={quantity.name}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "quantities",
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_name"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price ($)"
                                  value={quantity.priceModifier}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "quantities",
                                      index,
                                      "priceModifier",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_price"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption("quantities", index)
                                  }
                                  className="admin__remove-option-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Orientations */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">
                              Orientations
                            </label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() => handleAddOption("orientations")}
                                className="admin__add-option-btn"
                              >
                                + Add Orientation
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("orientations")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.orientations?.map(
                            (orientation, index) => (
                              <div
                                key={index}
                                className="admin__option-item admin__option-item_draggable"
                                draggable
                                onDragStart={() =>
                                  handleOptionDragStart("orientations", index)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() =>
                                  handleOptionDrop("orientations", index)
                                }
                              >
                                <input
                                  type="text"
                                  placeholder="Orientation (e.g., Vertical, Horizontal)"
                                  value={orientation.name}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "orientations",
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_name"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price modifier"
                                  value={orientation.priceModifier}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "orientations",
                                      index,
                                      "priceModifier",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_price"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption("orientations", index)
                                  }
                                  className="admin__remove-option-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Rounded Corners */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">
                              Rounded Corners
                            </label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddOption("roundedCorners")
                                }
                                className="admin__add-option-btn"
                              >
                                + Add Option
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("roundedCorners")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.roundedCorners?.map(
                            (corner, index) => (
                              <div
                                key={index}
                                className="admin__option-item admin__option-item_draggable"
                                draggable
                                onDragStart={() =>
                                  handleOptionDragStart("roundedCorners", index)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() =>
                                  handleOptionDrop("roundedCorners", index)
                                }
                              >
                                <input
                                  type="text"
                                  placeholder="Option (e.g., Yes, No, Standard, Premium)"
                                  value={corner.name}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "roundedCorners",
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_name"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price modifier"
                                  value={corner.priceModifier}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "roundedCorners",
                                      index,
                                      "priceModifier",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_price"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption("roundedCorners", index)
                                  }
                                  className="admin__remove-option-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Coatings */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">
                              Coatings
                            </label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() => handleAddOption("coatings")}
                                className="admin__add-option-btn"
                              >
                                + Add Coating
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("coatings")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.coatings?.map(
                            (coating, index) => (
                              <div
                                key={index}
                                className="admin__option-item admin__option-item_draggable"
                                draggable
                                onDragStart={() =>
                                  handleOptionDragStart("coatings", index)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() =>
                                  handleOptionDrop("coatings", index)
                                }
                              >
                                <input
                                  type="text"
                                  placeholder="Coating type (e.g., UV, Aqueous, Soft Touch)"
                                  value={coating.name}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "coatings",
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_name"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price modifier"
                                  value={coating.priceModifier}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "coatings",
                                      index,
                                      "priceModifier",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_price"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption("coatings", index)
                                  }
                                  className="admin__remove-option-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Raised Print */}
                        <div className="admin__option-group">
                          <div className="admin__option-header">
                            <label className="admin__option-label">
                              Raised Print
                            </label>
                            <div className="admin__option-header-actions">
                              <button
                                type="button"
                                onClick={() => handleAddOption("raisedPrint")}
                                className="admin__add-option-btn"
                              >
                                + Add Option
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveOptionCategory("raisedPrint")
                                }
                                className="admin__remove-category-btn"
                              >
                                Remove Category
                              </button>
                            </div>
                          </div>
                          {productFormData.options.raisedPrint?.map(
                            (raisedPrint, index) => (
                              <div
                                key={index}
                                className="admin__option-item admin__option-item_draggable"
                                draggable
                                onDragStart={() =>
                                  handleOptionDragStart("raisedPrint", index)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() =>
                                  handleOptionDrop("raisedPrint", index)
                                }
                              >
                                <input
                                  type="text"
                                  placeholder="Option (e.g., Yes, No, Standard Raised, Premium Raised)"
                                  value={raisedPrint.name}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "raisedPrint",
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_name"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Price modifier"
                                  value={raisedPrint.priceModifier}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      "raisedPrint",
                                      index,
                                      "priceModifier",
                                      e.target.value,
                                    )
                                  }
                                  className="admin__option-input admin__option-input_price"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveOption("raisedPrint", index)
                                  }
                                  className="admin__remove-option-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Custom Option Categories */}
                        <div className="admin__custom-options-section">
                          <div className="admin__custom-options-header">
                            <h5 className="admin__custom-options-title">
                              Custom Options
                            </h5>
                            <button
                              type="button"
                              onClick={handleAddCustomOptionCategory}
                              className="admin__add-category-btn"
                            >
                              + Add Custom Category
                            </button>
                          </div>

                          {Object.keys(
                            productFormData.options.customOptions || {},
                          ).map((categoryKey) => {
                            const category =
                              productFormData.options.customOptions[
                                categoryKey
                              ];
                            return (
                              <div
                                key={categoryKey}
                                className="admin__option-group admin__option-group_custom"
                              >
                                <div className="admin__option-header">
                                  <label className="admin__option-label">
                                    {category.label}
                                  </label>
                                  <div className="admin__option-header-actions">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAddCustomOption(categoryKey)
                                      }
                                      className="admin__add-option-btn"
                                    >
                                      + Add Option
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveCustomOptionCategory(
                                          categoryKey,
                                        )
                                      }
                                      className="admin__remove-category-btn"
                                    >
                                      Remove Category
                                    </button>
                                  </div>
                                </div>
                                {category.options?.map((option, index) => (
                                  <div
                                    key={index}
                                    className="admin__option-item admin__option-item_draggable"
                                    draggable
                                    onDragStart={() =>
                                      handleCustomOptionDragStart(
                                        categoryKey,
                                        index,
                                      )
                                    }
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() =>
                                      handleCustomOptionDrop(categoryKey, index)
                                    }
                                  >
                                    <input
                                      type="text"
                                      placeholder={`${category.label} option name`}
                                      value={option.name}
                                      onChange={(e) =>
                                        handleUpdateCustomOption(
                                          categoryKey,
                                          index,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className="admin__option-input admin__option-input_name"
                                    />
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="Price modifier"
                                      value={option.priceModifier}
                                      onChange={(e) =>
                                        handleUpdateCustomOption(
                                          categoryKey,
                                          index,
                                          "priceModifier",
                                          e.target.value,
                                        )
                                      }
                                      className="admin__option-input admin__option-input_price"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveCustomOption(
                                          categoryKey,
                                          index,
                                        )
                                      }
                                      className="admin__remove-option-btn"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pricing Matrix */}
                      <div className="admin__form-section">
                        <div className="admin__section-header">
                          <h3>Pricing Matrix</h3>
                          <p className="admin__section-description">
                            Define exact prices for specific option
                            combinations. When a pricing matrix exists, it
                            overrides the additive pricing model.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPricingEntry}
                          className="admin__add-option-btn"
                        >
                          Add Pricing Entry
                        </button>
                        {productFormData.pricing &&
                        productFormData.pricing.length > 0 ? (
                          <div className="admin__pricing-matrix">
                            <div className="admin__pricing-table-wrapper">
                              <table className="admin__pricing-table">
                                <thead>
                                  <tr>
                                    <th>Quantity</th>
                                    <th>Size</th>
                                    <th>Paper Type</th>
                                    <th>Orientation</th>
                                    <th>Color</th>
                                    <th>Coating</th>
                                    <th>Finish</th>
                                    <th>Rounded</th>
                                    <th>Raised</th>
                                    <th>Price ($)</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productFormData.pricing.map(
                                    (entry, index) => (
                                      <tr key={index}>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.quantity || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "quantity",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="e.g., 250"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.size || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "size",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="e.g., 4x6"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.paperType || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "paperType",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="e.g., glossy"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.orientation || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "orientation",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="optional"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.color || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "color",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="optional"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.coating || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "coating",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="optional"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.finish || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "finish",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="optional"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.roundedCorner || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "roundedCorner",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="optional"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="text"
                                            value={entry.raisedPrint || ""}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "raisedPrint",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            placeholder="optional"
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="number"
                                            step="0.01"
                                            value={entry.price || 0}
                                            onChange={(e) =>
                                              handleUpdatePricingEntry(
                                                index,
                                                "price",
                                                e.target.value,
                                              )
                                            }
                                            className="admin__pricing-input"
                                            required
                                          />
                                        </td>
                                        <td>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemovePricingEntry(index)
                                            }
                                            className="admin__remove-option-btn"
                                          >
                                            Remove
                                          </button>
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <p className="admin__no-data">
                            No pricing entries yet. Click "Add Pricing Entry" to
                            create your price matrix.
                          </p>
                        )}
                      </div>

                      <div className="admin__form-buttons">
                        <button type="submit" className="admin__save-btn">
                          {editingProduct ? "Update Product" : "Create Product"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="admin__cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products List */}
                <div className="admin__products-grid">
                  {filteredProducts.length === 0 ? (
                    <p className="admin__empty">No products found</p>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="admin__product-card admin__product-card_draggable"
                        draggable
                        onDragStart={() => handleProductDragStart(product._id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleProductDrop(product._id)}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="admin__product-image"
                        />
                        <div className="admin__product-info">
                          <h4 className="admin__product-name">
                            {product.name}
                          </h4>
                          <p className="admin__product-category">
                            {product.category}
                          </p>
                          <p className="admin__product-price">
                            ${parseFloat(product.basePrice || 0).toFixed(2)}
                          </p>
                          <p className="admin__product-description">
                            {product.description?.substring(0, 100)}...
                          </p>
                          <div className="admin__product-options-summary">
                            {product.options?.quantities?.length > 0 && (
                              <span className="admin__option-badge">
                                {product.options.quantities.length} Quantit
                                {product.options.quantities.length !== 1
                                  ? "ies"
                                  : "y"}
                              </span>
                            )}
                            {product.options?.sizes?.length > 0 && (
                              <span className="admin__option-badge">
                                {product.options.sizes.length} Size
                                {product.options.sizes.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            {product.options?.orientations?.length > 0 && (
                              <span className="admin__option-badge">
                                {product.options.orientations.length}{" "}
                                Orientation
                                {product.options.orientations.length !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            )}
                            {product.options?.colors?.length > 0 && (
                              <span className="admin__option-badge">
                                {product.options.colors.length} Color
                                {product.options.colors.length !== 1 ? "s" : ""}
                              </span>
                            )}
                            {product.options?.paperTypes?.length > 0 && (
                              <span className="admin__option-badge">
                                {product.options.paperTypes.length} Paper
                                {product.options.paperTypes.length !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            )}
                            {product.options?.roundedCorners?.length > 0 && (
                              <span className="admin__option-badge">
                                Rounded Corners
                              </span>
                            )}
                            {product.options?.coatings?.length > 0 && (
                              <span className="admin__option-badge">
                                {product.options.coatings.length} Coating
                                {product.options.coatings.length !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            )}
                            {product.options?.raisedPrint?.length > 0 && (
                              <span className="admin__option-badge">
                                Raised Print
                              </span>
                            )}
                            {product.options?.finishes?.length > 0 && (
                              <span className="admin__option-badge">
                                {product.options.finishes.length} Finish
                                {product.options.finishes.length !== 1
                                  ? "es"
                                  : ""}
                              </span>
                            )}
                            {product.options?.customOptions &&
                              Object.keys(product.options.customOptions)
                                .length > 0 && (
                                <span className="admin__option-badge admin__option-badge_custom">
                                  {
                                    Object.keys(product.options.customOptions)
                                      .length
                                  }{" "}
                                  Custom
                                </span>
                              )}
                          </div>
                          <div className="admin__product-actions">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="admin__edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="admin__delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {removeCategoryConfirm.isOpen && (
        <div
          className="admin__confirm-overlay"
          onClick={cancelRemoveOptionCategory}
        >
          <div
            className="admin__confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="admin__confirm-title">Remove Category?</h3>
            <p className="admin__confirm-text">
              This will remove all options from the "
              {removeCategoryConfirm.categoryLabel}" category.
            </p>
            <div className="admin__confirm-actions">
              <button
                type="button"
                className="admin__confirm-cancel"
                onClick={cancelRemoveOptionCategory}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin__confirm-delete"
                onClick={confirmRemoveOptionCategory}
              >
                Remove Category
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Admin;
