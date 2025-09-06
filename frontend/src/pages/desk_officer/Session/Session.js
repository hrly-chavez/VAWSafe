import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";


// pages
import FaceRecog from "./FaceRecog";
import Schedule from "./Schedule";
import Form3 from "./Form3";

export default function SessionForm({ formDataState, setFormDataState }) {
  const [openSections, setOpenSections] = useState({
    sessionDetails: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmitSchedule = () => {
    alert("Session scheduled successfully!");
  };

  const handleStartSession = () => {
    alert("Session started.");
  };

  return (
    <div className="border-2 border-blue-600 rounded-lg p-6 bg-white max-w-5xl mx-auto shadow mt-10 space-y-6">
      {/* Main Title */}
      <h2 className="text-xl font-bold text-blue-800">
        Session Intake Form
      </h2>

      {/* Collapsible Section */}
      <div>
        <button
          onClick={() => toggleSection("sessionDetails")}
          className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
        >
          {openSections.sessionDetails ? "▼" : "▶"} Victim Session Details
        </button>
        {openSections.sessionDetails && (
          <div className="mt-4 border-l-4 border-blue-500 pl-4">
            <Schedule
              formDataState={formDataState}
              setFormDataState={setFormDataState}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {openSections.sessionDetails && (
        <div className="flex justify-end gap-4 pt-6">
          <button
            onClick={handleSubmitSchedule}
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            <CheckCircleIcon className="h-5 w-5 text-white" />
            Submit to Schedule Session
          </button>
          <button
            onClick={handleStartSession}
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            <PlayCircleIcon className="h-5 w-5 text-white" />
            Start Session Now
          </button>
        </div>
      )}
    </div>
  );
}
