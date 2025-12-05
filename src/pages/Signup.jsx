import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-10 max-w-xs sm:max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Sign Up</h2>
        {error && (
          <p className="text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded mb-6 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
        />

        <button
          onClick={handleSignup}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition"
        >
          Sign Up
        </button>

        <p className="mt-6 text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline dark:text-blue-400 font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
