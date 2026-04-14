import { BASE_URL } from "./constants";

const JWT_KEY = "jwt";

// Generic request function
const request = (url, options) => {
  return fetch(url, options).then((res) => {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Error: ${res.status}`);
  });
};

export const getStoredToken = () => {
  return localStorage.getItem(JWT_KEY) || sessionStorage.getItem(JWT_KEY);
};

export const storeAuthToken = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem(JWT_KEY, token);
    sessionStorage.removeItem(JWT_KEY);
    return;
  }

  sessionStorage.setItem(JWT_KEY, token);
  localStorage.removeItem(JWT_KEY);
};

export const clearAuthToken = () => {
  localStorage.removeItem(JWT_KEY);
  sessionStorage.removeItem(JWT_KEY);
};

// Register user
export const register = (email, password, name, phone) => {
  // Create a new user
  const newUser = {
    email,
    name,
    password,
    phone,
  };

  return request(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  }).then((user) => {
    // After successful signup, automatically log in to get the token
    return login(email, password);
  });
};

// Login user
export const login = (email, password) => {
  return request(`${BASE_URL}/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
};

// Check token validity
export const checkToken = (token) => {
  return request(`${BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });
};

// Update user profile
export const updateUser = (profileData, token) => {
  return request(`${BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
};

// Update user password
export const updatePassword = (currentPassword, newPassword, token) => {
  return request(`${BASE_URL}/users/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};
