import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RegisterUser from "../../RegisterUser";
import ChangePass from "../AccountManagement/ChangePass/ChangePass";

import {
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import api from "../../../api/axios";

export default function AccountManagement() {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  // NEW: filter state: 'active' | 'archived' | 'all'
  const [filter, setFilter] = useState("active");

  //change pass
  const [showChangePassModal, setShowChangePassModal] = useState(false);

  // mao ni ang modal para sa register user
  const [showRegisterModal, setShowRegisterModal] = useState(false); 

  useEffect(() => {
    setLoading(true);
    setError("");

    const includeArchived = filter !== "active"; // fetch archived only when needed
    const url = includeArchived ? "/api/dswd/officials/?include_archived=1" : "/api/dswd/officials/";

    api.get(url)
      .then((res) => {
        // client-side post filter for convenience
        let data = res.data || [];
        if (filter === "active") {
          data = data.filter(o => !o.deleted_at);
        } else if (filter === "archived") {
          data = data.filter(o => !!o.deleted_at);
        }
        setOfficials(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch officials:", err);
        setError("Unable to load officials.");
        setLoading(false);
      });
  }, [filter]);



  // Users Color Role
  const getRoleColor = (role) => {
    switch ((role || "").toLowerCase()) {
      case "social worker":
        return "bg-yellow-500";
      case "nurse":
        return "bg-blue-600";
      case "dswd":
        return "bg-green-600";
      case "psychometrician":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="p-4 md:p-6 font-sans w-full">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[#292D96]">
          Permissions & Accounts › User Management
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full md:w-auto"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          {/* Change password */}
          <button
            onClick={() => setShowChangePassModal(true)}
            className="text-orange-500 text-sm font-medium hover:underline"
          >
            Change Password
          </button>

          {/* Add user */}
          <button
            onClick={() => setShowRegisterModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow w-full md:w-auto"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-md overflow-hidden">

        {/* Desktop Table */}
        <div className="hidden md:block max-h-[480px] overflow-auto">
          <table className="w-full text-sm text-neutral-800">
            <thead className="sticky top-0 bg-neutral-50 shadow-sm text-neutral-600 font-semibold">
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

                    {/* Image + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={official.of_photo || "https://via.placeholder.com/40"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />
                        <div>
                          <div className="font-semibold text-gray-800">{official.full_name}</div>
                          <div className="text-xs text-gray-500">{official.of_contact || "No contact"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full shadow ${getRoleColor(official.of_role)}`}
                      >
                        {official.of_role || "Unassigned"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/dswd/account-management/${official.of_id}`)}
                          className="flex items-center gap-1 bg-[#292D96] text-white px-3 py-1 rounded text-sm shadow hover:bg-[#1f237d]"
                        >
                          <EyeIcon className="h-4 w-4" /> View
                        </button>

                        {official.deleted_at && (
                          <button
                            onClick={async () => {
                              const reason = window.prompt("Reason for unarchive?");
                              if (reason === null) return;

                              try {
                                await api.post(`/api/dswd/officials/${official.of_id}/unarchive/`, { reason });

                                const includeArchived = filter !== "active";
                                const url = includeArchived
                                  ? "/api/dswd/officials/?include_archived=1"
                                  : "/api/dswd/officials/";

                                const res = await api.get(url);
                                let data = res.data || [];

                                if (filter === "active") data = data.filter(o => !o.deleted_at);
                                if (filter === "archived") data = data.filter(o => !!o.deleted_at);

                                setOfficials(data);
                                alert("Unarchived. Use 'Reactivate' on the details page to allow login again.");
                              } catch (e) {
                                console.error(e);
                                alert("Failed to unarchive.");
                              }
                            }}
                            className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-sm shadow"
                          >
                            Unarchive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View — Cards */}
        <div className="md:hidden divide-y">
          {officials.map((official) => (
            <div key={official.of_id} className="p-4">

              <div className="flex items-center gap-3">
                <img
                  src={official.of_photo || "https://via.placeholder.com/40"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <p className="font-semibold">{official.full_name}</p>
                  <p className="text-xs text-gray-500">{official.of_contact || "No contact"}</p>
                </div>
              </div>

              <div className="mt-2">
                <span
                  className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full ${getRoleColor(official.of_role)}`}
                >
                  {official.of_role || "Unassigned"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/dswd/account-management/${official.of_id}`)}
                  className="bg-[#292D96] text-white px-3 py-1 rounded text-sm"
                >
                  View
                </button>

                {official.deleted_at && (
                  <button
                    onClick={async () => {
                      const reason = window.prompt("Reason for unarchive?");
                      if (reason !== null) {
                        try {
                          await api.post(`/api/dswd/officials/${official.of_id}/unarchive/`, { reason });
                          alert("Unarchived.");
                        } catch {
                          alert("Failed to unarchive.");
                        }
                      }
                    }}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Unarchive
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3 text-sm text-gray-600">
        <div className="flex items-center">
          Show:
          <select className="ml-2 border rounded px-2 py-1">
            <option>5</option>
            <option>10</option>
            <option>15</option>
            <option>25</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-100">First</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100">1</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100">Last</button>
        </div>
      </div>

      {/* Modals */}
      {showRegisterModal && (
        <RegisterUser onClose={() => setShowRegisterModal(false)} />
        //if ang default role kay i uncomment bati kaayo ug result so tang tangon ni para ang katung morun kay ang 3 condition sa register user
        // defaultRole= {["Social Worker", "Nurse", "Psychometrician"]}
      )}
      {showChangePassModal && (
        <ChangePass onClose={() => setShowChangePassModal(false)} />
      )}
    </div>
  );

}
