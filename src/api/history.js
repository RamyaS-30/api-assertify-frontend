import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchHistory = async (token) => {
  if (!token) return []; // guest fallback
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await axios.get(`${BASE_URL}/history`, { headers });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch history:", err);
    return [];
  }
};

export const sendApiRequest = async (data, token) => {
  try {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await axios.post(`${BASE_URL}/proxy`, data, { headers });
    return res.data;
  } catch (err) {
    console.error("Failed to send API request:", err);
    throw err;
  }
};
