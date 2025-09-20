// src/pages/desk_officer/Session/Session2Modal.js
import Modal from "react-modal";
import Select from "react-select";
import api from "../../../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Session2Modal({
  isOpen,
  onClose,
  victim,
  incident,
  nextSessionNum,
  sessionTypes,
  officials,
}) {
  const navigate = useNavigate();

  // form states
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState("");
  const [nextTypes, setNextTypes] = useState([]);
  const [nextOfficial, setNextOfficial] = useState(null);

  const handleScheduleNextSession = async () => {
    try {
      const payload = {
        incident_id: incident?.incident_id,
        sess_next_sched: `${date}T${time}:00Z`,
        sess_location: location,
        sess_type: nextTypes.map((t) => t.value),
        assigned_official: nextOfficial,
      };

      const res = await api.post("/api/desk_officer/sessions/", payload);

      alert(`Next session scheduled!\nSession #${res.data.sess_num}`);
      onClose();
      navigate("/desk_officer");
    } catch (err) {
      console.error("Failed to schedule next session", err.response?.data || err.message);
      alert("Failed to schedule next session");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-lg mx-auto mt-20 bg-white p-6 rounded shadow"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
    >
      <h2 className="text-xl font-semibold mb-4">Schedule Next Session</h2>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <p>
          <strong>Victim:</strong> {victim?.full_name}
        </p>
        <p>
          <strong>Case No.:</strong> {incident?.incident_num}
        </p>
        <p>
          <strong>Next Session No.:</strong> {nextSessionNum}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label>Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label>Time</label>
          <input
            type="time"
            className="w-full border p-2 rounded"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div>
          <label>Location</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label>Type of Session</label>
          <Select
            options={sessionTypes}
            isMulti
            value={nextTypes}
            onChange={setNextTypes}
            placeholder="Select session types..."
          />
        </div>
        <div>
          <label>Assign Social Worker</label>
          <Select
            options={officials}
            value={officials.find((o) => o.value === nextOfficial) || null}
            onChange={(opt) => setNextOfficial(opt ? opt.value : null)}
            placeholder="Search..."
            isClearable
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleScheduleNextSession}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Next Session
        </button>
      </div>
    </Modal>
  );
}
