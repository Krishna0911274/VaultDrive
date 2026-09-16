import { useState } from "react";
import "./Login.css";
import { loginUser } from "../services/api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      console.log("Login successful");
      console.log("Token:", data.access_token);

      localStorage.setItem("access_token", data.access_token);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="brand-mark">
            <svg
              className="brand-logo"
              width="30"
              height="30"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="1"
                y="1"
                width="34"
                height="34"
                rx="9"
                fill="#171E32"
                stroke="#2DD4BF"
                strokeWidth="1.4"
              />
              <circle
                cx="18"
                cy="18"
                r="10.5"
                stroke="#2DD4BF"
                strokeWidth="1.2"
                strokeOpacity="0.45"
              />
              <circle
                cx="18"
                cy="18"
                r="6.5"
                stroke="#5EEAD4"
                strokeWidth="1.2"
              />
              <line
                x1="18"
                y1="18"
                x2="18"
                y2="10.5"
                stroke="#5EEAD4"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="18" cy="18" r="1.6" fill="#5EEAD4" />
            </svg>
            VaultDrive
          </div>

          <h1 className="brand-headline">
            One vault.
            <br />
            Every file, every teammate.
          </h1>

          <p className="brand-subtext">
            Every file is fingerprinted before it's stored, so duplicates never
            eat your storage. Every folder has an owner, so nothing gets seen or
            touched without permission.
          </p>
        </div>

        <svg
          className="vault-dial"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="200" cy="200" r="160" className="dial-ring dial-ring-1" />
          <circle cx="200" cy="200" r="120" className="dial-ring dial-ring-2" />
          <circle cx="200" cy="200" r="80" className="dial-ring dial-ring-3" />
          <line x1="200" y1="200" x2="200" y2="60" className="dial-needle" />
          <circle cx="200" cy="200" r="6" className="dial-center" />
        </svg>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Log in to get to your files.</p>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="password">Password</label>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="auth-switch">
            New to VaultDrive? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
