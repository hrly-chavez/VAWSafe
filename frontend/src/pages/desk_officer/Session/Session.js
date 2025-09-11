// src/pages/desk_officer/Session/Session.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import Schedule from "./Schedule";
import StartSession from "./StartSession";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
  api.get("/api/desk_officer/sessions/")
    .then((res) => setSessions(res.data))
    .catch((err) => console.error("Failed to fetch sessions", err));
}, []);

  const filteredSessions = sessions.filter((session) =>
    session.victim_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const next = () => setCurrentStep((prev) => prev + 1);
  const back = () => setCurrentStep((prev) => prev - 1);
  const cancel = () => {
    alert("Form cancelled!");
    setCurrentStep(1);
    navigate("/desk_officer/");
  };
  const submit = () => {
    alert("Form submitted!");
    setCurrentStep(1);
  };

  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return <Schedule back={back} next={next} />;
      case 2:
        return <StartSession back={back} cancel={cancel} />;
      default:
        return null;
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#292D96] mb-4">Sessions</h1>
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        List of Scheduled Sessions
      </h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search victim name..."
          className="border rounded px-3 py-2 w-full md:w-[250px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-sm">
          <thead className="bg-[#292D96] text-white text-sm">
            <tr>
              <th className="px-4 py-2 text-left">Victim Name</th>
              <th className="px-4 py-2 text-left">Case No.</th>
              <th className="px-4 py-2 text-left">Session No.</th>
              <th className="px-4 py-2 text-left">Schedule Date</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Session Type</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{session.victim_name || "—"}</td>
                  <td className="px-4 py-2">{session.case_no || "—"}</td>
                  <td className="px-4 py-2">{session.sess_num || "—"}</td>
                  <td className="px-4 py-2">{formatDate(session.sess_next_sched)}</td>
                  <td className="px-4 py-2">{session.location || "—"}</td>
                  <td className="px-4 py-2">{session.sess_type || "—"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="text-blue-700 bg-blue-100 px-3 py-1 rounded hover:bg-blue-200">
                      View
                    </button>
                    <button className="text-gray-600 hover:underline font-medium">
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                  No sessions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
