import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Header() {
  const navigate = useNavigate();
  const { user, skippedLogin, skipLogin } = useAuthStatus();

  const handleLogout = async () => {
    localStorage.removeItem("skippedLogin"); // clear guest mode

    if (user) {
      await signOut(auth);
    }

    navigate("/");
    window.location.reload(); // ensure header re-renders correctly
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 shadow">
      <h1
        className="text-xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer"
        onClick={() => navigate("/")}
      >
        API-Assertify
      </h1>

      <div className="flex items-center gap-4">

        {/* ----- LOGGED-IN USER ----- */}
        {user && (
          <>
            <span className="text-gray-900 dark:text-gray-100 font-semibold">
              {user.email}
            </span>

            <img
              src={`https://www.gravatar.com/avatar/${user.email}?d=identicon`}
              alt="profile"
              className="w-8 h-8 rounded-full"
            />

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}

        {/* ----- GUEST MODE ----- */}
        {skippedLogin && !user && (
          <>
            <span className="text-gray-900 dark:text-gray-100 font-semibold">
              Guest
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}

        {/* ----- NOT LOGGED IN ----- */}
        {!user && !skippedLogin && (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1 rounded"
            >
              Sign Up
            </button>

            <button
              onClick={skipLogin}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-1 rounded"
            >
              Skip Login
            </button>
          </>
        )}

      </div>
    </header>
  );
}
