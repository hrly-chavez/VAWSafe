import { useState } from "react";
import { CheckCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";

export default function SchedulePage() {
  const handleSubmitSchedule = () => {
    alert("✅ Session scheduled successfully!");
    // TODO: Send data to backend or navigate
  };

  const handleStartSession = () => {
    alert("▶️ Session started.");
    // TODO: Trigger session logic
  };

  return (
    <div className="border-2 border-blue-600 rounded-lg p-6 bg-white max-w-5xl mx-auto shadow mt-10 space-y-6">
      {/* Main Title */}
      <h2 className="text-xl font-bold text-blue-800">Schedule Session Form</h2>

      {/* Scheduling Form */}
      <div className="border rounded-lg p-4 bg-gray-50 mt-2">
        <p className="text-gray-500 mb-3">Please fill out the session schedule.</p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-600">Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Time</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              defaultValue={new Date().toTimeString().slice(0, 5)}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-600">Location</label>
          <input type="text" className="w-full border rounded p-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-600">Type of Session</label>
            <select className="w-full border rounded p-2">
              <option>Select Type</option>
              <option>Initial Intake</option>
              <option>Follow-up</option>
              <option>Monitoring</option>
              <option>Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
    </div>
  );
}
