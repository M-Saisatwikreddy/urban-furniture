import { useEffect, useState } from "react";

import Contacts from "./pages/Contacts";
import Products from "./pages/Products";
import Accounts from "./pages/Accounts";
import Journals from "./pages/Journals";
import Purchases from "./pages/Purchases";
import VendorBills from "./pages/VendorBills";
import Payments from "./pages/Payments";
import Sales from "./pages/Sales";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Budgets from "./pages/Budgets";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("urbanUser")) || null;
    } catch {
      return null;
    }
  });

  const [showSignup, setShowSignup] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    try {
      const savedUser = JSON.parse(localStorage.getItem("urbanUser"));
      setUser(savedUser);
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
    setShowSignup(false);
    setActiveMenu("Dashboard");
  };

  const handleSignup = (newUser) => {
    setUser(newUser);
    setIsLoggedIn(true);
    setShowSignup(false);
    setActiveMenu("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUser(null);
    setActiveMenu("Dashboard");
    setShowSignup(false);
  };

  /* ---------------- AUTH ---------------- */

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <Signup
          onSignup={handleSignup}
          onShowLogin={() => setShowSignup(false)}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onShowSignup={() => setShowSignup(true)}
      />
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  const Dashboard = () => {
    return (
      <div className="dashboard">
        <div className="dashboard-welcome">
          <h2>Welcome to Urban Furniture 👋</h2>
          <p>
            Manage your furniture business, sales, purchases and accounting
            from one place.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <span>Total Contacts</span>
              <strong>2</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🪑</div>
            <div>
              <span>Total Products</span>
              <strong>4</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <span>Total Sales</span>
              <strong>₹0</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div>
              <span>Total Purchases</span>
              <strong>₹0</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>Recent Transactions</h3>
              <p>Your latest business activities</p>
            </div>

            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No transactions yet</h3>
              <p>Sales and purchase transactions will appear here.</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3>Quick Actions</h3>
              <p>Common tasks</p>
            </div>

            <div className="quick-actions">
              <button onClick={() => setActiveMenu("Sales")}>
                + New Sale
              </button>

              <button onClick={() => setActiveMenu("Purchases")}>
                + New Purchase
              </button>

              <button onClick={() => setActiveMenu("Contacts")}>
                + Add Contact
              </button>

              <button onClick={() => setActiveMenu("Products")}>
                + Add Product
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- PAGE CONTENT ---------------- */

  const renderPage = () => {
    switch (activeMenu) {
      case "Contacts":
        return <Contacts />;

      case "Products":
        return <Products />;

      case "Accounts":
        return <Accounts />;

      case "Journals":
        return <Journals />;

      case "Purchases":
        return <Purchases />;

      case "Vendor Bills":
        return <VendorBills />;

      case "Sales":
        return <Sales />;

      case "Invoices":
        return <Invoices />;

      case "Payments":
        return <Payments />;

      case "Reports":
        return <Reports />;

      case "Budget":
        return <Budgets />;

      case "Dashboard":
      default:
        return <Dashboard />;
    }
  };

  /* ---------------- SIDEBAR ---------------- */

  return (
    <div className="app-layout">
      <aside className="sidebar">
        {/* LOGO */}
        <div className="sidebar-header">
          <div className="sidebar-logo">UF</div>

          <div className="sidebar-brand">
            <h2>Urban Furniture</h2>
            <span>Accounting System</span>
          </div>
        </div>

        {/* SCROLLABLE MENU */}
        <div className="sidebar-menu">
          <div className="menu-title">MAIN MENU</div>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Dashboard")}
          >
            <span className="menu-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Contacts" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Contacts")}
          >
            <span className="menu-icon">👥</span>
            <span>Contacts</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Products" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Products")}
          >
            <span className="menu-icon">🪑</span>
            <span>Products</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Accounts" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Accounts")}
          >
            <span className="menu-icon">▣</span>
            <span>Accounts</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Journals" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Journals")}
          >
            <span className="menu-icon">📒</span>
            <span>Journals</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Purchases" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Purchases")}
          >
            <span className="menu-icon">🛒</span>
            <span>Purchases</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Vendor Bills" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Vendor Bills")}
          >
            <span className="menu-icon">📄</span>
            <span>Vendor Bills</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Sales" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Sales")}
          >
            <span className="menu-icon">💰</span>
            <span>Sales</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Invoices" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Invoices")}
          >
            <span className="menu-icon">🧾</span>
            <span>Invoices</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Payments" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Payments")}
          >
            <span className="menu-icon">💳</span>
            <span>Payments</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Reports" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Reports")}
          >
            <span className="menu-icon">📊</span>
            <span>Reports</span>
          </button>

          <button
            type="button"
            className={`menu-item ${
              activeMenu === "Budget" ? "active" : ""
            }`}
            onClick={() => setActiveMenu("Budget")}
          >
            <span className="menu-icon">📋</span>
            <span>Budget</span>
          </button>
        </div>

        {/* FIXED BOTTOM SECTION */}
        <div className="sidebar-bottom">
          <button type="button" className="settings-button">
            <span className="menu-icon">⚙</span>
            <span>Settings</span>
          </button>

          <div className="user-box">
            <div className="avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div className="user-details">
              <strong>{user?.name || "Admin"}</strong>
              <span>Business Owner</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span className="logout-icon">↪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN AREA ---------------- */}

      <main className="main-content">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <h1>{activeMenu}</h1>

            {activeMenu === "Dashboard" && (
              <p>
                Welcome back, {user?.name || "Admin"} 👋
              </p>
            )}
          </div>

          <div className="topbar-right">
            <button type="button" className="notification-button">
              🔔
            </button>

            <div className="topbar-user">
              <div className="topbar-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>

              <div>
                <strong>{user?.name || "Admin"}</strong>
                <span>Business Owner</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <div className="page-content">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;