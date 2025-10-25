//src/pages/social_worker/Schedule/EditUnavailabilityModal.js
import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import api from "../../../api/axios";

export default function EditUnavailabilityModal({ record, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState(record?.start_date || "");
  const [endDate, setEndDate] = useState(record?.end_date || "");
  const [reason, setReason] = useState(record?.reason || "");
  const [notes, setNotes] = useState(record?.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    if (!startDate || !endDate || !reason) {
      setError("Start date, end date, and reason are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.put(`/api/social_worker/unavailability/${record.id}/`, {
        start_date: startDate,
        end_date: endDate,
        reason,
        notes,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to update unavailability:", err);
      setError("Failed to update unavailability. Please check dates or overlaps.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this unavailability?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/social_worker/unavailability/${record.id}/`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to delete unavailability:", err);
      setError("Unable to delete record. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[450px] p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#2F2F4F]">Edit Unavailability</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2F2F4F]/30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2F2F4F]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2F2F4F]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Notes (optional)</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2F2F4F]/30 resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1 px-4 py-2 text-red-600 hover:text-white border border-red-600 hover:bg-red-600 rounded-lg transition"
          >
            <Trash2 size={16} />
            Delete
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleUpdate}
              className={`px-4 py-2 rounded-lg text-white ${
                loading ? "bg-gray-400" : "bg-[#2F2F4F] hover:bg-[#404066]"
              } transition`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
