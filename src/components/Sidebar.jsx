import ThemeToggle from './ThemeToggle';

export default function Sidebar({ loadHistoryItem, historyItems }) {
  return (
    <aside className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">History</h2>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <ul className="space-y-2">
          {!historyItems || historyItems.length === 0 ? (
            <li className="text-gray-500 text-sm">No history yet</li>
          ) : (
            historyItems.map(item => (
              <li
                key={item?.id}
                className="p-2 rounded hover:bg-blue-200 dark:hover:bg-blue-700 flex justify-between items-center"
              >
                <div className="cursor-pointer" onClick={() => loadHistoryItem(item)}>
                  <div className="font-medium">{item?.method} - {item?.url}</div>
                  <div className="text-xs text-gray-500">
                    {item?.createdAt?._seconds
                      ? new Date(item.createdAt._seconds * 1000).toLocaleString()
                      : 'Unknown'}
                  </div>
                </div>

                <button
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof window.handleAddHistoryToCollection === 'function') {
                      window.handleAddHistoryToCollection(item);
                    }
                  }}
                >
                  +
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
