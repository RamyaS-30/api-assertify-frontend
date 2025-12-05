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
      const data = await getCollections(user?.uid || guestId);
      setCollections(data);
    } catch (err) {
      console.error("Error loading collections", err);
    }
  };

  // Load history (user-specific or guest)
  const loadHistory = async () => {
    try {
      if (user) {
        // Logged-in user history from backend
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/history?userId=${user.uid}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setHistoryItems(data);
      } else if (skippedLogin || guestId) {
        // Guest history from localStorage
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
      createdAt: new Date().toISOString(),
      userId: user?.uid || guestId || null,
    };

    if (user) {
      // Save to backend
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/proxy/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
    } else {
      // Save locally for guest
      const localHistory = JSON.parse(localStorage.getItem("historyItems") || "[]");
      localStorage.setItem("historyItems", JSON.stringify([newItem, ...localHistory]));
    }

    setHistoryItems(prev => [newItem, ...prev]);
    setSelectedHistoryItem(newItem);
    setShowAddToCollection(true);
    triggerHistoryRefresh();
  };

  const handleCreateCollection = async (name) => {
    const created = await createCollection(name, user?.uid || guestId);
    setCollections(prev => [created, ...prev]);
    return created;
  };

  const handleAddToCollection = async (collection) => {
    if (!selectedHistoryItem) return;
    await addRequestToCollection(collection.id, selectedHistoryItem.id);
    await loadCollections();
    setShowAddToCollection(false);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#mobile-menu-button') && !e.target.closest('#mobile-menu-dropdown')) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  const openPanel = (panel) => {
    setPanelOpen(panel);
    setMenuOpen(false);
  };
  const closePanel = () => setPanelOpen(null);

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
        {/* Mobile Top Bar */}
        <div className="md:hidden flex justify-between items-center p-3 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative z-50">
          <button id="mobile-menu-button" className="focus:outline-none" onClick={() => setMenuOpen(prev => !prev)}>
            <HiMenu className="w-7 h-7 text-primary-dark dark:text-primary-light"/>
          </button>
          <span className="font-semibold text-lg text-primary-dark dark:text-primary-light">API-Assertify</span>
          <div className="w-7 h-7" />
          {menuOpen && (
            <div id="mobile-menu-dropdown" className="absolute top-full left-2 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
              <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => openPanel('sidebar')}>History</button>
              <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => openPanel('response')}>Response</button>
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <ApiForm setResponseData={handleRequestComplete} historyItem={selectedHistoryItem} />
        </div>
      </div>

      {/* Desktop Response Viewer */}
      <div className="hidden md:flex flex-[1] flex-col h-full border-l border-gray-300 dark:border-gray-700 overflow-auto">
        <ResponseViewer response={responseData} />
      </div>

      {/* Mobile Overlay */}
      {(panelOpen === 'sidebar' || panelOpen === 'response') && <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={closePanel} />}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-72 bg-gray-50 dark:bg-gray-900 p-4 border-r border-gray-300 dark:border-gray-700 shadow-xl transform transition-transform duration-300 md:hidden ${panelOpen === 'sidebar' ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">History & Collections</h2>
          <HiX className="w-6 h-6 cursor-pointer" onClick={closePanel} />
        </div>
        <div className="flex flex-col h-full">
          <div className="h-1/2 overflow-y-auto pr-1">
            <Sidebar loadHistoryItem={loadHistoryItem} refreshFlag={refreshHistoryFlag} historyItems={historyItems} />
          </div>
          <div className="h-1/2 overflow-y-auto border-t border-gray-300 dark:border-gray-700 pr-1">
            <CollectionsSidebar
              collections={collections}
              historyItems={historyItems}
              onSelectCollection={loadHistoryItem}
              onCreateCollection={handleCreateCollection}
              onAddToCollection={handleAddToCollection}
            />
          </div>
        </div>
      </div>

      {/* Mobile Response */}
      <div className={`fixed top-0 right-0 z-50 h-full w-72 bg-gray-50 dark:bg-gray-900 p-4 border-l border-gray-300 dark:border-gray-700 shadow-xl transform transition-transform duration-300 md:hidden ${panelOpen === 'response' ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Response</h2>
          <HiX className="w-6 h-6 cursor-pointer" onClick={closePanel} />
        </div>
        <div className="h-full overflow-auto">
          <ResponseViewer response={responseData} />
        </div>
      </div>

      {/* Add to Collection Modal */}
      {showAddToCollection && (
        <AddToCollectionModal
          requestId={selectedHistoryItem?.id}
          collections={collections}
          onClose={() => setShowAddToCollection(false)}
          onSuccess={async () => { setShowAddToCollection(false); await loadCollections(); }}
          onSelectCollection={handleAddToCollection}
        />
      )}
    </div>
  );
}
