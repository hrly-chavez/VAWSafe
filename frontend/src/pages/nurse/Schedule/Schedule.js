// src/pages/social_worker/Schedule/Schedule.js
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { PlusCircle, CalendarDays, Clock, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import AddAvailabilityModal from "./AddAvailabilityModal";
import EditAvailabilityModal from "./EditAvailabilityModal";
import AddUnavailabilityModal from "./AddUnavailabilityModal";
import EditUnavailabilityModal from "./EditUnavailabilityModal";
import Availability from "./Availability";


export default function Schedule() {
  const [availabilities, setAvailabilities] = useState([]); // recurring pattern
  const [unavailabilities, setUnavailabilities] = useState([]); // temporary blocks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showUnavailabilityModal, setShowUnavailabilityModal] = useState(false);
  const [showEditUnavailabilityModal, setShowEditUnavailabilityModal] = useState(false);
  const [selectedUnavailability, setSelectedUnavailability] = useState(null);
  // ==============================
  //  Calendar Week Controls
  // ==============================
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  const getWeekRange = (startDate) => {
  const base = new Date(startDate);

  // Align the week range to Sunday–Saturday
  const sunday = new Date(base);
  sunday.setDate(base.getDate() - base.getDay());

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  const options = { month: "short", day: "numeric" };
  return `${sunday.toLocaleDateString("en-US", options)} – ${saturday.toLocaleDateString("en-US", options)}`;
};


  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };
// Always show Sunday to Saturday — fixed order
const getDaysOfWeek = (startDate) => {
  const start = new Date(startDate);
  // Find the Sunday of the current week
  const sunday = new Date(start);
  sunday.setDate(start.getDate() - start.getDay());

  // Build the full week from Sunday to Saturday
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    days.push(d);
  }
  return days;
};

