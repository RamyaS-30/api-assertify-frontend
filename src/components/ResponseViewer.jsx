export default function ResponseViewer({ response }) {
  return (
    <aside className="h-full bg-gray-100 dark:bg-gray-900 p-4 border-l border-gray-300 dark:border-gray-700 overflow-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Response</h2>
      {response ? (
        <pre className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
          {JSON.stringify(response, null, 2)}
        </pre>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Response will appear here...</p>
      )}
    </aside>
  );
}
