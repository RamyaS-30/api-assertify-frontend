import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import CollectionsSidebar from "./components/CollectionsSidebar";
import ApiForm from "./components/ApiForm";
import ResponseViewer from "./components/ResponseViewer";
import AddToCollectionModal from "./components/AddToCollectionModal";

import { getCollections, createCollection, addRequestToCollection } from "./api/collections";
import { fetchHistory } from "./api/history";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import { HiMenu, HiX } from "react-icons/hi";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(null);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const [responseData, setResponseData] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const [collections, setCollections] = useState([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  /* ---------------------------
   * Firebase Auth State Listener
   * --------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);

        // Load existing Firestore data
        const serverHistory = await fetchHistory(idToken);
        const serverCollections = await getCollections(idToken);

        // Merge guest data if exists
        const guestHistory = JSON.parse(localStorage.getItem("history") || "[]");
        const guestCollections = JSON.parse(localStorage.getItem("collections") || "[]");

        let migratedHistory = [];
        if (guestHistory.length) {
          for (const h of guestHistory) {
            try {
              await fetch("/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ ...h, requestId: h.id }),
              });
              migratedHistory.push(h);
            } catch (err) {
              console.error("Error migrating guest history:", err);
            }
          }
          localStorage.removeItem("history");
        }

        let migratedCollections = [];
        if (guestCollections.length) {
          for (const c of guestCollections) {
            try {
              const created = await createCollection(c.name, idToken);
              for (const item of c.items) {
                await addRequestToCollection(created.id, item.id, idToken);
              }
              migratedCollections.push({ ...c, id: created.id });
            } catch (err) {
              console.error("Error migrating guest collection:", err);
            }
          }
          localStorage.removeItem("collections");
        }

        // Update UI immediately
        setHistoryItems([
          ...migratedHistory.map(h => ({ ...h, id: h.id || crypto.randomUUID(), createdAt: h.createdAt || { _seconds: Math.floor(Date.now() / 1000) } })),
          ...serverHistory.map(h => ({ ...h, id: h.id || crypto.randomUUID(), createdAt: h.createdAt || { _seconds: Math.floor(Date.now() / 1000) } })),
        ]);

        setCollections([...migratedCollections, ...serverCollections]);
      } else {
        setUser(null);
        setToken(null);

        // Load guest data
        setHistoryItems(JSON.parse(localStorage.getItem("history") || "[]"));
        setCollections(JSON.parse(localStorage.getItem("collections") || "[]"));
      }
    });

    return () => unsub();
  }, []);

  /* ---------------------------
   * Load single history item
   * --------------------------- */
  const loadHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setResponseData({
      requestId: item.id,
      url: item.url,
      method: item.method,
      headers: item.headers,
      params: item.params,
      body: item.body,
      data: item.responseData ?? item.data ?? null,
    });
    closePanel();
  };

  /* ---------------------------
   * Handle API request completion
   * --------------------------- */
  const handleRequestComplete = async (response) => {
    if (!response) return;

    const requestId = response.requestId ?? crypto.randomUUID();
    const newItem = {
      id: requestId,
      url: response.url ?? "",
      method: response.method ?? "GET",
      headers: response.headers ?? {},
      params: response.params ?? {},
      body: response.body ?? null,
      responseData: response.data ?? {},
      createdAt: { _seconds: Math.floor(Date.now() / 1000) },
    };

    if (user && token) {
      // Save to Firestore
      try {
        await fetch("/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...newItem, requestId }),
        });
      } catch (err) {
        console.error("Error saving request:", err);
      }
    } else {
      // Save locally for guest
      const local = JSON.parse(localStorage.getItem("history") || "[]");
      localStorage.setItem("history", JSON.stringify([newItem, ...local]));
    }

    // Update UI immediately
    setHistoryItems(prev => [newItem, ...prev]);
    setSelectedHistoryItem(newItem);
    setResponseData({ ...newItem, data: newItem.responseData });
    setShowAddToCollection(true);
    if (window.innerWidth < 768) setPanelOpen("response");
  };

  /* ---------------------------
   * Create collection
   * --------------------------- */
  const handleCreateCollection = async (name) => {
    if (user && token) {
      const created = await createCollection(name, token);
      setCollections(prev => [created, ...prev]);
      return created;
    } else {
      const newColl = { id: crypto.randomUUID(), name, items: [] };
      const local = JSON.parse(localStorage.getItem("collections") || "[]");
      const updated = [newColl, ...local];
      localStorage.setItem("collections", JSON.stringify(updated));
      setCollections(updated);
      return newColl;
    }
  };

  /* ---------------------------
   * Add request to collection
   * --------------------------- */
  const handleAddToCollection = async (collection) => {
    if (!selectedHistoryItem) return;

    if (user && token) {
      await addRequestToCollection(collection.id, selectedHistoryItem.id, token);
      const updated = await getCollections(token);
      setCollections(updated);
    } else {
      const local = JSON.parse(localStorage.getItem("collections") || "[]");
      const updated = local.map(c =>
        c.id === collection.id
          ? { ...c, items: [...c.items, { ...selectedHistoryItem, id: selectedHistoryItem.id ?? crypto.randomUUID() }] }
          : c
      );
      localStorage.setItem("collections", JSON.stringify(updated));
      setCollections(updated);
    }

    setShowAddToCollection(false);
  };

  // Expose for Sidebar
  window.handleAddHistoryToCollection = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setShowAddToCollection(true);
  };

  /* ---------------------------
   * Panel controls
   * --------------------------- */
  const openPanel = (panel) => { setMenuOpen(false); setPanelOpen(panel); };
  const closePanel = () => setPanelOpen(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#mobile-menu-button") && !e.target.closest("#mobile-menu-dropdown")) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  /* ---------------------------
   * Render
   * --------------------------- */
  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-[1] flex-col h-full border-r border-gray-300 dark:border-gray-700">
        <div className="h-1/2 overflow-y-auto">
          <Sidebar loadHistoryItem={loadHistoryItem} historyItems={historyItems} />
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
          <button id="mobile-menu-button" onClick={() => setMenuOpen(prev => !prev)}>
            <HiMenu className="w-7 h-7 text-primary-dark dark:text-primary-light" />
          </button>
          <span className="font-semibold text-lg">API-Assertify</span>
          <div className="w-7 h-7" />

          {menuOpen && (
            <div id="mobile-menu-dropdown" className="absolute top-full left-2 mt-2 w-44 bg-white dark:bg-gray-800 border rounded shadow-lg z-50">
              <button className="w-full px-4 py-2" onClick={() => openPanel("sidebar")}>History</button>
              <button className="w-full px-4 py-2" onClick={() => openPanel("response")}>Response</button>
            </div>
          )}
        </div>

        {/* API Form Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <ApiForm setResponseData={handleRequestComplete} historyItem={selectedHistoryItem} token={token} />
        </div>
      </div>

      {/* Desktop Response Viewer */}
      <div className="hidden md:flex flex-[1] border-l border-gray-300 dark:border-gray-700 overflow-auto">
        <ResponseViewer responseData={responseData} />
      </div>

      {/* Mobile overlays */}
      {(panelOpen === "sidebar" || panelOpen === "response") && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={closePanel} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-72 bg-gray-50 dark:bg-gray-900 p-4 shadow-xl transform transition-transform md:hidden
        ${panelOpen === "sidebar" ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">History & Collections</h2>
          <HiX className="w-6 h-6 cursor-pointer" onClick={closePanel} />
        </div>
        <div className="flex flex-col h-full">
          <div className="h-1/2 overflow-y-auto">
            <Sidebar loadHistoryItem={loadHistoryItem} historyItems={historyItems} />
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
      </div>

      {/* Mobile Response */}
      <div className={`fixed top-0 right-0 z-50 h-full w-72 bg-gray-50 dark:bg-gray-900 p-4 shadow-xl transform transition-transform md:hidden
        ${panelOpen === "response" ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Response</h2>
          <HiX className="w-6 h-6 cursor-pointer" onClick={closePanel} />
        </div>
        <div className="h-full overflow-auto">
          <ResponseViewer responseData={responseData} />
        </div>
      </div>

      {/* Add to Collection Modal */}
      {showAddToCollection && (
        <AddToCollectionModal
          requestId={selectedHistoryItem?.id}
          collections={collections}
          onClose={() => setShowAddToCollection(false)}
          onSuccess={async () => {
            if (user && token) setCollections(await getCollections(token));
            else setCollections(JSON.parse(localStorage.getItem("collections") || "[]"));
          }}
          onSelectCollection={handleAddToCollection}
        />
      )}
    </div>
  );
}
