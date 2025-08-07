import { useState, useEffect } from "react";
import Sidebar from "./components/sideBar";
import Navbar from "./components/navBar";
import AdministrativeInfo from "./components/AdministrativeInfo";
import VictimInfo from "./components/VictimInfo";
import IncidentInfo from "./components/IncidentInfo";
import PerpetratorInfo from "./components/PerpetratorInfo";

export default function RegisterVictim() {
  return (
    <div className="outline-2">
      <Navbar></Navbar>

      <div className="flex flex-row">
        <Sidebar></Sidebar>

        {/* main content */}
        <div className="h-[80vh] overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 ">
            <AdministrativeInfo />
            <VictimInfo />
            <IncidentInfo />
            <PerpetratorInfo />

            <button className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
