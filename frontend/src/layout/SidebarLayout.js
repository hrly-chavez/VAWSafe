// src/layouts/SidebarLayout.js
import React from "react";
import Sidebar from "../pages/Sidebar"; // adjust path if your Sidebar is elsewhere
import { Outlet } from "react-router-dom";

export default function SidebarLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
