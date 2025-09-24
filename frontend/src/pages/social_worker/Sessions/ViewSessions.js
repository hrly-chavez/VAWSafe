// src/pages/social_worker/Sessions/ViewSessions.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import api from "../../../api/axios";
import SessionTypeQuestionPreview from "./SessionTypeQuestionPreview";

export default function ViewSessions() {
  const { sess_id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [allTypes, setAllTypes] = useState([]);
  const [editingType, setEditingType] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Fetch session
  useEffect(() => {
    api
      .get(`/api/social_worker/sessions/${sess_id}/`)
      .then((res) => {
        setSession(res.data);
        setSelectedTypes(res.data.sess_type_display || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch session", err);
        setLoading(false);
      });
  }, [sess_id]);

  //  Fetch all session types for editing
  useEffect(() => {
    api
      .get("/api/social_worker/session-types/")
      .then((res) => setAllTypes(res.data))
      .catch((err) => console.error("Failed to fetch session types", err));
  }, []);

  //  Save type update
  const handleSaveType = async () => {
    try {
      const ids = selectedTypes.map((t) => t.id);
      const res = await api.patch(`/api/social_worker/sessions/${sess_id}/`, {
        sess_type: ids,
      });
      setSession(res.data);
      setSelectedTypes(res.data.sess_type_display || []);
      setEditingType(false);
    } catch (err) {
      console.error("Failed to update session type", err);
      alert("Failed to update session type.");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  if (!session) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Session not found or you are not assigned to it.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { victim, incident, sess_type_display } = session;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">
        Session Details
      </h2>

      {/* Session Info */}
      <section className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-lg mb-3 text-gray-800">
          Session Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Case No.</p>
            <p className="font-medium">{incident?.incident_num || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Session No.</p>
            <p className="font-medium">{session.sess_num || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                session.sess_status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : session.sess_status === "Ongoing"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {session.sess_status}
            </span>
          </div>
          <div>
            <p className="text-gray-500">Type</p>
            {editingType ? (
              <div className="space-y-2">
                <Select
                  isMulti
                  value={selectedTypes}
                  onChange={(val) => setSelectedTypes(val)}
                  options={allTypes}
                  getOptionLabel={(o) => o.name}
                  getOptionValue={(o) => o.id}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveType}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingType(false);
                      setSelectedTypes(sess_type_display || []);
                    }}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {Array.isArray(sess_type_display) && sess_type_display.length > 0
                    ? sess_type_display.map((t) => t.name).join(", ")
                    : "—"}
                </p>
                <button
                  onClick={() => setEditingType(true)}
                  className="ml-2 text-blue-600 text-sm hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div>
            <p className="text-gray-500">Location</p>
            <p className="font-medium">{session.sess_location || "—"}</p>
          </div>
          <div>
            <p className="text-gray-500">Assigned Social Worker</p>
            <p className="font-medium">{session.official_name || "—"}</p>
          </div>
        </div>
      </section>

      {/* Victim Profile Button */}
      {victim && (
        <div>
          <Link
            to={`/social_worker/victims/${victim.vic_id}`}
            className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
          >
            View Victim Profile
          </Link>
        </div>
      )}

      {/* Mapped Questions Preview */}
      <SessionTypeQuestionPreview
        sessionNum={session.sess_num}
        selectedTypes={sess_type_display?.map((t) => t.id) || []} // ✅ fixed
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate(`/social_worker/sessions/${sess_id}/start`)}
          className="px-5 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
        >
          Start Session
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    </div>
  );
}
