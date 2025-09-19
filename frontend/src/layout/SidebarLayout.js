import React from "react";
import Sidebar from "../pages/Sidebar";
import Navbar from "../pages/Navbar";
import { Outlet } from "react-router-dom";

export default function SidebarLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Content below Navbar */}
      <div className="pt-[70px] flex">
        {/* Sidebar (scrolls with page) */}
        <Sidebar />

        {/* Main Content (scrolls with sidebar) */}
        <main className="flex-1 px-6 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}