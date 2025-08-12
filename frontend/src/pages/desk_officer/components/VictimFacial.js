// src/pages/desk_officer/components/VictimFacial.js
import React from "react";
import Navbar from "../components/navBar";     
import Sidebar from "../components/sideBar";   

export default function VictimFacial() {
  return (
    <div className="outline-2">
      <Navbar />

      <div className="flex flex-row">
        <Sidebar />

        {/* main content */}
        <div className="h-[80vh] overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-semibold">Victim Facial Page</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
