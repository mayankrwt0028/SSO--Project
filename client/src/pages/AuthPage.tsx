
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3000";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [oauthLoading, setOauthLoading] = useState<
    "google" | "github" | null
  >(null);

  const [errors, setErrors] = useState<FormErrors>({});

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { setUser } = useAuth();

  const validateName = (value: string) => {
    const trimmedName = value.trim();

    if (!trimmedName) {
      return "Name is required";
    }

    if (trimmedName.length < 4) {
      return "Name must be at least 4 characters";
    }

    if (trimmedName.length > 50) {
      return "Name must be less than 50 characters";
    }

    return "";
  };

  const validateEmail = (value: string) => {
    const trimmedEmail = value.trim();

    if (!trimmedEmail) {
      return "Email is required";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email";
    }

    return "";
  };

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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!isLogin) {
      const nameError = validateName(name);

      if (nameError) {
        newErrors.name = nameError;
      }
    }

    const emailError = validateEmail(email);

    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setToast(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin
        ? "/auth/login"
        : "/auth/signup";

      const body = isLogin
        ? {
            email: email.trim(),
            password,
          }
        : {
            name: name.trim(),
            email: email.trim(),
            password,
          };

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          isLogin &&
          response.status === 401
        ) {
          setErrors({
            password:
              data.message ||
              "Invalid email or password",
          });

          return;
        }

        if (
          response.status === 400 &&
          data.message?.includes(
            "original login method"
          )
        ) {
          setErrors({
            email: data.message,
          });

          return;
        }

        if (
          !isLogin &&
          response.status === 409
        ) {
          setErrors({
            email:
              "An account already exists with this email",
          });

          return;
        }

        setErrors({
          email:
            data.message ||
            "Something went wrong",
        });

        return;
      }

      if (isLogin) {
        setUser(data.user);

        setToast({
          type: "success",
          message: data.message,
        });
      } else {
        setToast({
          type: "success",
          message: data.message,
        });

        setIsLogin(true);
      }

      setName("");
      setEmail("");
      setPassword("");
      setErrors({});
    } catch (error) {
      console.error("AUTH ERROR:", error);

      setToast({
        type: "error",
        message: "Unable to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);

    if (isLogin) return;

    const error = validateName(value);

    setErrors((previous) => ({
      ...previous,
      name: error || undefined,
    }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    const error = validateEmail(value);

    setErrors((previous) => ({
      ...previous,
      email: error || undefined,
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    const error = validatePassword(value);

    setErrors((previous) => ({
      ...previous,
      password: error || undefined,
    }));
  };

  const handleGoogleLogin = () => {
    setOauthLoading("google");

    window.location.href =
      `${API_URL}/auth/google/login`;
  };

  const handleGithubLogin = () => {
    setOauthLoading("github");

    window.location.href =
      `${API_URL}/auth/github/login`;
  };

  const switchMode = () => {
    setIsLogin(!isLogin);

    setName("");
    setEmail("");
    setPassword("");

    setErrors({});
    setToast(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const error = params.get("error");

    if (error === "account_exists") {
      setErrors({
        email:
          "An account already exists with this email. Please login using your original login method.",
      });

      window.history.replaceState(
        {},
        "",
        window.location.pathname
      );
    }
  }, []);

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

        <h1>
          {isLogin
            ? "Welcome Back"
            : "Create Account"}
        </h1>

        <p className="auth-subtitle">
          {isLogin
            ? "Login to continue"
            : "Create your account to get started"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                className={
                  errors.name
                    ? "input-error"
                    : ""
                }
                onChange={(e) =>
                  handleNameChange(
                    e.target.value
                  )
                }
              />

              {errors.name && (
                <p className="field-error">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>

            <input
              type="text"
              inputMode="email"
              placeholder="Enter your email"
              value={email}
              className={
                errors.email
                  ? "input-error"
                  : ""
              }
              onChange={(e) =>
                handleEmailChange(
                  e.target.value
                )
              }
            />

            {errors.email && (
              <p className="field-error">
                {errors.email}
              </p>
            )}
          </div>

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
              onChange={(e) =>
                handlePasswordChange(
                  e.target.value
                )
              }
            />

            {errors.password && (
              <p className="field-error">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === "google"
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        <button
          type="button"
          className="github-btn"
          onClick={handleGithubLogin}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === "github"
            ? "Connecting..."
            : "Continue with GitHub"}
        </button>

        <p className="switch-auth">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={switchMode}
          >
            {isLogin
              ? " Sign Up"
              : " Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;

