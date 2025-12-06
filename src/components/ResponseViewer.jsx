export default function ResponseViewer({ responseData }) {
  // Normalize: show full responseData object including request info
  if (!responseData) {
    return (
      <aside className="h-full bg-gray-100 dark:bg-gray-900 p-4 border-l border-gray-300 dark:border-gray-700 overflow-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Response</h2>
        <p className="text-gray-500 dark:text-gray-400">Response will appear here...</p>
      </aside>
    );
  }

  const { url, method, headers, params, body, data } = responseData;

  return (
    <aside className="h-full bg-gray-100 dark:bg-gray-900 p-4 border-l border-gray-300 dark:border-gray-700 overflow-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Response</h2>
      
      <div className="mb-4">
        <strong>Request:</strong>
        <pre className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
          {JSON.stringify({ url, method, headers, params, body }, null, 2)}
        </pre>
      </div>

      <div>
        <strong>Response:</strong>
        <pre className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </aside>
  );
}
