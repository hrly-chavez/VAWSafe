// src/desk_officer/Session/StartSession.js
import Modal from "react-modal";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Select from "react-select";
import { useState, useRef, useEffect } from "react";


export default function StartSession() {
  const { state } = useLocation();
  const session = state?.session;
  const victim = state?.victim;
  const incident = state?.incident;
  const navigate = useNavigate();

  // dropdown values
  const [mentalNote, setMentalNote] = useState("");
  const [physicalNote, setPhysicalNote] = useState("");
  const [financialNote, setFinancialNote] = useState("");

  // for image upload
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [nextOfficial, setNextOfficial] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
   const nextSessionNum = (session?.sess_num || 0) + 1;

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const valid = [];

    for (let file of selected) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`❌ ${file.name} is larger than 10 MB`);
        continue;
      }
      valid.push({
        id: `${file.name}-${file.lastModified}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (valid.length) {
      setError("");
      setFiles((prev) => [...prev, ...valid]);
    }

    if (inputRef.current) inputRef.current.value = ""; // reset input
  };

  const handleRemove = (id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  useEffect(() => {
    return () => files.forEach((f) => URL.revokeObjectURL(f.preview));
  }, [files]);
  
  const handleSubmit = async () => {
    try {
      // 1) Mark current session as Done
      const payload = {
        sess_mental_note: mentalNote,
        sess_physical_note: physicalNote,
        sess_financial_note: financialNote,
        sess_status: "Done",
        assigned_official: selectedOfficial,
      };

      await api.patch(`/api/desk_officer/sessions/${session.sess_id}/`, payload);

      // 2) Show modal 
      setShowModal(true);
    } catch (err) {
      console.error("Error submitting session:", err.response?.data || err.message);
      alert("Failed to submit session");
    }
  } 
    const handleScheduleNextSession = async () => {
    try {
      const payload = {
        incident_id: incident?.incident_id,
        sess_next_sched: `${date}T${time}:00Z`,
        sess_location: location,
        sess_type: sessionType,
        assigned_official: nextOfficial,
      };

      const res = await api.post("/api/desk_officer/sessions/", payload);

      alert(`Next session scheduled!\nSession #${res.data.sess_num}`);
      setShowModal(false);
      navigate("/desk_officer");
    } catch (err) {
      console.error("Failed to schedule next session", err.response?.data || err.message);
      alert("Failed to schedule next session");
    }
  };
  
  useEffect(() => {
  api.get("/api/desk_officer/officials/social-workers/")
    .then((res) => {
      const options = res.data.map((o) => ({
        value: o.of_id,
        label: o.full_name,
      }));
      setOfficials(options);
    })
    .catch((err) => console.error("Failed to fetch officials", err));
}, []);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Session</h2>
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        Session Contents/Notes
      </h3>

      <div className="border rounded-lg">
        <div className="bg-gray-100 p-3 rounded-t-lg text-sm font-medium text-gray-700">
          Monitoring Session Forms of VAWC Victims
        </div>

        <div className="p-4 text-sm space-y-3">
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <p className="text-gray-500">Please fill up the form.</p>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Session No.</label>
                <input
                  type="text"
                  value={session?.sess_num || ""}
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">
                  Victim Register No.
                </label>
                <input
                  type="text"
                  value={victim?.full_name || ""}
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Case No.</label>
                <input
                  type="text"
                  value={incident?.incident_num || ""}
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
            </div>

            {/* physical status */}
            <div>
              <label className="text-xs text-gray-600">Physical Status:</label>
              <select>
                <option>With Bruises</option>
                <option>No Bruises</option>
              </select>
            </div>

            {/* mental status */}
            <div>
              <label className="text-xs text-gray-600">Mental Status:</label>
              <select>
                <option>Trauma</option>
                <option>No Trauma</option>
              </select>
            </div>

            {/* financial status */}
            <div>
              <label className="text-xs text-gray-600">Financial Status:</label>
              <select>
                <option>placeholder 1</option>
                <option>placeholder 2</option>
              </select>
            </div>

            {/* financial status */}
            <div>
              <label className="text-xs text-gray-600">Notes:</label>
              <textarea
                className="w-full border rounded p-2"
                rows="5"
                placeholder="Type here..."
                // value={financialNote}
                // onChange={(e) => setFinancialNote(e.target.value)}
              />
            </div>

            {/* evidence */}
            {/* evidences upload */}
            <div>
              <label className="text-xs text-gray-600">Upload Evidences:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={inputRef}
                onChange={handleFileChange}
                className="block w-full mt-1 mb-2 text-sm text-gray-600 
                     file:mr-2 file:py-1 file:px-3
                     file:rounded-md file:border-0
                     file:text-sm file:font-medium
                     file:bg-blue-600 file:text-white
                     hover:file:bg-blue-700 cursor-pointer"
              />

              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {files.map((f) => (
                    <div key={f.id} className="relative">
                      <img
                        src={f.preview}
                        alt={f.file.name}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemove(f.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600">Assisting Social Worker</label>
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


          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* ---- Modal ---- */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
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
            <select
              className="w-full border p-2 rounded"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Counseling">Counseling</option>
              <option value="Interview">Interview</option>
              <option value="Follow-up">Follow-up</option>
            </select>
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
            onClick={() => setShowModal(false)}
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
    </div>
  );
}
