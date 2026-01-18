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

// Register user
export const register = (email, password, name) => {
  // Create a new user
  const newUser = {
    email,
    name,
    password, // In production, this should be hashed on the backend
    createdAt: new Date().toISOString(),
  };

  return request(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  }).then((user) => {
    // Generate a mock JWT token
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));
    return { token, user };
  });
};

// Login user
export const login = (email, password) => {
  // Find user by email
  return request(`${BASE_URL}/users?email=${email}`).then((users) => {
    if (users.length === 0) {
      return Promise.reject("User not found");
    }

    const user = users[0];

    // Check password (in production, this should be done securely on the backend)
    if (user.password !== password) {
      return Promise.reject("Invalid password");
    }

    // Generate a mock JWT token
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));
    return { token, user };
  });
};

// Check token validity
export const checkToken = (token) => {
  try {
    // Decode the mock JWT token
    const decoded = JSON.parse(atob(token));

    // Fetch the user data
    return request(`${BASE_URL}/users/${decoded.userId}`).then((user) => {
      return user;
    });
  } catch (err) {
    return Promise.reject("Invalid token");
  }
};

// Update user profile (name)
export const updateUser = (userId, name) => {
  return request(`${BASE_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
};

// Update user password
export const updatePassword = (userId, currentPassword, newPassword) => {
  // First verify the current password
  return request(`${BASE_URL}/users/${userId}`).then((user) => {
    if (user.password !== currentPassword) {
      return Promise.reject("Current password is incorrect");
    }

    // Update the password
    return request(`${BASE_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword }),
    });
  });
};
