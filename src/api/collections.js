const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getCollections = async () => {
  const res = await fetch(`${BASE_URL}/collections`);
  return res.json();
};

export const createCollection = async (name) => {
  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const addRequestToCollection = async (collectionId, requestId) => {
  const res = await fetch(`${BASE_URL}/collection-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collectionId, requestId }),
  });
  return res.json();
};
