import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import './SidebarLayout.css';

const SidebarLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user data from localStorage (saved on login)
    const storedUser = localStorage.getItem('vawsafeUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error('Failed to parse stored user data.');
      }
    }
  }, []);

  const sidebarItems = [
    { icon: '/images/dashboard.png', label: 'Dashboard', path: '/social_worker/dashboard' },
    { icon: '/images/edit.png', label: 'Case Records', path: '/social_worker/case-records' },
    { icon: '/images/tools.png', label: 'Sessions', path: '/social_worker/sessions' },
    { icon: '/images/high-value.png', label: 'Services', path: '/social_worker/services' },
    { icon: '/images/hands.png', label: 'VAWC Victims', path: '/social_worker/victims' },
  ];

  // Safe name fallback
  const displayName =
    user?.name || `${user?.fname || ''} ${user?.lname || ''}`.trim();

  // Safe profile photo fallback
  const profilePhoto = user?.profile_photo_url || '/images/bussiness-man.png';

  return (
    <>
      <Navbar />
      <button
        className="sw-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>
      <div className={`sw-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className="sw-sidebar">
          <div className="sw-profile">
            <img src={profilePhoto} className="sw-pfp" alt="Profile" />
            <div className="sw-profile-title-container">
              <h1 className="sw-profile-title">{displayName || 'SOCIAL WORKER'}</h1>
            </div>
          </div>

          <div className="sw-choices">
            {sidebarItems.map((item, index) => (
              <div className="sw-row" key={index}>
                <img
                  src={item.icon}
                  className="sw-dashboard-icons"
                  alt={item.label}
                />
                <Link to={item.path}>{item.label}</Link>
              </div>
            ))}
          </div>
        </aside>

        <main className="sw-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default SidebarLayout;
