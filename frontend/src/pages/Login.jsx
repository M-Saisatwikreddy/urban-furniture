import { useState } from "react";

function Login({ onLogin, onShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const savedUser = JSON.parse(localStorage.getItem("urbanUser"));

    if (!savedUser) {
      setError("No account found. Please create an account first.");
      return;
    }

    if (savedUser.email !== email || savedUser.password !== password) {
      setError("Invalid email or password.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");

    onLogin(savedUser);
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

          <h2>Manage your business<br />with confidence.</h2>

          <p>
            Manage sales, purchases, inventory and accounting
            from one simple platform.
          </p>

          <div className="auth-features">
            <div>✓ Sales & Invoices</div>
            <div>✓ Purchases & Vendor Bills</div>
            <div>✓ Accounting & Reports</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back!</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-button">
              Login
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <p className="auth-switch">
            Don't have an account?
            <button
              type="button"
              className="link-button"
              onClick={onShowSignup}
            >
              Create Account
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

export default Login;