import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Schedule from "./Schedule";
import Form3 from "./Form3";



export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();



  useEffect(() => {
    // Fetch sessions from API
    // Replace with your actual endpoint
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((err) => console.error("Failed to fetch sessions", err));
  }, []);

  const filteredSessions = sessions.filter((session) =>
    session.victim_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // button navigation functions
  const next = () => setCurrentStep((prev) => prev + 1);
  const back = () => setCurrentStep((prev) => prev - 1);
  const cancel = () => {
    alert("Form cancelled!");
    // setFormData({});
    setCurrentStep(1);
    // Redirect to another page
    navigate("/desk_officer/"); // replace "/some-page" with your route
  };
  const submit = () => {
    alert("Form submitted! ");
    setCurrentStep(1);
  };

  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <Schedule
            // formData={formData}
            // setFormData={setFormData}
            back={back}
            next={next}
          />
        );
      case 2:
        return (
          <Form3
            // formData={formData}
            // setFormData={setFormData}
            back={back}
            cancel={cancel}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#292D96] mb-4">Sessions</h1>
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        List of Scheduled Sessions
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search victim name..."
          className="border rounded px-3 py-2 w-full md:w-[250px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select className="border rounded px-3 py-2 w-full md:w-[200px]">
          <option value="">Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select className="border rounded px-3 py-2 w-full md:w-[200px]">
          <option value="">Case Type</option>
          <option value="Psychological Abuse">Psychological Abuse</option>
          <option value="Physical Abuse">Physical Abuse</option>
          <option value="Sexual Abuse">Sexual Abuse</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-sm">
          <thead className="bg-[#292D96] text-white text-sm">
            <tr>
              <th className="px-4 py-2 text-left">Victim No.</th>
              <th className="px-4 py-2 text-left">Victim Name</th>
              <th className="px-4 py-2 text-left">Schedule</th>
              <th className="px-4 py-2 text-left">Case Type</th>
              <th className="px-4 py-2 text-left">Assigned</th>
              <th className="px-4 py-2 text-left">Session</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{session.victim_no || "—"}</td>
                  <td className="px-4 py-2">{session.victim_name || "—"}</td>
                  <td className="px-4 py-2">{session.schedule || "—"}</td>
                  <td className="px-4 py-2">{session.case_type || "—"}</td>
                  <td className="px-4 py-2">{session.assigned_to || "—"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="text-blue-600 hover:underline">
                      View PDF
                    </button>
                    <button className="text-gray-600 hover:underline">
                      Edit
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
