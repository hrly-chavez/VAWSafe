// src/desk_officer/Session/StartSession.js
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

export default function StartSession() {
  const { state } = useLocation();
  const session = state?.session;
  const victim = state?.victim;
  const incident = state?.incident;
  const navigate = useNavigate();

  // Form state
  const [mentalNote, setMentalNote] = useState("");
  const [physicalNote, setPhysicalNote] = useState("");
  const [financialNote, setFinancialNote] = useState("");

  const handleSubmit = async () => {
    try {
      const payload = {
        sess_mental_note: mentalNote,
        sess_physical_note: physicalNote,
        sess_financial_note: financialNote,
        sess_status: "Done",
      };

      await api.patch(`/api/desk_officer/sessions/${session.sess_id}/`, payload);

      alert(" Session submitted and marked as Done.");
      navigate("/desk_officer"); // redirect back to main desk officer page (adjust if needed)
    } catch (err) {
      console.error("Error submitting session:", err.response?.data || err.message);
      alert(" Failed to submit session");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Session</h2>
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        Session Contents/Notes
      </h3>

      <div className="border rounded-lg">
        <div className="bg-gray-100 p-3 rounded-t-lg text-sm font-medium text-gray-700">
          Monitoring Session Forms of VAWC Victims
        </div>

        <div className="p-4 text-sm space-y-3">
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <p className="text-gray-500">Please fill up the form.</p>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Session No.</label>
                <input
                  type="text"
                  value={session?.sess_num || ""}
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Victim Register No.</label>
                <input
                  type="text"
                  value={victim?.full_name || ""}
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Case No.</label>
                <input
                  type="text"
                  value={incident?.incident_num || ""}
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
            </div>

            {/* Notes inputs */}
            <div>
              <label className="text-xs text-gray-600">Issues Discussed:</label>
              <textarea
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Type here..."
                value={mentalNote}
                onChange={(e) => setMentalNote(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Interventions Done:</label>
              <textarea
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Type here..."
                value={physicalNote}
                onChange={(e) => setPhysicalNote(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Action Plan:</label>
              <textarea
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Type here..."
                value={financialNote}
                onChange={(e) => setFinancialNote(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}