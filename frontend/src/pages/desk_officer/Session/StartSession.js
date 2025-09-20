// src/desk_officer/Session/StartSession.js
import Modal from "react-modal";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Select from "react-select";
import { useState, useRef, useEffect } from "react";
import Session2Modal from "./Session2Modal";

export default function StartSession() {
  const { state } = useLocation();
  const session = state?.session;
  const victim = state?.victim;
  const incident = state?.incident;
  const navigate = useNavigate();

  // for image upload
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState("");
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [nextTypes, setNextTypes] = useState([]);
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
  // Load session types from API
useEffect(() => {
 api.get("/api/desk_officer/session-types/")
    .then((res) => {
      const options = res.data.map((t) => ({
        value: t.id,
        label: t.name,
      }));
      setSessionTypes(options);
    })
    .catch((err) => console.error("Failed to fetch session types", err));
}, []);

  const handleSubmit = async () => {
    try {
      // 1) Mark current session as Done
      const payload = {
        sess_status: "Done",
         sess_type: nextTypes.map((t) => t.value),
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
        
            {/* evidence */}
            <div>
              <label className="text-xs text-gray-600">Upload Evidences:</label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={inputRef}
                onChange={handleFileChange}
                className="block w-full mt-1 mb-2 text-sm text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"/>

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
          {/* Session Type Selection */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              What is the Session Type (you can pick multiple)
            </label>
            <Select
              options={sessionTypes}
              isMulti
              value={selectedTypes}
              onChange={setSelectedTypes}
              placeholder="Select session types..."
            />
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
       <Session2Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        victim={victim}
        incident={incident}
        nextSessionNum={nextSessionNum}
        sessionTypes={sessionTypes}
        officials={officials}
      />       
    </div>
  );
}
