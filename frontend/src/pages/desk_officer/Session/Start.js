import Form2 from "./Form2";
import Form3 from "./Form3";

import Navbar from "../components/navBar";
import Sidebar from "../components/sideBar";

export default function Start() {
  return (
    <div className="outline-2">
      <Navbar />
      <div className="flex flex-row">
        <Sidebar />
        <div className="h-[80vh] overflow-y-auto w-full">
          {/* Main content */}
          <Form2></Form2>
          <Form3></Form3>
        </div>
      </div>
    </div>
  );
}
