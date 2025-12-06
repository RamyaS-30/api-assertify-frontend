const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getCollections = async (token) => {
  if (!token) return [];
  const res = await fetch(`${BASE_URL}/collections`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  return data.map(col => ({
    id: col.id,
    name: col.name,
    items: col.items ?? []   // ensure exists
  }));
};

export const createCollection = async (name, token) => {
  if (!token) return null;

  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name }),
  });

  const col = await res.json();

  return {
    id: col.id,
    name: col.name,
    items: []
  };
};

export const addRequestToCollection = async (collectionId, requestId, token) => {
  if (!token) return null; // guest mode handled in App.jsx
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
