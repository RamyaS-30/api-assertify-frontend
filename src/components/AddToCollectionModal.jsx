import { addRequestToCollection } from "../api/collections";

export default function AddToCollectionModal({
  requestId,
  collections,
  onClose,
  onSuccess,
  onSelectCollection,
}) {
  const handleAdd = async (collection) => {
    if (onSelectCollection) {
      await onSelectCollection(collection);
    } else {
      await addRequestToCollection(collection.id, requestId);
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-5 rounded w-80">
        <h2 className="text-lg font-semibold mb-4">Save to Collection</h2>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => handleAdd(c)}
              className="w-full px-3 py-2 border rounded text-gray-700 dark:text-gray-100 bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {c.name}
            </button>
          ))}
        </div>

        <button
          className="w-full mt-4 bg-gray-300 dark:bg-gray-700 py-2 rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
