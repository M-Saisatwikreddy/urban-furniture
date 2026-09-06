import { useState } from "react";

function Signup({ onSignup, onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 4) {
      setError("Password must contain at least 4 characters.");
      return;
    }

    const existingUser = localStorage.getItem("urbanUser");

    if (existingUser) {
      setError("An account already exists. Please login.");
      return;
    }

    const user = {
      name,
      email,
      password,
    };

    localStorage.setItem("urbanUser", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    onSignup(user);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">UF</div>

          <div>
            <h1>Urban Furniture</h1>
            <span>Accounting System</span>
          </div>
        </div>

        <div className="auth-intro">
          <div className="auth-chair">🪑</div>

          <h2>Build your business<br />the smarter way.</h2>

          <p>
            Create your account and manage your furniture
            business from one powerful dashboard.
          </p>

          <div className="auth-features">
            <div>✓ Manage Contacts & Products</div>
            <div>✓ Track Sales & Purchases</div>
            <div>✓ View Financial Reports</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card signup-card">
          <div className="auth-card-header">
            <h2>Create your account</h2>
            <p>Get started with Urban Furniture</p>
          </div>

          <form onSubmit={handleSignup}>
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-button">
              Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?
            <button
              type="button"
              className="link-button"
              onClick={onShowLogin}
            >
              Login
            </button>
          </p>
        </div>

        <p className="auth-footer">
          © 2026 Urban Furniture • Accounting Management System
        </p>
      </div>
    </div>
  );
}

export default Signup;