// api/collections.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Fetch collections for a specific user
export const getCollections = async (userId) => {
  try {
    const res = await axios.get(`${BASE_URL}/collections`, {
      params: { userId },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch collections:", err);
    return [];
  }
};

// Create a new collection for a specific user
export const createCollection = async (name, userId) => {
  try {
    const res = await axios.post(`${BASE_URL}/collections`, { name, userId });
    return res.data;
  } catch (err) {
    console.error("Failed to create collection:", err);
    throw err;
  }
};

// Add a request (history item) to a collection
export const addRequestToCollection = async (collectionId, requestId) => {
  try {
    const res = await axios.post(`${BASE_URL}/collections/${collectionId}/add`, { requestId });
    return res.data;
  } catch (err) {
    console.error("Failed to add request to collection:", err);
    throw err;
  }
};
