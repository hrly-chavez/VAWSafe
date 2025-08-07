import { useState, useEffect } from "react";
import Sidebar from "./components/sideBar";
import Navbar from "./components/navBar";
import AdministrativeInfo from "./components/AdministrativeInfo";

export default function RegisterVictim() {
  return (
    <div className="outline-2">
      <Navbar></Navbar>

      <div className="flex flex-row">
        <Sidebar></Sidebar>

        {/* main content */}
        <div className="h-[80vh] overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 ">
            <form>
              <AdministrativeInfo />
              <AdministrativeInfo />
              <AdministrativeInfo />
              <AdministrativeInfo />
              <AdministrativeInfo />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
