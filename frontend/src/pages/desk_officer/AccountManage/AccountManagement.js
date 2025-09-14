import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RegisterUser from "../../RegisterUser";

import {
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

export default function AccountManagement() {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/api/desk_officer/officials/")
      .then((res) => {
        setOfficials(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch officials:", err);
        setError("Unable to load officials.");
        setLoading(false);
      });
  }, []);


  // Users Color Role
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#292D96]">Permissions & Accounts › User Management</h1>
        <button 
          onClick={() => setShowRegisterModal(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded shadow"
        >
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
        <div className="max-h-[480px] overflow-auto rounded-xl">
          <table className="w-full table-auto border-collapse text-sm text-neutral-800">
            <thead className="sticky top-0 z-10 bg-neutral-50 text-sm font-semibold text-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">User Role</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">Loading officials...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-red-500">{error}</td>
                </tr>
              ) : officials.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">No officials found.</td>
                </tr>
              ) : (
                officials.map((official) => (
                  <tr key={official.of_id} className="hover:bg-neutral-50 transition">

                    {/* Name + Contact + Image */}
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-3">
                        {/* Profile Image */}
                        <img
                          src={official.of_photo || "https://via.placeholder.com/40"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />

                        {/* Name + Contact */}
                        <div className="flex flex-col justify-center">
                          <div className="font-semibold text-gray-800">{official.full_name}</div>
                          <div className="text-xs text-gray-500">{official.of_contact || "No contact"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Tag */}
                    <td className="px-4 py-3 text-left">
                      <span className={`inline-flex items-center text-white text-xs font-semibold px-2 py-1 rounded-full shadow ${getRoleColor(official.of_role)}`}>
                        {official.of_role || "Unassigned"}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => navigate(`/desk_officer/officials/${official.of_id}`)}
                          className="flex items-center gap-1 bg-[#292D96] text-white px-3 py-1 rounded text-sm shadow hover:bg-[#1f237d]"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </button>

                        {/* Edit Button */}
                        <button className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm shadow hover:bg-green-700">
                          <PencilSquareIcon className="h-4 w-4" />
                          Edit
                        </button>

                        {/* Remove Button */}
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

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div>
          Show:
          <select className="ml-2 border rounded px-2 py-1">
            <option>5</option>
            <option>10</option>
            <option>15</option>
            <option>25</option>
          </select>
        </div>
        <div className="space-x-2">
          <button className="px-2 py-1 border rounded hover:bg-gray-100">First</button>
          <button className="px-2 py-1 border rounded hover:bg-gray-100">1</button>
          <button className="px-2 py-1 border rounded hover:bg-gray-100">2</button>
          <button className="px-2 py-1 border rounded hover:bg-gray-100">Last</button>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterUser 
          onClose={() => setShowRegisterModal(false)} 
          defaultRole="Social Worker"   // 👈 force role to Social Worker
        />
      )}
    </div>
  );
}
