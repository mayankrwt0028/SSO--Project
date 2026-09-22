import { useState } from "react";

import "./App.css";

import AuthPage from "./pages/AuthPage";
import PasswordSetupPage from "./pages/passwordSetupPage";
import UsersPage from "./pages/userPage";

import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  const [pathname] = useState(
    window.location.pathname
  );

  if (pathname === "/create-password") {
    return <PasswordSetupPage />;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return user ? <UsersPage /> : <AuthPage />;
}

export default App;