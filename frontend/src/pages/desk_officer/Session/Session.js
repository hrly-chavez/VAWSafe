import Sidebar from "../components/sideBar";
import Navbar from "../components/navBar";

export default function Session() {
  return (
    <div className="outline-2">
      <Navbar />
      <div className="flex flex-row">
        <Sidebar />
        <div className="h-[80vh] overflow-y-auto w-full">
          {/* Main content */}
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
            {/* content */}
          </div>
        </div>
      </div>
    </div>
  );
}
