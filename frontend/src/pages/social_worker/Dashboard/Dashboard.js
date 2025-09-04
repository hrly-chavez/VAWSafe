import React from 'react';
import Navbar from '../../Navbar';
import Sidebar from '../../Sidebar';

const Dashboard = () => {
  return (
    <div>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <h1>Dashboard Page</h1>
        <p>Welcome to the Social Worker Dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;
