import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import CollectionsSidebar from "./components/CollectionsSidebar";
import ApiForm from "./components/ApiForm";
import ResponseViewer from "./components/ResponseViewer";
import AddToCollectionModal from "./components/AddToCollectionModal";
import { getCollections, createCollection, addRequestToCollection } from "./api/collections";
import { fetchHistory, sendApiRequest } from "./api/history";
import { HiMenu, HiX } from "react-icons/hi";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [collections, setCollections] = useState([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [refreshHistoryFlag, setRefreshHistoryFlag] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // <-- wait for auth

  const LOCAL_HISTORY_KEY = "guestHistory";
  const LOCAL_COLLECTIONS_KEY = "guestCollections";

  const triggerHistoryRefresh = () => setRefreshHistoryFlag(prev => !prev);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false); // auth is ready
    });
    return () => unsubscribe();
  }, []);

  // Local storage helpers
  const loadLocalHistory = () => JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY)) || [];
  const saveLocalHistory = (history) => localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
  const loadLocalCollections = () => JSON.parse(localStorage.getItem(LOCAL_COLLECTIONS_KEY)) || [];
  const saveLocalCollections = (collections) => localStorage.setItem(LOCAL_COLLECTIONS_KEY, JSON.stringify(collections));

  // Load collections
  const loadCollections = async () => {
    try {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const data = await getCollections(token);
        setCollections(data || []);
      } else {
        setCollections(loadLocalCollections());
      }
    } catch (err) {
      console.error("Error loading collections", err);
      if (!currentUser) setCollections(loadLocalCollections());
    }
  };

  // Load history
  const loadHistory = async () => {
    try {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        const data = await fetchHistory(token);
        setHistoryItems(data || []);
      } else {
        setHistoryItems(loadLocalHistory());
      }
    } catch (err) {
      console.error("Error loading history:", err);
      if (!currentUser) setHistoryItems(loadLocalHistory());
    }
  };

  // Only load after auth initialized
  useEffect(() => {
    if (!loadingAuth) {
      loadCollections();
      loadHistory();
    }
  }, [currentUser, loadingAuth]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    localStorage.removeItem(LOCAL_COLLECTIONS_KEY);
    setHistoryItems([]);
    setCollections([]);
  };

  const openPanel = (panel) => setPanelOpen(panel);
  const closePanel = () => setPanelOpen(null);

  const loadHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setResponseData(item.responseData || null);
    closePanel();
  };

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
      const updated = [newItem, ...prev.filter(h => h.id !== newItem.id)];
      if (!currentUser) saveLocalHistory(updated);
      return updated;
    });

    setSelectedHistoryItem(newItem);
    setShowAddToCollection(true);
    triggerHistoryRefresh();
  };

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
    setCollections(prev => [created, ...prev.filter(c => c.id !== created.id)]);
    return created;
  };

  const handleAddToCollection = async (collection) => {
    if (!selectedHistoryItem) return;

    if (currentUser) {
      const token = await currentUser.getIdToken();
      await addRequestToCollection(collection.id, selectedHistoryItem.id, token);
      await loadCollections();
    } else {
      const updatedCollections = collections.map(col => {
        if (col.id === collection.id) {
          return { ...col, requests: [...new Set([...(col.requests || []), selectedHistoryItem.id])] };
        }
        return col;
      });
      setCollections(updatedCollections);
      saveLocalCollections(updatedCollections);
    }

    setShowAddToCollection(false);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-[1] flex-col h-full border-r border-gray-300 dark:border-gray-700">
        <div className="h-1/2 overflow-y-auto">
          <Sidebar loadHistoryItem={loadHistoryItem} refreshFlag={refreshHistoryFlag} historyItems={historyItems || []} />
        </div>
        <div className="h-1/2 overflow-y-auto border-t border-gray-300 dark:border-gray-700">
          <CollectionsSidebar
            collections={collections || []}
            historyItems={historyItems || []}
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
            <Sidebar loadHistoryItem={loadHistoryItem} refreshFlag={refreshHistoryFlag} historyItems={historyItems || []} />
          </div>
          <div className="h-1/2 overflow-y-auto border-t border-gray-300 dark:border-gray-700 pr-1">
            <CollectionsSidebar
              collections={collections || []}
              historyItems={historyItems || []}
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
          collections={collections || []}
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
