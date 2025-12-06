import { useState, useEffect } from 'react';
import { sendProxyRequest } from '../api/api';

export default function ApiForm({ setResponseData, historyItem, token }) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [params, setParams] = useState('');
  const [body, setBody] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Prefill form when a history item is selected
  
useEffect(() => { 
  if (historyItem) { 
    setUrl(historyItem.url || ''); 
    setMethod(historyItem.method || 'GET'); 
    setHeaders(historyItem.headers ? JSON.stringify(historyItem.headers, null, 2) : ''); 
    setParams(historyItem.params ? JSON.stringify(historyItem.params, null, 2) : ''); 
    setBody(historyItem.body ? JSON.stringify(historyItem.body, null, 2) : ''); 
    //setResponseData(historyItem.responseData || null); 
  } 
}, [historyItem, setResponseData]); 

  const isValidJson = (str) => {
    if (!str.trim()) return true;
    try { JSON.parse(str); return true; } 
    catch { return false; }
  };

  const handleSend = async () => {
  const newErrors = {};

  if (!url.trim()) newErrors.url = "URL is required";
  if (!isValidJson(headers)) newErrors.headers = "Invalid JSON";
  if (!isValidJson(params)) newErrors.params = "Invalid JSON";
  if ((method === "POST" || method === "PUT") && !isValidJson(body)) {
    newErrors.body = "Invalid JSON";
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  setLoading(true);
  //setResponseData(null);

  try {
    const headersObj = headers ? JSON.parse(headers) : {};
    const paramsObj = params ? JSON.parse(params) : {};
    const bodyObj =
      method === "POST" || method === "PUT"
        ? body
          ? JSON.parse(body)
          : {}
        : null;

    let finalUrl = url;
    if (method === "GET" && Object.keys(paramsObj).length > 0) {
      const urlObj = new URL(url);
      Object.entries(paramsObj).forEach(([key, value]) =>
        urlObj.searchParams.append(key, value)
      );
      finalUrl = urlObj.toString();
    }

    const backendResponse = await sendProxyRequest({
      url: finalUrl,
      method,
      headers: headersObj,
      params: paramsObj,
      body: bodyObj,
      token,
    });

    // ⭐ IMPORTANT FIX: Use backendResponse.response
    setResponseData({
      requestId: crypto.randomUUID(),
      url,
      method,
      headers: headersObj,
      params: paramsObj,
      body: bodyObj,
      data: backendResponse.success ? backendResponse.response : { success: false, error: backendResponse.error || "No response from backend" },
    });

  } catch (err) {
    setResponseData({
      requestId: crypto.randomUUID(),
      url,
      method,
      headers: {},
      params: {},
      body: null,
      data: { success: false, error: err.message },
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex-1 flex flex-col p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-w-0">
      <h1 className="text-2xl font-bold mb-4 text-primary-dark dark:text-primary-light">API Request</h1>
      <div className="flex flex-col flex-grow space-y-4 overflow-auto">
        {/* URL */}
        <input
          type="text"
          placeholder="Enter the full API URL (e.g., https://api.example.com/data)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`w-full p-3 border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700 ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.url && <span className="text-red-500 text-sm">{errors.url}</span>}

        {/* Method */}
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        {/* Headers */}
        <textarea
          placeholder={`Headers JSON (e.g., {"Authorization": "Bearer token"})`}
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          className={`w-full p-3 border rounded h-24 bg-gray-50 dark:bg-gray-800 resize-none ${errors.headers ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.headers && <span className="text-red-500 text-sm">{errors.headers}</span>}

        {/* Params */}
        <textarea
          placeholder={`Query Parameters JSON (e.g., {"page":1,"limit":10})`}
          value={params}
          onChange={(e) => setParams(e.target.value)}
          className={`w-full p-3 border rounded h-24 bg-gray-50 dark:bg-gray-800 resize-none ${errors.params ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.params && <span className="text-red-500 text-sm">{errors.params}</span>}

        {/* Body */}
        {(method === 'POST' || method === 'PUT') && (
          <textarea
            placeholder={`Body JSON (e.g., {"name":"John"})`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`w-full p-3 border rounded h-32 bg-gray-50 dark:bg-gray-800 resize-none ${errors.body ? 'border-red-500' : 'border-gray-300'}`}
          />
        )}
        {errors.body && <span className="text-red-500 text-sm">{errors.body}</span>}

        {/* Send button */}
        <button
          onClick={handleSend}
          className="mt-auto bg-primary-light dark:bg-primary-dark text-white px-6 py-2 rounded hover:bg-primary-dark dark:hover:bg-primary-light transition self-start"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
