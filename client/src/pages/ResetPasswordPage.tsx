import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
const API_URL = "http://localhost:3000";
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const validatePassword = () => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Za-z]/.test(password)) {
      return "Password must contain at least one letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Invalid password reset link");
      return;
    }
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to reset password");
        return;
      }
      setMessage(data.message);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      {" "}
      <div className="auth-card">
        {" "}
        <h1>Reset Password</h1>{" "}
        <p className="auth-subtitle">
          {" "}
          Create a new password for your account.{" "}
        </p>{" "}
        <form onSubmit={handleSubmit}>
          {" "}
          <div className="form-group">
            {" "}
            <label>New Password</label>{" "}
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />{" "}
          </div>{" "}
          <div className="form-group">
            {" "}
            <label>Confirm Password</label>{" "}
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />{" "}
          </div>{" "}
          {error && <p className="field-error"> {error} </p>}{" "}
          {message && <p className="success-message"> {message} </p>}{" "}
          <button type="submit" className="primary-btn" disabled={loading}>
            {" "}
            {loading ? "Resetting..." : "Reset Password"}{" "}
          </button>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
}
export default ResetPasswordPage;
