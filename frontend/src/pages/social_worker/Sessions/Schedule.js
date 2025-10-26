// src/pages/social_worker/Sessions/Schedule.js
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { CheckCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import WorkerCardSection from "./WorkerCardSection";


export default function Schedule({ victim, incident, back, next }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState("");
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const navigate = useNavigate();

  // New states for social workers display
  const [officials, setOfficials] = useState([]);
  const [selectedOfficials, setSelectedOfficials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingSW, setLoadingSW] = useState(true);

  const handleSubmitSchedule = async () => {
  try {
    const payload = {
      incident_id: incident?.incident_id,
      sess_next_sched: `${date}T${time}:00Z`,
      sess_location: location,
      sess_type: selectedTypes.map((t) => t.value),
      assigned_official: selectedOfficials.map((id) => id),
    };

    const res = await api.post("/api/social_worker/sessions/", payload);

    const readableDate = new Date(res.data.sess_next_sched).toLocaleString(
      "en-US",
      { dateStyle: "medium", timeStyle: "short" }
    );

    alert(`Session scheduled successfully!\nDate: ${readableDate}`);
    if (next) next();
  } catch (err) {
    if (err.response?.data) {
      console.error("Schedule error:", err.response.data);
      alert(
        "Failed to schedule session:\n" +
          JSON.stringify(err.response.data, null, 2)
      );
    } else {
      alert("Failed to schedule session: " + err.message);
    }
  }
};


  // Load session types
  useEffect(() => {
    api
      .get("/api/social_worker/session-types/")
      .then((res) => {
        const options = res.data.map((t) => ({
          value: t.id,
          label: t.name,
        }));
        setSessionTypes(options);
      })
      .catch((err) => console.error("Failed to fetch session types", err));
  }, []);

  // Load all Social Workers (with availability)
  const fetchSocialWorkers = async (query = "") => {
    try {
      setLoadingSW(true);
      const res = await api.get(
        `/api/social_worker/officials/social-workers/?q=${query}`
      );
      setOfficials(res.data);
    } catch (err) {
      console.error("Failed to fetch social workers", err);
    } finally {
      setLoadingSW(false);
    }
  };


  useEffect(() => {
    fetchSocialWorkers();
  }, []);
  // Helper: Convert "HH:MM–HH:MM" to "hh:mm AM/PM – hh:mm AM/PM"
  const formatTo12Hour = (range) => {
    try {
      const [start, end] = range.split("–");
      const format = (t) => {
        if (!t) return "";
        const [h, m] = t.split(":");
        const hour = parseInt(h, 10);
        const suffix = hour >= 12 ? "PM" : "AM";
        const hr12 = hour % 12 || 12;
        return `${hr12}:${m}${suffix}`;
      };
      return `${format(start)}–${format(end)}`;
    } catch {
      return range;
    }
  };
  // Helper to render day abbreviations in order
  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6 mt-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">
        Schedule Session Form
      </h2>

      <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600">Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Time</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs text-gray-600">Location Address</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Type of Session */}
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            Type of Session (you can pick multiple)
          </label>
          <Select
            options={sessionTypes}
            isMulti
            value={selectedTypes}
            onChange={setSelectedTypes}
            placeholder="Select session types..."
          />
        </div>

        {/* === Placeholder Filters === */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Assign  Official
          </h3>
          <div className="flex flex-wrap gap-3 mb-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                fetchSocialWorkers(e.target.value);
              }}
              className="border px-3 py-2 rounded-md w-64 text-sm"
            />
             <input
                type="text"
                placeholder="Search by role (coming soon)"
                disabled
                className="border px-3 py-2 rounded-md w-64 text-sm bg-gray-100 cursor-not-allowed"
              />
          </div>

          {/* Cards Section */}
          <WorkerCardSection
          officials={officials}
          loadingSW={loadingSW}
          selectedOfficials={selectedOfficials}
          setSelectedOfficials={setSelectedOfficials}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          fetchSocialWorkers={fetchSocialWorkers}
        />
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
      </div>
    </div>
  );
}
