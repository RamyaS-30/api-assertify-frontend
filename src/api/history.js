import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Fetch request history
export const fetchHistory = async (token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axios.get(`${BASE_URL}/history`, { headers });

    // Ensure always array
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Failed to fetch history:", err?.response?.data || err);
    return []; // fallback for guest or backend error
  }
};

// Send API request through backend proxy
export const sendApiRequest = async (payload, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axios.post(`${BASE_URL}/proxy`, payload, { headers });

    return res.data;
  } catch (err) {
    console.error("Failed to send API request:", err?.response?.data || err);
    throw err;
  }
};
