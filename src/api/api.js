// api.js
export async function sendProxyRequest({ url, method, headers, params, body, token }) {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url, method, headers, params, body }),
    });

    const data = await res.json();

    // Align with backend's unified { success, response } structure
    return {
      success: data.success,
      response: data.response || null,
    };
  } catch (err) {
    console.error("Proxy request failed:", err);
    return {
      success: false,
      response: { error: err.message },
    };
  }
}
