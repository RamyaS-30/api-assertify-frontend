// api/api.js
export async function sendProxyRequest({ url, method, headers, params, body, token }) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url, method, headers, params, body }),
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      response: data,
    };
  } catch (error) {
    console.error("Proxy request failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
