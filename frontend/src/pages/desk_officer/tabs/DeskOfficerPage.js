import { useState, useEffect } from "react";
<<<<<<< HEAD
import Navbar from "../components/navBar";
import Sidebar from "../components/sideBar";
=======
import Navbar from '../components/navBar';
import Sidebar from '../components/sideBar';
>>>>>>> 610861c1d3cb483da76266e0056386a596155f81

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
