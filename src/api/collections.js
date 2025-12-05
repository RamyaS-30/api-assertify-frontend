const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getCollections = async (token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/collections`, { headers });
  return res.json();
};

export const createCollection = async (name, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const addRequestToCollection = async (collectionId, requestId, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/collection-items`, {
    method: "POST",
    headers,
    body: JSON.stringify({ collectionId, requestId }),
  });
  return res.json();
};
