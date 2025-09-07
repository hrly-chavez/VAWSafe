// src/pages/desk_officer/Schedule.js
import { CheckCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";

export default function Schedule({ back, next }) {
  const handleSubmitSchedule = () => {
    alert("✅ Session scheduled successfully!");
    if (next) next();
    // TODO: Send data to backend
  };

  const handleStartSession = () => {
    alert("▶️ Session started.");
    if (next) next();
    // TODO: Trigger session logic
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 mt-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-blue-800 mb-4">
        Schedule Session Form
      </h2>

      <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
        <p className="text-gray-500 text-sm">
          Please fill out the session scheduling form.
        </p>

        {/* Session Identifiers */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600">Session No.</label>
            <input
              type="text"
              value="01"
              disabled
              className="w-full border rounded p-2 text-gray-500 bg-gray-100"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Victim Register No.</label>
            <input
              type="text"
              value="VAW-2025-05-00123"
              disabled
              className="w-full border rounded p-2 text-gray-500 bg-gray-100"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Case No.</label>
            <input
              type="text"
              value="01"
              disabled
              className="w-full border rounded p-2 text-gray-500 bg-gray-100"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
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

        {/* Location */}
        <div>
          <label className="text-xs text-gray-600">Location Address</label>
          <input type="text" className="w-full border rounded p-2" />
        </div>

        {/* Region hierarchy */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600">Region</label>
            <select className="w-full border rounded p-2">
              <option>Select Region</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Province</label>
            <select className="w-full border rounded p-2">
              <option>Select Province</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">City/Municipality</label>
            <select className="w-full border rounded p-2">
              <option>Select City</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Barangay</label>
            <select className="w-full border rounded p-2">
              <option>Select Barangay</option>
            </select>
          </div>
        </div>

        {/* Type of Session & Attendance */}
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="text-xs text-gray-600 block">Attended?</label>
            <div className="flex items-center space-x-4 mt-1">
              <label className="flex items-center space-x-1">
                <input type="radio" name="attended" />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-1">
                <input type="radio" name="attended" />
                <span>No</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        {back && (
          <button
            onClick={back}
            className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Back
          </button>
        )}
        <button
          onClick={handleSubmitSchedule}
          className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow hover:from-green-600 hover:to-green-700 transition-all"
        >
          <CheckCircleIcon className="h-5 w-5" />
          Submit to Schedule Session
        </button>
        <button
          onClick={handleStartSession}
          className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <PlayCircleIcon className="h-5 w-5" />
          Start Session Now
        </button>
      </div>
    </div>
  );
}
