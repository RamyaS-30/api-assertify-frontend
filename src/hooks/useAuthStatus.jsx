import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function useAuthStatus() {
  const [user, setUser] = useState(null);
  const [skippedLogin, setSkippedLogin] = useState(
    localStorage.getItem("skippedLogin") === "true"
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If user logs in, disable guest mode
        localStorage.removeItem("skippedLogin");
        setSkippedLogin(false);
      }
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

  const skipLogin = () => {
    setSkippedLogin(true);
    localStorage.setItem("skippedLogin", "true");

    // 👇 Force React components to re-render immediately
    window.dispatchEvent(new Event("storage"));
  };

  // 👇 Listen for storage updates (reactive across components)
  useEffect(() => {
    const handler = () => {
      setSkippedLogin(localStorage.getItem("skippedLogin") === "true");
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return { user, skippedLogin, skipLogin };
}
