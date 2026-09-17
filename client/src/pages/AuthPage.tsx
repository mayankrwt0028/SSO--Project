import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3000";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<
  "google" | "github" | null
>(null);

 
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {setUser} = useAuth();

 const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setToast(null);
  setLoading(true);

  try {
    const endpoint = isLogin
      ? "/auth/login"
      : "/auth/signup";

    const body = isLogin
      ? {
          email,
          password,
        }
      : {
          name,
          email,
          password,
        };

    console.log("Request:", `${API_URL}${endpoint}`);

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

    console.log("Response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      setToast({
        type: "error",
        message:
          data.message || "Something went wrong",
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
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    setToast({
      type: "error",
      message: "Unable to connect to server",
    });
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = () => {
    setOauthLoading("google")
    window.location.href =
      `${API_URL}/auth/google/login`;
  };

  const handleGithubLogin = () => {
    setOauthLoading("github")
    window.location.href =
      `${API_URL}/auth/github/login`;
  };

  const switchMode = () => {
    setIsLogin(!isLogin);

    setName("");
    setEmail("");
    setPassword("");
   
  };

  useEffect(() => {
  const params = new URLSearchParams(
    window.location.search
  );

  const error = params.get("error");

  if (error === "account_exists") {
    setToast({
      type: "error",
      message:
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
          {isLogin ? "Welcome Back" : "Create Account"}
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
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
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
            {isLogin ? " Sign Up" : " Login"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default AuthPage;