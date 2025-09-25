//src/pages/social_worker/Sessions/CaseSessionFollowup.js
import React, { useState } from "react";
import NextSessionModal from "./NextSessionModal";
import api from "../../../api/axios";

export default function CaseSessionFollowup({ show, onClose, session }) {
  const [showNextSession, setShowNextSession] = useState(false);

  if (!show || !session) return null;

  const handleCloseCase = async () => {
    try {
      await api.post(`/api/social_worker/cases/${session.incident.incident_id}/close/`);
      alert("Case closed successfully!");
      onClose(true); // close and navigate away if needed
    } catch (err) {
      console.error("Failed to close case", err);
      alert(err.response?.data?.error || "Failed to close case.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-bold text-[#292D96] mb-4">Session Completed</h2>
          <p className="text-sm text-gray-600 mb-6">
            What would you like to do next?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowNextSession(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Schedule Next Session
            </button>
            <button
              onClick={handleCloseCase}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close Case
            </button>
            <button
              onClick={() => onClose(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              × Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Nested NextSessionModal */}
      <NextSessionModal
        show={showNextSession}
        onClose={(success) => {
          setShowNextSession(false);
          if (success) onClose(true);
        }}
        session={session}
      />
    </>
  );
}
