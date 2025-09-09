import SidebarTest from "./SidebarTest";
import { useState } from "react";

import Dashboard from "./DeskOfficer/Dashboard";
import RegisterVictimTest from "./RegisterVictim/RegisterVictimTest";

export default function Test() {
  const [activeView, setActiveView] = useState("Dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "Dashboard":
        return <Dashboard />;
      case "Register":
        return <RegisterVictimTest />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <SidebarTest activeView={activeView} setActiveView={setActiveView} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {renderContent()}
      </div>
    </div>
  );
}
