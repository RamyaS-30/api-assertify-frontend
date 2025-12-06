import { useState } from "react";

export default function CollectionsSidebar({ collections, historyItems, onSelectCollection, onCreateCollection, onAddToCollection }) {
  const [newName, setNewName] = useState("");
  const [expandedCollection, setExpandedCollection] = useState(null); // track which collection is expanded

  const handleCreateCollection = async () => {
    if (!newName.trim()) return;
    try {
      await onCreateCollection(newName.trim());
      setNewName("");
    } catch (err) {
      console.error("Create collection error:", err);
    }
  };

  // Helper to get full request info by ID from historyItems
  const findRequestById = (id) => {
    const found = historyItems.find(item => String(item.id) === String(id));
    if (!found) console.warn(`No history item found for ID: ${id}`);
    return found;
  };

  return (
    <div className="flex flex-col h-full p-4 border-t border-gray-300 dark:border-gray-700 overflow-auto">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Collections</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="New collection"
          className="px-2 py-1 border rounded w-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 rounded"
          onClick={handleCreateCollection}
        >
          +
        </button>
      </div>

      <div className="space-y-1">
        {collections.length === 0 && <p className="text-gray-500 text-sm">No collections yet</p>}
        {collections.map((col) => (
          <div key={col.id} className="flex flex-col">
            <div className="flex justify-between items-center">
              <button
                className="w-full text-left px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-700"
                onClick={() => setExpandedCollection(expandedCollection === col.id ? null : col.id)}
              >
                {col.name} ({col.items?.length || 0})
              </button>
              {onAddToCollection && (
                <button
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                  onClick={() => onAddToCollection(col)}
                >
                  +
                </button>
              )}
            </div>

            {expandedCollection === col.id && col.items && col.items.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1">
                {col.items.map((itemOrId, idx) => {
                  // Support both guest objects or stored IDs
                  let item = typeof itemOrId === "string" ? findRequestById(itemOrId) : itemOrId;
                  return (
                    <li
                      key={item?.id || idx}
                      className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={() => onSelectCollection && item && onSelectCollection(item)}
                    >
                      {item ? `${item.method} - ${item.url}` : `Unknown Request`}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
