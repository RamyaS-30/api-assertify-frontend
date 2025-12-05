import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-10 max-w-xs sm:max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Login</h2>
        {error && (
          <p className="text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded mb-6 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:text-gray-100"
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:text-gray-100"
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold transition"
        >
          Login
        </button>

        <p className="mt-6 text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-green-600 hover:underline dark:text-green-400 font-semibold"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
