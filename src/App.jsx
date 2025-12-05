import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CollectionsSidebar from './components/CollectionsSidebar';
import ApiForm from './components/ApiForm';
import ResponseViewer from './components/ResponseViewer';
import AddToCollectionModal from './components/AddToCollectionModal';
import { getCollections, createCollection, addRequestToCollection } from './api/collections';
import { fetchHistory, sendApiRequest } from './api/history'; // create wrapper to pass token
import { HiMenu, HiX } from 'react-icons/hi';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // your firebase config

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Collections
  const [collections, setCollections] = useState([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  // History refresh flag
  const [refreshHistoryFlag, setRefreshHistoryFlag] = useState(false);
  const triggerHistoryRefresh = () => setRefreshHistoryFlag(prev => !prev);

  // Current User
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // LocalStorage keys for guest users
  const LOCAL_HISTORY_KEY = "guestHistory";
  const LOCAL_COLLECTIONS_KEY = "guestCollections";

  const loadLocalHistory = () => JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY)) || [];
  const saveLocalHistory = (history) => localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));

  const loadLocalCollections = () => JSON.parse(localStorage.getItem(LOCAL_COLLECTIONS_KEY)) || [];
  const saveLocalCollections = (collections) => localStorage.setItem(LOCAL_COLLECTIONS_KEY, JSON.stringify(collections));

  // Load collections
  const loadCollections = async () => {
    try {
      let data;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        data = await getCollections(token);
      } else {
        data = loadLocalCollections();
      }
      setCollections(data);
    } catch (err) {
      console.error("Error loading collections", err);
    }
  };

  // Load history
  const loadHistory = async () => {
    try {
      let data;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        data = await fetchHistory(token);
      } else {
        data = loadLocalHistory();
      }
      setHistoryItems(data);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  // Initial load
  useEffect(() => {
    loadCollections();
    loadHistory();
  }, [currentUser]);

  // Logout function (clears token and guest data)
  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    localStorage.removeItem(LOCAL_COLLECTIONS_KEY);
    setHistoryItems([]);
    setCollections([]);
  };

  // Mobile menu
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

  const loadHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setResponseData(item.responseData || null);
    closePanel();
  };

  // Handle API request response
  const handleRequestComplete = async (response) => {
    setResponseData(response);

    const newItem = {
      id: response?.requestId || Date.now().toString(),
      url: response.url,
      method: response.method,
      headers: response.headers,
      responseData: response.data,
    };

    setHistoryItems(prev => {
      const updated = [newItem, ...prev];
      if (!currentUser) saveLocalHistory(updated); // Save guest history locally
      return updated;
    });

    setSelectedHistoryItem(newItem);
    setShowAddToCollection(true);

    triggerHistoryRefresh();
  };

  // Create new collection
  const handleCreateCollection = async (name) => {
    let created;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      created = await createCollection(name, token);
    } else {
      created = { id: Date.now().toString(), name, requests: [] };
      const updated = [created, ...collections];
      setCollections(updated);
      saveLocalCollections(updated);
    }
    setCollections(prev => [created, ...prev]);
    return created;
  };

  // Add history item to collection
  const handleAddToCollection = async (collection) => {
    if (!selectedHistoryItem) return;

    if (currentUser) {
      const token = await currentUser.getIdToken();
      await addRequestToCollection(collection.id, selectedHistoryItem.id, token);
      await loadCollections();
    } else {
      const updatedCollections = collections.map(col => {
        if (col.id === collection.id) {
          return { ...col, requests: [...(col.requests || []), selectedHistoryItem.id] };
        }
        return col;
      });
      setCollections(updatedCollections);
      saveLocalCollections(updatedCollections);
    }

    setShowAddToCollection(false);
  };

  window.handleAddHistoryToCollection = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setShowAddToCollection(true);
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
        <div className="md:hidden flex justify-between items-center p-3 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative z-50">
          <button id="mobile-menu-button" className="focus:outline-none" onClick={() => setMenuOpen(prev => !prev)}>
            <HiMenu className="w-7 h-7 text-primary-dark dark:text-primary-light"/>
          </button>
          <span className="font-semibold text-lg text-primary-dark dark:text-primary-light">API-Assertify</span>
          <div className="w-7 h-7" />
          {menuOpen && (
            <div id="mobile-menu-dropdown" className="absolute top-full left-2 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
              <button className="w-full text-left px-4 py-2" onClick={() => openPanel('sidebar')}>History</button>
              <button className="w-full text-left px-4 py-2" onClick={() => openPanel('response')}>Response</button>
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

      {/* Mobile overlays */}
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
