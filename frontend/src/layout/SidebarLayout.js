import React, { useState, useContext } from "react";
import Sidebar from "../pages/Sidebar";
import Navbar from "../pages/Navbar";
import { NotificationContext } from "../context/NotificationContext";
import { Outlet } from "react-router-dom";

export default function SidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { count } = useContext(NotificationContext);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Sidebar + Content */}
      <div className="flex flex-1 pt-[70px]">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          notificationCount={count}   
        />

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 py-4 overflow-auto sm:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
