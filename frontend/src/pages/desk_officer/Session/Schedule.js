//src/pages/desk_officer/Session/Schedule.js
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { CheckCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

export default function Schedule({ victim, incident, back, next }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState("");
  const [sessionType, setSessionType] = useState("");
  const navigate = useNavigate();
  const [officials, setOfficials] = useState([]);
  const [selectedOfficial, setSelectedOfficial] = useState("");

  const handleSubmitSchedule = async () => {
    try {
      const payload = {
        incident_id: incident?.incident_id,
        sess_next_sched: `${date}T${time}:00Z`,
        sess_location: location,
        sess_type: sessionType,
        assigned_official: selectedOfficial || null,
      };

      const res = await api.post(
        "/api/desk_officer/sessions/create_sched/",
        payload
      );

      // ✅ Format readable datetime
      const readableDate = new Date(res.data.sess_next_sched).toLocaleString(
        "en-US",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );

      alert(` Session scheduled successfully!\nDate: ${readableDate}`);
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
   useEffect(() => {
    api
      .get("/api/desk_officer/officials/social-workers/")
      .then((res) => {
        // Transform API response for react-select
        const options = res.data.map((o) => ({
          value: o.of_id,
          label: o.full_name,
        }));
        setOfficials(options);
      })
      .catch((err) => console.error("Failed to fetch officials", err));
  }, []);

  const handleStartSession = async () => {
    try {
      const payload = {
        victim: victim?.vic_id, // use your backend field names
        incident_id: incident?.incident_id,
        started_now: true,
      };

      const res = await api.post("/api/desk_officer/sessions/", payload);

      const session = res.data; // created session data from backend

      navigate("/desk_officer/session/start", {
        state: { session, victim, incident },
      });
    } catch (err) {
      console.error("Start session error:", err);
      alert(" Failed to start session");
    }
  };

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

        {/* Type */}
        <div>
          <label className="text-xs text-gray-600">Type of Session</label>
          <select
            className="w-full border rounded p-2"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="Counseling">Counseling</option>
            <option value="Interview">Interview</option>
            <option value="Follow-up">Follow-up</option>
          </select>
        </div>
         {/* Assign Social Worker */}
        <div>
        <label className="text-xs text-gray-600 block mb-1">
          Assign Social Worker
        </label>
        <Select
          options={officials}
          value={officials.find((opt) => opt.value === selectedOfficial) || null}
          onChange={(selected) =>
            setSelectedOfficial(selected ? selected.value : null)
          }
          placeholder="Search and select social worker..."
          isClearable
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
