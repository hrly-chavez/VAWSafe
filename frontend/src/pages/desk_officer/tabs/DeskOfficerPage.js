import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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
