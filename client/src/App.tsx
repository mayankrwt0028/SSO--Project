
import "./App.css";

import AuthPage from "./pages/AuthPage";
import PasswordSetupPage from "./pages/passwordSetupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UsersPage from "./pages/userPage";

import { useAuth } from "./context/AuthContext";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminUsersPage from "./pages/AdminUsersPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
  path="/"
  element={
    !user ? (
      <AuthPage />
    ) : user.role === "ADMIN" ? (
      <Navigate to="/admin/users" replace />
    ) : (
      <UsersPage />
    )
  }
/>

        <Route
          path="/create-password"
          element={<PasswordSetupPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

        <Route
  path="/admin/users"
  element={
    user?.role === "ADMIN" ? (
      <AdminUsersPage />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

