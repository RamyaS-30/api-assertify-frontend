import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { fetchHistory } from '../api/history';

export default function Sidebar({ loadHistoryItem, refreshFlag }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const getHistory = async () => {
      try {
        const data = await fetchHistory();
        setHistory(data || []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setHistory([]);
      }
    };
    getHistory();
  }, [refreshFlag]);

  return (
    <aside className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">History</h2>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* History */}
        <ul className="space-y-2">
  {!history || history.length === 0 ? (
    <li className="text-gray-500 text-sm">No history yet</li>
  ) : (
    history.map(item => (
      <li key={item?.id} className="p-2 rounded hover:bg-blue-200 dark:hover:bg-blue-700 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => loadHistoryItem(item)}>
          <div className="font-medium">{item?.method} - {item?.url}</div>
          <div className="text-xs text-gray-500">
            {item?.createdAt?._seconds
              ? new Date(item.createdAt._seconds * 1000).toLocaleString()
              : 'Unknown'}
          </div>
        </div>

        {/* Add button to save this history item to a collection */}
        <button
          className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
          onClick={(e) => {
            e.stopPropagation(); // prevent selecting the item
            // Call a function passed from App.jsx
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

        {/* Collections */}
      </div>
    </aside>
  );
}
