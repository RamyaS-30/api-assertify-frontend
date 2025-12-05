import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";       // Landing page with Signup/Login/Skip
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import App from "./App";               // Your current API-Assertify dashboard

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Landing / Home */}
        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Main App / Dashboard */}
        <Route path="/app" element={<App />} />
      </Routes>
    </Router>
  );
}
