// src/pages/desk_officer/Session/Schedule.js
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { CheckCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import SessionTypeQuestionPreview from "./SessionTypeQuestionPreview";

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
      assigned_official: selectedOfficials, // now a list
    };


      const res = await api.post(
        "/api/desk_officer/sessions/create_sched/",
        payload
      );

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
      .get("/api/desk_officer/session-types/")
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
        `/api/desk_officer/officials/social-workers/?q=${query}`
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
  // Do not touch this function
  const handleStartSession = async () => {
    try {
      const payload = {
        incident_id: incident?.incident_id,
        started_now: true,
        sess_type: [],
      };

      const res = await api.post("/api/desk_officer/sessions/", payload);
      const session = res.data;

      navigate("/desk_officer/session/start", {
        state: { session, victim, incident },
      });
    } catch (err) {
      console.error("Start session error:", err);
      alert("Failed to start session");
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
            Assign Social Worker
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
          </div>

          {/* Cards Section */}
          {loadingSW ? (
            <p className="text-sm text-gray-500">Loading social workers...</p>
          ) : officials.length === 0 ? (
            <p className="text-sm text-gray-500">
              No social workers found for this search.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {officials.map((sw) => (
                <div
                  key={sw.of_id}
                  className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition ${
                    selectedOfficials.includes(sw.of_id) ? "ring-2 ring-blue-500" : ""
                  }`} 
                >
                  <div className="mb-2">
                    <h4 className="font-semibold text-blue-800">
                      {sw.full_name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Contact: {sw.contact || "N/A"}
                    </p>
                  </div>

                  {/* Weekly Availability */}
                  <div className="border-t pt-2 mt-2 text-xs text-center grid grid-cols-7 gap-1">
                    {daysOrder.map((day) => {
                      const time = sw.availability?.[day];
                      return (
                        <div
                          key={day}
                          className={`p-1 rounded ${
                            time
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-400"
                          }`}
                        >
                          <div className="text-[10px] font-semibold">
                            {day.slice(0, 3)}
                          </div>
                          <div>{time ? formatTo12Hour(time) : "—"}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() =>
                        setSelectedOfficials((prev) =>
                          prev.includes(sw.of_id)
                            ? prev.filter((id) => id !== sw.of_id) // deselect
                            : prev.length < 3
                            ? [...prev, sw.of_id] // select new
                            : prev // ignore if already 3
                        )
                      }
                      disabled={
                        !selectedOfficials.includes(sw.of_id) && selectedOfficials.length >= 3
                      }
                      className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                        selectedOfficials.includes(sw.of_id)
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      {selectedOfficials.includes(sw.of_id)
                        ? "Selected"
                        : selectedOfficials.length >= 3
                        ? "Max 3 Selected"
                        : "Assign This Worker"}
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapped Questions */}
        <SessionTypeQuestionPreview
          sessionNum={(incident?.sessions?.length || 0) + 1}
          selectedTypes={selectedTypes}
        />
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

        {/* (Keep commented Start Session button intact) */}
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
