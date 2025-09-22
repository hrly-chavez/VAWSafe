// frontend/src/pages/social_worker/Sessions/NextSessionModal.js
import React, { useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import api from "../../../api/axios";

export default function NextSessionModal({ show, onClose, session }) {
  const [allTypes, setAllTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    if (show) {
      api
        .get("/api/social_worker/session-types/")
        .then((res) => setAllTypes(res.data))
        .catch((err) => console.error("Failed to fetch session types", err));
    }
  }, [show]);

  // 🔹 Async loader for officials
  const loadOfficials = async (inputValue) => {
    try {
      const res = await api.get(
        `/api/social_worker/officials/social-workers/?q=${inputValue || ""}`
      );
      return res.data.map((w) => ({
        value: w.of_id,
        label: w.full_name,
      }));
    } catch (err) {
      console.error("Failed to fetch officials", err);
      return [];
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        incident_id: session?.incident?.incident_id, // ✅ required
        sess_location: location,
        sess_type: selectedTypes.map((t) => t.id),
        sess_next_sched: dateTime,
        assigned_official: selectedOfficial?.value,
      };

      await api.post(`/api/social_worker/sessions/`, payload);
      console.log("Submitting payload:", payload);
      alert("Next session scheduled successfully!");
      onClose(true);
    } catch (err) {
      console.error("Failed to schedule next session", err);
      alert("Failed to schedule next session.");
    }
  };

  if (!show || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-700">
          Schedule Next Session
        </h2>

        <div className="space-y-3 text-sm">
          <p>
            <span className="font-medium">Case No.:</span>{" "}
            {session.incident?.incident_num}
          </p>
          <p>
          <span className="font-medium">Next Session No.:</span>{" "}
          {session.sess_num ? session.sess_num + 1 : 1}
        </p>
        <p>
          <span className="font-medium">Victim:</span>{" "}
          {session.victim?.full_name}
        </p>
        </div>

        <div className="mt-4 space-y-4">
          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium">Session Type</label>
            <Select
              isMulti
              options={allTypes}
              getOptionLabel={(o) => o.name}
              getOptionValue={(o) => o.id}
              value={selectedTypes}
              onChange={(val) => setSelectedTypes(val)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Enter location..."
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium">Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Assigned Official */}
          <div>
            <label className="block text-sm font-medium">Assigned Official</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadOfficials}
              value={selectedOfficial}
              onChange={(val) => setSelectedOfficial(val)}
              placeholder="Search for a social worker..."
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
