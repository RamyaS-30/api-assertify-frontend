import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchHistory = async (token) => {
  try {
    if (!token) return []; // guest

    const res = await axios.get(`${BASE_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (Array.isArray(res.data)) return res.data;
    return []; // backend returned something invalid
  } catch (err) {
    console.error("fetchHistory error:", err?.response?.data || err);
    return []; // ← ALWAYS return array
  }
};
