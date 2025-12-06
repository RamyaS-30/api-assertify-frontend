import axios from "axios";

export const fetchHistory = async (token) => {
  if (!token) return [];
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data.map((item) => ({
      id: item.id,
      url: item.url,
      method: item.method,
      headers: item.headers ?? {},
      params: item.params ?? {},
      body: item.body ?? null,
      responseData: item.responseData ?? {},
    }));
  } catch (err) {
    console.error("Failed to fetch history:", err);
    return [];
  }
};
