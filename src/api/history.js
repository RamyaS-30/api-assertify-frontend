// api/history.js
import axios from 'axios';

export const fetchHistory = async (token) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/history`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch history:", err);
    return [];
  }
};
