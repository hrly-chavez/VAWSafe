// src/desk_officer/Session/StartSession.js
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import React, { useState, useRef, useEffect } from "react";

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
      const payload = {
        sess_mental_note: mentalNote,
        sess_physical_note: physicalNote,
        sess_financial_note: financialNote,
        sess_status: "Done",
      };

      await api.patch(
        `/api/desk_officer/sessions/${session.sess_id}/`,
        payload
      );

      alert(" Session submitted and marked as Done.");
      navigate("/desk_officer"); // redirect back to main desk officer page (adjust if needed)
    } catch (err) {
      console.error(
        "Error submitting session:",
        err.response?.data || err.message
      );
      alert(" Failed to submit session");
    }
  };

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
    </div>
  );
}
