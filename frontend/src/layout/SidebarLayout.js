import React from "react";
import Sidebar from "../pages/Sidebar";
import Navbar from "../pages/Navbar";
import { Outlet } from "react-router-dom";

export default function SidebarLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        {/* Sidebar below Navbar, vertical on the left */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-6 py-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
