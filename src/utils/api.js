import { BASE_URL } from "./constants";

// Generic request function
const request = (url, options) => {
  return fetch(url, options).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return res
      .json()
      .then((err) => {
        const detail =
          err?.validation?.body?.message || err?.message || JSON.stringify(err);
        console.error("API validation error:", detail);
        console.error("Full error response:", JSON.stringify(err, null, 2));
        return Promise.reject(`Error: ${res.status} - ${detail}`);
      })
      .catch(() => Promise.reject(`Error: ${res.status}`));
  });
};

// Get all products
export const getProducts = () => {
  return request(`${BASE_URL}/products`);
};

// Get single product
export const getProduct = (id) => {
  return request(`${BASE_URL}/products/${id}`);
};

// Create product (admin only)
export const createProduct = (productData, token) => {
  return request(`${BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
};

// Update product (admin only)
export const updateProduct = (productId, productData, token) => {
  return request(`${BASE_URL}/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
};

// Delete product (admin only)
export const deleteProduct = (productId, token) => {
  return request(`${BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

// Create order
export const createOrder = (orderData, token) => {
  return request(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
};

// Get user orders
export const getUserOrders = (token) => {
  return request(`${BASE_URL}/orders/me`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

// Update user profile
export const updateUserProfile = (data, token) => {
  return request(`${BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

// Admin API functions

// Get all orders (admin only)
export const getAllOrders = (token, status = null) => {
  const url = status
    ? `${BASE_URL}/orders?status=${status}`
    : `${BASE_URL}/orders`;
  return request(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

// Update order status (admin only)
export const updateOrderStatus = (orderId, statusData, token) => {
  return request(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(statusData),
  });
};

// Get order analytics (admin only)
export const getOrderAnalytics = (token, startDate = null, endDate = null) => {
  let url = `${BASE_URL}/orders/analytics/stats`;
  const params = [];
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (params.length > 0) url += `?${params.join("&")}`;

  return request(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};
