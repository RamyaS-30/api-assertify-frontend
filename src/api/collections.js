// api/collections.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getCollections = async (token) => {
  const res = await fetch(`${BASE_URL}/collections`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
};

export const createCollection = async (name, token) => {
  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const addRequestToCollection = async (collectionId, requestId, token) => {
  const res = await fetch(`${BASE_URL}/collection-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ collectionId, requestId }),
  });
  return res.json();
};
