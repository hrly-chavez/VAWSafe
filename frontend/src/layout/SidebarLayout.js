import React, { useState } from "react";
import Sidebar from "../pages/Sidebar";
import Navbar from "../pages/Navbar";
import { Outlet } from "react-router-dom";

export default function SidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Sidebar + Content */}
      <div className="flex flex-1 pt-[70px]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />


        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 py-4 overflow-auto sm:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