// Keep consistent day order
const days = getDaysOfWeek(currentWeekStart);


  const getDayLabel = (date) => date.toLocaleDateString("en-US", { weekday: "short" });
  const getDayNumber = (date) => date.toLocaleDateString("en-US", { day: "numeric" });

  // ==============================
  //  Fetch Combined Data
  // ==============================
 const fetchScheduleOverview = async () => {
  try {
    setLoading(true);

    // Align API query to start of week (Sunday)
    const base = new Date(currentWeekStart);
    const sunday = new Date(base);
    sunday.setDate(base.getDate() - base.getDay());
    const startDate = sunday.toISOString().split("T")[0];

    const res = await api.get(`/api/social_worker/schedule-overview/week/?start_date=${startDate}`);
    setAvailabilities(res.data.availabilities);
    setUnavailabilities(res.data.unavailabilities);
  } catch (err) {
    console.error("Failed to load schedule overview:", err);
    setError("Failed to load schedule overview.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchScheduleOverview();
  }, [currentWeekStart]);

  // ==============================
  //  Helpers (fixed timezone & inclusive end date)
  // ==============================
  const getAvailabilityForDay = (dayName) => {
    return availabilities.filter(
      (slot) => slot.day_of_week === dayName && slot.is_active
    );
  };
      const parseLocalDate = (dateStr) => {
        const [y, m, d] = dateStr.split("-").map(Number);
        return new Date(y, m - 1, d);
      };

      // Normalize all dates to midnight to avoid time drift issues
      const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

      const isDayUnavailable = (date) => {
        const day = normalizeDate(date);
        return unavailabilities.some((u) => {
          const start = normalizeDate(parseLocalDate(u.start_date));
          const end = normalizeDate(parseLocalDate(u.end_date));
          return day >= start && day <= end; // inclusive of end date
        });
      };

      const getUnavailabilityReason = (date) => {
        const day = normalizeDate(date);
        const record = unavailabilities.find((u) => {
          const start = normalizeDate(parseLocalDate(u.start_date));
          const end = normalizeDate(parseLocalDate(u.end_date));
          return day >= start && day <= end; // inclusive of end date
        });
        return record?.reason || "Unavailable";
      };

  // ==============================
  // Error Handling
  // ==============================

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">{error}</div>
    );
  }
  // Convert 24-hour time ("14:30:00") to 12-hour with AM/PM
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


  // ==============================
  //  Render
  // ==============================
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-poppins">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2F2F4F]">My Schedule</h1>
          <p className="text-sm text-gray-500">
            Manage your preferred availability and temporary unavailability.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#2F2F4F] text-white px-4 py-2 rounded-lg hover:bg-[#404066] transition">
            <PlusCircle size={18} />
            Add Availability
          </button>
          <button
            onClick={() => setShowUnavailabilityModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            <PlusCircle size={18} />
            Add Unavailability
          </button>
        </div>

      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#2F2F4F] flex items-center gap-2">
            <CalendarDays size={20} />
            Weekly Calendar
          </h2>

          {/* Week Navigation */}
          <div className="flex items-center gap-3">
            <button
            type="button"
            onClick={handlePreviousWeek}
            className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition"
          >
            <ChevronLeft size={16} /> Prev
          </button>
            <span className="text-sm text-gray-700 font-medium">
              {getWeekRange(currentWeekStart)}
            </span>
            <button
            type="button"
            onClick={handleNextWeek}
            className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition"
          >
            Next <ChevronRight size={16} />
          </button>
          </div>
        </div>

        {/* Weekly Calendar Grid */}
        <div className="grid grid-cols-7 gap-3 text-center text-sm text-gray-700">
          {days.map((date, idx) => {
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
            const dayAvailabilities = getAvailabilityForDay(dayName);
            const isSelected = selectedDay === dayName;
            const unavailable = isDayUnavailable(date);
            const reason = getUnavailabilityReason(date);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(dayName)}
                className={`flex flex-col justify-between rounded-xl p-4 border h-44 shadow-sm cursor-pointer transition 
                  ${
                    unavailable
                      ? "bg-red-50 border-red-300 text-red-600"
                      : isSelected
                      ? "bg-[#2F2F4F] text-white border-[#2F2F4F]"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }`}
              >
                <div>
                  <span className="font-semibold text-base">{getDayLabel(date)}</span>
                  <p className={`text-xs ${isSelected ? "text-gray-200" : "text-gray-500"}`}>
                    {getDayNumber(date)}
                  </p>
                </div>

                {/* Availability / Unavailability */}
                {unavailable ? (
                  <div
                    onClick={() => {
                // Normalize dates to ignore time component
                const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
                const parseLocalDate = (str) => {
                  const [y, m, d] = str.split("-").map(Number);
                  return new Date(y, m - 1, d);
                };

                const day = normalizeDate(date);
                const record = unavailabilities.find((u) => {
                  const start = normalizeDate(parseLocalDate(u.start_date));
                  const end = normalizeDate(parseLocalDate(u.end_date));
                  return day >= start && day <= end;
                });

                if (record) {
                  setSelectedUnavailability(record);
                  setShowEditUnavailabilityModal(true);
                }
              }}

                    className="mt-auto text-xs italic text-red-600 underline cursor-pointer hover:text-red-700"
                  >
                    {reason}
                  </div>
                ) : dayAvailabilities.length > 0 ? (
                  <div className="flex flex-col gap-1 text-xs mt-2">
                    {dayAvailabilities.map((slot, i) => (
                      <div
                        key={i}
                        className={`rounded-md py-1 px-2 ${
                          isSelected
                            ? "bg-white/20 text-white border border-white/40"
                            : "bg-[#2F2F4F]/10 text-[#2F2F4F]"
                        }`}
                      >
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        <p
                          className={`text-[10px] mt-1 ${
                            isSelected ? "text-gray-100" : "text-gray-600"
                          }`}
                        >
                          {slot.remarks || "No remarks"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`text-xs italic mt-auto ${
                      isSelected ? "text-gray-200" : "text-gray-400"
                    }`}
                  >
                    No availability
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Availability List */}
      <Availability
      availabilities={availabilities}
      unavailabilities={unavailabilities}
      fetchScheduleOverview={fetchScheduleOverview}
      setSelectedSlot={setSelectedSlot}
      setShowEditModal={setShowEditModal}
    />


      {/* Modals */}
      {showModal && (
        <AddAvailabilityModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchScheduleOverview}
          existingAvailabilities={availabilities}
        />
      )}

      {showEditModal && (
        <EditAvailabilityModal slot={selectedSlot} onClose={() => setShowEditModal(false)}onSuccess={fetchScheduleOverview}/>
      )}
      {showUnavailabilityModal && (
        <AddUnavailabilityModal onClose={() => setShowUnavailabilityModal(false)} onSuccess={fetchScheduleOverview}/>
      )}
      {showEditUnavailabilityModal && (
      <EditUnavailabilityModal record={selectedUnavailability}
        onClose={() => setShowEditUnavailabilityModal(false)}
        onSuccess={fetchScheduleOverview}/>
       )}
    </div>
  );
}
