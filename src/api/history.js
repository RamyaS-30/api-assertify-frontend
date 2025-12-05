import axios from "axios";

const API_URL = process.env.VITE_BACKEND_URL;

export const fetchHistory = async (userId) => {
  if (!userId) throw new Error("userId is required to fetch history");
  
  const res = await axios.get(`${API_URL}/history`, {
    params: { userId }, // <- critical: adds ?userId=XYZ
  });

  return res.data;
};
