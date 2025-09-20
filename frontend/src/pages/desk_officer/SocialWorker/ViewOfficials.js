import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ViewOfficials() {
  const { of_id } = useParams();
  const navigate = useNavigate();
  const [official, setOfficial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/desk_officer/officials/${of_id}/`)
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

  const get = (obj, keys, fallback = "—") => {
    for (const k of keys) {
      if (obj && obj[k] != null && obj[k] !== "") return obj[k];
    }
    return fallback;
  };

  if (loading) return <div className="p-6 text-gray-500">Loading official details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!official) return <div className="p-6 text-gray-500">No official found.</div>;

  return (
     <div className="min-h-screen bg-white relative">
      {/* Background Banner */}
      <div
        className="h-[200px] w-full bg-cover bg-center absolute top-0 left-0 z-0"
        style={{ backgroundImage: "url('/images/DSWD1.jpg')" }}
      />

      <div className="relative z-10 pt-[120px] px-6 max-w-screen-lg mx-auto space-y-10">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <img
            src={official.of_photo || "https://via.placeholder.com/220"}
            alt="Official"
            className="h-[220px] w-[220px] object-cover rounded-full border-4 border-white shadow-xl"
          />
        </div>

        {/* Name & Role */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#292D96]">{official.full_name || "—"}</h2>
          <p className="text-sm text-gray-500 mt-1">{official.of_contact || "No contact info"}</p>
          <span className="inline-block mt-2 px-3 py-1 text-xs text-white rounded-full bg-[#292D96]">
            Social Worker
          </span>
        </div>

        {/* Info Box */}
        <div className="bg-white border rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[#292D96] mb-4">Official Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "City", value: get(official.city, ["name"]) },
              { label: "Municipality", value: get(official.municipality, ["name"]) },
              { label: "Barangay", value: get(official.barangay, ["name"]) },
              { label: "Sitio", value: get(official.sitio, ["name"]) },
              { label: "Street", value: get(official.street, ["name"]) },
              { label: "Assigned Barangay", value: get(official.of_assigned_barangay, ["name"]) },
              { label: "Email", value: get(official, ["of_email"]) },
              { label: "Username", value: get(official, ["of_username"]) },
              { label: "Position", value: get(official, ["of_position"]) },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-md px-4 py-3 border shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-sm font-medium text-gray-800">{item.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
          >
            ← Back to List
          </button>
        </div>
      </div>
    </div>
  );
}