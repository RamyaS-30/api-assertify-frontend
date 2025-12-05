import React from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";

export default function Home() {
  const navigate = useNavigate();
  const { user, skippedLogin, skipLogin } = useAuthStatus();

  const goToApp = () => navigate("/app");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-300 to-blue-200">
      <Header />

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-10 max-w-xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Welcome to API-Assertify 🚀
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            API-Assertify helps you test APIs faster and smarter. Manage requests, inspect responses,
            store collections, and simplify your workflow — all in one clean interface.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Whether you're debugging or exploring APIs, API-Assertify gives you a powerful workspace
            to get things done.
          </p>

          {/* Buttons */}
          {!user && !skippedLogin && (
            <div className="flex justify-center gap-4">
              <button
                onClick={skipLogin}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
              >
                Continue as Guest
              </button>
            </div>
          )}

          {(user || skippedLogin) && (
            <button
              onClick={goToApp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
            >
              Go to App
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
