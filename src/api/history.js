import axios from "axios";

// Base URL for your backend
const BASE_URL = process.env.VITE_BACKEND_URL;

// Fetch history for a logged-in user
export const fetchHistory = async (userId) => {
  if (!userId) {
    // Guest user: fetch from localStorage
    const localHistory = JSON.parse(localStorage.getItem("historyItems") || "[]");
    return localHistory;
  }

  try {
    const response = await axios.get(`${BASE_URL}/history`, {
      params: { userId },
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching history:", err);
    throw err;
  }
};

// Save a history item (optional if backend handles this automatically)
export const saveHistoryItem = async (item) => {
  if (!item.userId) {
    // Guest user: save to localStorage
    const localHistory = JSON.parse(localStorage.getItem("historyItems") || "[]");
    const updatedHistory = [item, ...localHistory];
    localStorage.setItem("historyItems", JSON.stringify(updatedHistory));
    return item;
  }

  try {
    const response = await axios.post(`${BASE_URL}/history`, item);
    return response.data;
  } catch (err) {
    console.error("Error saving history item:", err);
    throw err;
  }
};
