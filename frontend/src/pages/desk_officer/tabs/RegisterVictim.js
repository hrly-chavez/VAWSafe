import AdministrativeInfo from "../components/AdministrativeInfo";
import Navbar from "../navBar";
import Sidebar from "../sideBar";
import { useState } from "react";

export default function RegisterVictim() {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    incident_details: [
      {
        reportType: "Reported by the victim-survivor",
        informantName: "",
        informantRelationship: "",
        informantContact: "",
      },
    ],
    perpetrators: [
      {
        first_name: "",
        middle_name: "",
        last_name: "",
      },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    console.log(JSON.stringify(formData));
    e.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/desk_officer/victim_survivors/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log(data);
      // Optionally reset form or redirect
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Navbar></Navbar>

      <div className="flex flex-row">
        <div className="">
          <Sidebar></Sidebar>
        </div>

        {/* main content */}
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 h-[80vh] overflow-y-auto">
          <AdministrativeInfo data={formData} onChange={handleChange} />
          <button
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
