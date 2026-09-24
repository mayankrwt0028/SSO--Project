import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = "http://localhost:3000";
function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }
      setMessage(data.message);
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
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
        <h1>Forgot Password?</h1>{" "}
        <p className="auth-subtitle">
          {" "}
          Enter your email and we'll send you a password reset link.{" "}
        </p>{" "}
        <form onSubmit={handleSubmit}>
          {" "}
          <div className="form-group">
            {" "}
            <label>Email</label>{" "}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />{" "}
            {error && <p className="field-error"> {error} </p>}{" "}
            {message && <p className="success-message"> {message} </p>}{" "}
          </div>{" "}
          <button type="submit" className="primary-btn" disabled={loading}>
            {" "}
            {loading ? "Sending..." : "Send Reset Link"}{" "}
          </button>{" "}
        </form>{" "}
        <button
          type="button"
          className="forgot-password"
          onClick={() => navigate("/")}
        >
          {" "}
          Back to Login{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}
export default ForgotPasswordPage;
