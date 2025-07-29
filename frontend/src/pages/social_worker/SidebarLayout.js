// SidebarLayout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './SidebarLayout.css'; // optional for styling

const SidebarLayout = () => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Social Worker</h2>
        <nav>
          <ul>
            <li><Link to="/social_worker/dashboard">Dashboard</Link></li>
            <li><Link to="/social_worker/profile">Profile</Link></li>
            <li><Link to="/social_worker/cases">Cases</Link></li>
            <li><Link to="/social_worker/user">User</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <Outlet /> {/* This renders the nested page */}
      </main>
    </div>
  );
};

export default SidebarLayout;
