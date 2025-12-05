// api/api.js
export async function sendProxyRequest({ url, method, headers, params, body, token }) {
  try {
    // For guest users, don't call backend proxy
    if (!token) {
      // Simulate a response for guest users (optional)
      return {
        success: true,
        status: 200,
        response: {
          data: "Guest user - response not saved to backend",
          requestId: Date.now().toString(),
          url,
          method,
          headers,
        },
      };
    }

    // Logged-in user backend request
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
