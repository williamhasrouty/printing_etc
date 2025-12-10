import { BASE_URL } from "./constants";

// Generic request function
const request = (url, options) => {
  return fetch(url, options).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Error: ${res.status}`);
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
  return request(`${BASE_URL}/orders`, {
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
