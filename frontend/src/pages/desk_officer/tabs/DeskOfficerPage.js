import { useState, useEffect } from "react";
import Navbar from "../components/navBar";
import Sidebar from "../components/sideBar";

export default function DeskOfficerPage() {
  return (
    <div>
      <Navbar></Navbar>
      <div className="grid grid-cols-2">
        <div>
          <Sidebar></Sidebar>
        </div>
        <div>desk officer</div>
      </div>
    </div>
  );
}
