const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Fetch all collections
export const getCollections = async (token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${BASE_URL}/collections`, { headers });
    const data = await res.json();

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Failed to load collections:", err);
    return [];
  }
};

// Create a new collection
export const createCollection = async (name, token) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/collections`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    return data; // return created collection object
  } catch (err) {
    console.error("Failed to create collection:", err);
    return null;
  }
};

// Add a request to a collection
export const addRequestToCollection = async (collectionId, requestId, token) => {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/collection-items`, {
      method: "POST",
      headers,
      body: JSON.stringify({ collectionId, requestId }),
    });

    return await res.json();
  } catch (err) {
    console.error("Failed to add request to collection:", err);
    return null;
  }
};
