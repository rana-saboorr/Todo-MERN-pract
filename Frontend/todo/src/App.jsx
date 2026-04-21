import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "./components/axios";

import SignUp from "./pages/signup";
import Login from "./pages/login";
import Todo from "./pages/todo";
import ProtectedRoute from "./components/ProtectedRoute";
import { login, logout } from "./store/authSlice";

function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get("/me");
        dispatch(login(res.data));
      } catch {
        dispatch(logout());
      } finally {
        setAuthChecked(true); // ✅ Always mark as checked
      }
    };
    checkUser();
  }, []);

  // ✅ Don't render routes at all until we know auth status
  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/todo"
          element={
            <ProtectedRoute>
              <Todo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;