import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

function PasswordSetupPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const token = new URLSearchParams(
    window.location.search
  ).get("token");

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required";
    }

    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (!/[A-Za-z]/.test(value)) {
      return "Password must contain at least one letter";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number";
    }

    return "";
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    const passwordError =
      validatePassword(password);

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (!token) {
      setToast({
        type: "error",
        message:
          "Invalid password creation link",
      });

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/create-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setToast({
          type: "error",
          message:
            data.message ||
            "Unable to create password",
        });

        return;
      }

      setToast({
        type: "success",
        message: data.message,
      });

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch {
      setToast({
        type: "error",
        message:
          "Unable to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        <h1>Create Password</h1>

        <p className="auth-subtitle">
          Create a password to complete your
          account setup.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              className={
                errors.password
                  ? "input-error"
                  : ""
              }
              onChange={(e) => {
                setPassword(e.target.value);

                setErrors((previous) => ({
                  ...previous,
                  password:
                    validatePassword(
                      e.target.value
                    ) || undefined,
                }));
              }}
            />

            {errors.password && (
              <p className="field-error">
                {errors.password}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              className={
                errors.confirmPassword
                  ? "input-error"
                  : ""
              }
              onChange={(e) => {
                setConfirmPassword(
                  e.target.value
                );

                setErrors((previous) => ({
                  ...previous,
                  confirmPassword:
                    e.target.value !== password
                      ? "Passwords do not match"
                      : undefined,
                }));
              }}
            />

            {errors.confirmPassword && (
              <p className="field-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordSetupPage;