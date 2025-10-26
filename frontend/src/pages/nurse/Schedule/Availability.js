// src/pages/social_worker/Schedule/Availability.js
import React from "react";
import { Clock, Edit3, CalendarX2 } from "lucide-react";
import api from "../../../api/axios";

export default function Availability({
  availabilities,
  unavailabilities,
  fetchScheduleOverview,
  setSelectedSlot,
  setShowEditModal,
}) {
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* ===== Availability Section ===== */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-[#2F2F4F] flex items-center gap-2">
            <Clock size={20} />
            Preferred Weekly Schedule
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {availabilities.length > 0 ? (
            availabilities.map((slot, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-[#2F2F4F]">{slot.day_of_week}</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    {slot.remarks || "No remarks"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedSlot(slot);
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 size={16} /> Edit
                  </button>

                  {slot.is_active ? (
                    <button
                      onClick={async () => {
                        if (window.confirm("Deactivate this availability?")) {
                          await api.delete(`/api/social_worker/availability/${slot.id}/`);
                          fetchScheduleOverview();
                        }
                      }}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        if (window.confirm("Reactivate this availability?")) {
                          await api.patch(
                            `/api/social_worker/availability/${slot.id}/reactivate/`
                          );
                          fetchScheduleOverview();
                        }
                      }}
                      className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500 text-sm">
              No availability set yet.
            </p>
          )}
        </div>
      </div>

      {/* ===== Unavailability Section ===== */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-[#2F2F4F] flex items-center gap-2">
            <CalendarX2 size={20} />
            Temporary Unavailable Date(s)
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {unavailabilities.length > 0 ? (
            unavailabilities.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium text-[#2F2F4F]">
                    {formatDate(item.start_date)} - {formatDate(item.end_date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.reason || "No reason provided"}
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    {item.notes || "No notes"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500 text-sm">
              No unavailability recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
