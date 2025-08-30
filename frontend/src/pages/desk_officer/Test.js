import Navbar from "./navBar";
import Sidebar from "./sideBar";

export default function DeskOfficerPage() {
  return (
    <div>
      <Navbar></Navbar>
      <div className="grid grid-cols-2">
        <div>
          <Sidebar></Sidebar>
        </div>
        <div>Main Content</div>
      </div>
    </div>
  );
}
