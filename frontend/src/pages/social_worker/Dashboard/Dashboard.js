import React from 'react';
import Navbar from '../../Navbar';

const Dashboard = () => {
  return (
    <div>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        <h1>Dashboard Page</h1>
        <p>Welcome to the Social Worker Dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;
