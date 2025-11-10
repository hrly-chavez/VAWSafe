// src/pages/social_worker/Sessions/Schedule.js
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { CheckCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import WorkerCardSection from "./WorkerCardSection";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Schedule({ victim, incident, back, next }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");

  const navigate = useNavigate();

  // New states for social workers display
  const [officials, setOfficials] = useState([]);
  const [selectedOfficials, setSelectedOfficials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingSW, setLoadingSW] = useState(true);

  const handleSubmitSchedule = async () => {
    try {
      // Combine selected date & time into one Date object
      const selectedDateTime = new Date(`${date}T${time}:00`);
      const now = new Date();

      // Validate that selected schedule is not in the past
      if (selectedDateTime < now) {
        toast.error("You cannot schedule a session in the past!", {
          position: "top-right",
          autoClose: 4000,
        });
        return; // Stop execution
      }

      const payload = {
        incident_id: incident?.incident_id,
        sess_next_sched: `${date}T${time}:00Z`,
        sess_type: Array.isArray(selectedTypes)
          ? selectedTypes.map((t) => Number(t.value))
          : [],
        assigned_official: Array.isArray(selectedOfficials)
          ? selectedOfficials.map((id) => Number(id))
          : [],
      };

    const res = await api.post("/api/social_worker/sessions/", payload);

    const readableDate = new Date(res.data.sess_next_sched).toLocaleString(
      "en-US",
      { dateStyle: "medium", timeStyle: "short" }
    );

    toast.success(`Session scheduled successfully! 📅 ${readableDate}`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // Redirect after short delay to let user see toast
    setTimeout(() => navigate("/social_worker/sessions"), 3000);
  } catch (err) {
    if (err.response?.data) {
      console.error("Schedule error:", err.response.data);

      // Extract backend error message (handles multiple formats)
      const errorMsg =
        typeof err.response.data === "object"
          ? Object.values(err.response.data).flat().join(" ")
          : err.response.data;

      toast.error(`Failed to schedule session: ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.error("Failed to schedule session: " + err.message, {
        position: "top-right",
        autoClose: 4000,
      });
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

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border px-3 py-2 rounded-md w-64 text-sm"
            >
              <option value="">All Roles</option>
              <option value="Social Worker">Social Worker</option>
              <option value="Nurse">Nurse</option>
              <option value="Psychometrician">Psychometrician</option>
              <option value="Home Life">Home Life</option>
            </select>

          </div>

          {/* Cards Section */}
          <WorkerCardSection
          officials={officials.filter((w) =>roleFilter ? w.role === roleFilter : true)}
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
       {/* Toast container */}
      <ToastContainer />
    </div>
  );
}
