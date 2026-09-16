import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { registerUser, loginUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Create new account
      const user = await registerUser(name, email, password);

      console.log("Registration successful:", user);

      // 2. Automatically login
      const loginData = await loginUser(email, password);

      console.log("Automatic login successful");

      // 3. Save JWT token
      localStorage.setItem("access_token", loginData.access_token);

      // 4. Redirect to Dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      // Show backend error
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
            Start your vault.
            <br />
            Free for your first 5GB.
          </h1>

          <p className="brand-subtext">
            Create a workspace, invite your team, and decide exactly who can
            view, edit, or own each file — from day one.
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
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Takes less than a minute.</p>
          </div>

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jordan Lee"
              autoComplete="name"
            />
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="user1234"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="auth-switch">
            Already have an account? <a href="/">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
