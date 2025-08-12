import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/sideBar";
import Navbar from "../components/navBar";
import AdministrativeInfo from "../components/AdministrativeInfo";
import VictimInfo from "../components/VictimInfo";
import IncidentInfo from "../components/IncidentInfo";
import PerpetratorInfo from "../components/PerpetratorInfo";

export default function RegisterVictim() {
  const location = useLocation();
  const victimPhotos = location.state?.victimPhotos || [];

  const [formDataState, setFormDataState] = useState({
    vic_first_name: "",
    vic_last_name: "",
    vic_sex: "",
  });

  const handleChange = (e) => {
    setFormDataState({ ...formDataState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(formDataState).forEach(([key, value]) => {
      formData.append(key, value);
    });
    victimPhotos.forEach((photo) => {
      formData.append("victim_photos", photo);
    });

    try {
      const res = await fetch("/api/desk_officer/victims/register/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert("Victim registered successfully!");
      } else {
        alert(data.error || "Failed to register victim.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="outline-2">
      <Navbar />
      <div className="flex flex-row">
        <Sidebar />
        <div className="h-[80vh] overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
            {/* Other form sections */}
            <AdministrativeInfo />
            <VictimInfo />
            <IncidentInfo />
            <PerpetratorInfo />

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
