import axios from "axios";

// Base URL for your backend
const BASE_URL = process.env.VITE_BACKEND_URL; // fallback

// Fetch history for a logged-in user or guest
export const fetchHistory = async (userId) => {
  if (!userId) {
    // Guest user: fetch from localStorage
    const localHistory = JSON.parse(localStorage.getItem("historyItems") || "[]");
    return localHistory;
  }

  try {
    // Logged-in user: GET from backend
    const response = await axios.get(`${BASE_URL}/history`, {
      params: { userId },
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching history:", err);
    throw err;
  }
};

// Save a history item for guest users
export const saveHistoryItem = async (item) => {
  if (!item.userId) {
    // Guest: save locally
    const localHistory = JSON.parse(localStorage.getItem("historyItems") || "[]");
    const updatedHistory = [item, ...localHistory];
    localStorage.setItem("historyItems", JSON.stringify(updatedHistory));
    return item;
  }

  // Logged-in users do NOT need this; backend /proxy handles saving
  return item;
};
