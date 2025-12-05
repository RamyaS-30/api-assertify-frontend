import { useState, useEffect } from 'react';
import useAuthStatus from './hooks/useAuthStatus';
import Sidebar from './components/Sidebar';
import CollectionsSidebar from './components/CollectionsSidebar';
import ApiForm from './components/ApiForm';
import ResponseViewer from './components/ResponseViewer';
import AddToCollectionModal from './components/AddToCollectionModal';
import { getCollections, createCollection, addRequestToCollection } from './api/collections';
import { HiMenu, HiX } from 'react-icons/hi';

export default function App() {
  const { user, skippedLogin } = useAuthStatus();
  const guestId = localStorage.getItem("guestId") || null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const [collections, setCollections] = useState([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  const [refreshHistoryFlag, setRefreshHistoryFlag] = useState(false);
  const triggerHistoryRefresh = () => setRefreshHistoryFlag(prev => !prev);

  // Load collections
  const loadCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (err) {
      console.error("Error loading collections", err);
    }
  };

  // Load history
  const loadHistory = async () => {
    try {
      if (user) {
        // Fetch logged-in user's history from backend
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/history?userId=${user.uid}`);
        const data = await res.json();
        setHistoryItems(data);
      } else if (skippedLogin) {
        // Load guest history from localStorage
        const data = JSON.parse(localStorage.getItem("historyItems") || "[]");
        setHistoryItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    loadCollections();
    loadHistory();
  }, [user, skippedLogin, refreshHistoryFlag]);

  const loadHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setResponseData(item.responseData || null);
    setPanelOpen(null);
  };

  const handleRequestComplete = async (response) => {
    setResponseData(response);

    const newItem = {
      id: response.requestId,
      url: response.url,
      method: response.method,
      headers: response.headers,
      body: response.body,
      responseData: response.data,
      createdAt: new Date(),
      userId: user?.uid || null,
    };

    if (user) {
      // Save to backend for logged-in users
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
    } else if (skippedLogin) {
      // Save locally for guest
      const localHistory = JSON.parse(localStorage.getItem("historyItems") || "[]");
      localStorage.setItem("historyItems", JSON.stringify([newItem, ...localHistory]));
    }

    setHistoryItems(prev => [newItem, ...prev]);
    setSelectedHistoryItem(newItem);
  };

  const handleCreateCollection = async (name) => {
    const created = await createCollection(name);
    setCollections(prev => [created, ...prev]);
    return created;
  };

  const handleAddToCollection = async (collection) => {
    if (!selectedHistoryItem) return;
    await addRequestToCollection(collection.id, selectedHistoryItem.id);
    await loadCollections();
    setShowAddToCollection(false);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-[1] flex-col h-full border-r border-gray-300 dark:border-gray-700">
        <div className="h-1/2 overflow-y-auto">
          <Sidebar loadHistoryItem={loadHistoryItem} refreshFlag={refreshHistoryFlag} historyItems={historyItems} />
        </div>
        <div className="h-1/2 overflow-y-auto border-t border-gray-300 dark:border-gray-700">
          <CollectionsSidebar
            collections={collections}
            historyItems={historyItems}
            onSelectCollection={loadHistoryItem}
            onCreateCollection={handleCreateCollection}
            onAddToCollection={handleAddToCollection}
          />
        </div>
      </div>

      {/* API Form */}
      <div className="flex-[2] flex flex-col h-full min-w-0">
        <ApiForm setResponseData={handleRequestComplete} historyItem={selectedHistoryItem} />
      </div>

      {/* Desktop Response Viewer */}
      <div className="hidden md:flex flex-[1] flex-col h-full border-l border-gray-300 dark:border-gray-700 overflow-auto">
        <ResponseViewer response={responseData} />
      </div>

      {/* Add to Collection Modal */}
      {showAddToCollection && (
        <AddToCollectionModal
          requestId={selectedHistoryItem?.id}
          collections={collections}
          onClose={() => setShowAddToCollection(false)}
          onSuccess={async () => {
            setShowAddToCollection(false);
            await loadCollections();
          }}
          onSelectCollection={handleAddToCollection}
        />
      )}
    </div>
  );
}
