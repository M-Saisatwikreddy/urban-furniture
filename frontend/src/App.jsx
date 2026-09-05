import Contacts from "./pages/Contacts";
import Products from "./pages/Products";
import Accounts from "./pages/Accounts";
import { useState } from "react";
import "./App.css";

const menuItems = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Contacts", icon: "♙" },
  { name: "Products", icon: "▣" },
  { name: "Accounts", icon: "₹" },
  { name: "Journals", icon: "▤" },
  { name: "Purchases", icon: "🛒" },
  { name: "Sales", icon: "▧" },
  { name: "Payments", icon: "₹" },
  { name: "Reports", icon: "◫" },
  { name: "Budget", icon: "▥" },
];

function App() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const renderPage = () => {
    switch (activeMenu) {
      case "Dashboard":
        return <Dashboard />;

      case "Contacts":
        return <Contacts />;

      case "Products":
        return <Products />;
      case "Accounts":
       return <Accounts />;  

      default:
        return (
          <div className="coming-soon">
            <div className="coming-icon">🚧</div>
            <h2>{activeMenu}</h2>
            <p>
              This module is coming next. We are building the system
              step-by-step.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">UF</div>
          <div>
            <h2>Urban Furniture</h2>
            <span>Accounting System</span>
          </div>
        </div>

        <nav className="navigation">
          <p className="menu-title">MAIN MENU</p>

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${
                activeMenu === item.name ? "active" : ""
              }`}
              onClick={() => setActiveMenu(item.name)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="menu-item">
            <span className="menu-icon">⚙</span>
            Settings
          </button>

          <div className="user-box">
            <div className="avatar">A</div>

            <div>
              <strong>Admin</strong>
              <span>Business Owner</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{activeMenu}</h1>
            <p>Welcome back, Admin 👋</p>
          </div>

          <div className="topbar-actions">
            <button className="notification">🔔</button>

            <div className="profile">
              <div className="avatar">A</div>

              <div>
                <strong>Admin</strong>
                <span>Business Owner</span>
              </div>
            </div>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="welcome-card">
        <div>
          <h2>Welcome to Urban Furniture 👋</h2>
          <p>
            Manage your furniture business, sales, purchases and accounting
            from one place.
          </p>
        </div>
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
        <div className="table-card">
          <div className="panel-header">
            <div>
              <h3>Recent Transactions</h3>
              <p>Your latest business activities</p>
            </div>
          </div>

          <div className="empty-state">
            <div>📋</div>
            <h3>No transactions yet</h3>
            <p>
              Sales and purchase transactions will appear here.
            </p>
          </div>
        </div>

        <div className="table-card">
          <div className="panel-header">
            <div>
              <h3>Quick Actions</h3>
              <p>Common tasks</p>
            </div>
          </div>

          <div className="quick-actions">
            <button>+ New Sale</button>
            <button>+ New Purchase</button>
            <button>+ Add Contact</button>
            <button>+ Add Product</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;