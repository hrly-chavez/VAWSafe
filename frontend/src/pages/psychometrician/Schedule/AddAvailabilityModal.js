// src/pages/social_worker/Schedule/AddAvailabilityModal.js
import React, { useState } from "react";
import { X } from "lucide-react";
import api from "../../../api/axios";

export default function AddAvailabilityModal({ onClose, onSuccess, existingAvailabilities = [] }) {
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!day || !startTime || !endTime) {
      setError("Please fill all required fields.");
      return;
    }

    const alreadyExists = existingAvailabilities.some(
      (a) => a.day_of_week === day && a.is_active
    );

    if (alreadyExists) {
      setError(`You already have an availability set for ${day}.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/social_worker/availability/", {
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        remarks: remarks,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to add availability:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (typeof err.response?.data === "string") {
        setError(err.response.data);
      } else {
        setError("Failed to save. Please check for overlaps or invalid time range.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[450px] p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#2F2F4F]">Add Availability</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Day of the Week
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F2F4F]/30"
            >
              <option value="">Select Day</option>
              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F2F4F]/30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F2F4F]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Field Duty, Online Session..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F2F4F]/30"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-[#2F2F4F] hover:bg-[#404066]"
            } transition`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
