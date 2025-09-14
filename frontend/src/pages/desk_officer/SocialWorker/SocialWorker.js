import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

export default function SocialWorker() {
  const [socialWorkers, setSocialWorkers] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/api/desk_officer/officials/social-workers/")
      .then((res) => {
        setSocialWorkers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch social workers:", err);
        setError("Unable to load social workers.");
        setLoading(false);
      });

    axios.get("http://localhost:8000/api/barangays/")
      .then((res) => setBarangays(res.data))
      .catch((err) => console.error("Failed to fetch barangays:", err));
  }, []);

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

  return (
    <div className="p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#292D96]">Social Worker Accounts</h1>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
        <div className="max-h-[480px] overflow-auto rounded-xl">
          <table className="w-full table-auto border-collapse text-sm text-neutral-800">
            <thead className="sticky top-0 z-10 bg-neutral-50 text-sm font-semibold text-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Assigned Barangay</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="5" className="text-center py-4 text-red-500">{error}</td></tr>
              ) : socialWorkers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">No social workers found.</td></tr>
              ) : (
                socialWorkers.map((worker) => (
                  <tr key={worker.of_id} className="hover:bg-neutral-50 transition">
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.of_photo || "https://via.placeholder.com/40"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />
                        <div className="flex flex-col justify-center">
                          <div className="font-semibold text-gray-800">{worker.full_name}</div>
                          <div className="text-xs text-gray-500">{worker.of_contact || "No contact"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-left">
                      <span className={`inline-flex items-center text-white text-xs font-semibold px-2 py-1 rounded-full shadow ${getRoleColor(worker.of_role)}`}>
                        {worker.of_role || "Unassigned"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-left">
                      {worker.assigned_barangay_name || "Unassigned"}
                    </td>

                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/desk_officer/officials/${worker.of_id}`)}
                          className="flex items-center gap-1 bg-[#292D96] text-white px-3 py-1 rounded text-sm shadow hover:bg-[#1f237d]"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>
                        <button className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm shadow hover:bg-green-700">
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </button>
                        <button className="flex items-center justify-center bg-red-500 text-white w-8 h-8 rounded-full shadow hover:bg-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}