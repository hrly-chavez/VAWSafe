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
        <aside className="sticky top-[70px] h-[calc(100vh-70px)] w-[220px] bg-[#2F2F4F] text-white font-poppins shadow-lg z-10 overflow-hidden">
          <Sidebar />
        </aside>

        {/* Main Content (scrolls with sidebar) */}
        <main className="flex-1 px-6 py-4 overflow-auto max-h-[calc(100vh-70px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
