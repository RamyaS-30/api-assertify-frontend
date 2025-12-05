// api/collections.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Logged-in users only; guest users handled in App.jsx via localStorage
export const getCollections = async (token) => {
  if (!token) return []; // guest users handled separately

  const res = await fetch(`${BASE_URL}/collections`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const createCollection = async (name, token) => {
  if (!token) return null; // guest users handled separately

  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const addRequestToCollection = async (collectionId, requestId, token) => {
  if (!token) return null; // guest users handled separately

  const res = await fetch(`${BASE_URL}/collection-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ collectionId, requestId }),
  });
  return res.json();
};
