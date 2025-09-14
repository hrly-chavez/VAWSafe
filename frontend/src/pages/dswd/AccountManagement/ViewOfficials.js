import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ViewOfficials() {
  const { of_id } = useParams(); // expects route like /officials/:of_id
  const navigate = useNavigate();
  const [official, setOfficial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:8000/api/dswd/officials/${of_id}/`)
      .then((res) => {
        setOfficial(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch official:", err);
        setError("Unable to load official details.");
        setLoading(false);
      });
  }, [of_id]);

  const getRoleColor = (role) => {
    switch ((role || "").toLowerCase()) {
      case "social worker":
        return "bg-yellow-500";
      case "vawdesk":
        return "bg-blue-600";
      case "dswd":
        return "bg-green-600";
      default:
        return "bg-gray-400";
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading official details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!official) return <div className="p-6 text-gray-500">No official found.</div>;

  return (
    <div className="p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#292D96]">Official Details</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 hover:bg-gray-400 text-sm px-4 py-2 rounded shadow"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <div className="flex items-center gap-6">
          <img
            src={official.of_photo || "https://via.placeholder.com/80"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border border-gray-300"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{official.full_name}</h2>
            <p className="text-sm text-gray-500">{official.of_contact || "No contact info"}</p>
            <span className={`inline-block mt-2 px-3 py-1 text-xs text-white rounded-full ${getRoleColor(official.of_role)}`}>
              {official.of_role || "Unassigned"}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div><strong>City:</strong> {official.city?.name || "—"}</div>
          <div><strong>Municipality:</strong> {official.municipality?.name || "—"}</div>
          <div><strong>Barangay:</strong> {official.barangay?.name || "—"}</div>
          <div><strong>Sitio:</strong> {official.sitio?.name || "—"}</div>
          <div><strong>Street:</strong> {official.street?.name || "—"}</div>
          <div><strong>Assigned Barangay:</strong> {official.of_assigned_barangay?.name || "—"}</div>
        </div>
      </div>
    </div>
  );
}
