import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RegisterUser from "../../RegisterUser";
import ChangePass from "../AccountManagement/ChangePass/ChangePass";

import {
  MagnifyingGlassIcon,
  EyeIcon,
  KeyIcon,
  UserPlusIcon
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

  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredOfficials = officials.filter(o =>
    o.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-6">

      {/* Header */}
      <h2 className="text-2xl font-bold text-[#292D96] pt-6 mb-6 text-center md:text-left">
        Permissions & Accounts › User Management
      </h2>

      {/* Controls row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        {/* Search bar on the left */}
        <div className="flex items-center w-full md:w-2/3 border border-neutral-300 rounded-lg px-3 py-2 bg-white shadow-sm">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search official by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-neutral-900 outline-none"
          />
        </div>

        {/* Buttons on the right */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowChangePassModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition shadow-sm mb-4"
          >
            <KeyIcon className="h-5 w-5" />
            Change Password
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition shadow-sm mb-4"
          >
            <UserPlusIcon className="h-5 w-5" />
            Add User
          </button>
        </div>
      </div>


      {/* Table Container */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-md overflow-hidden">

        {/* Desktop Table */}
        <div className="hidden md:block max-h-[480px] overflow-auto">
          <table className="w-full text-sm text-neutral-800">
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 text-sm font-semibold shadow">
              <tr>
                <th className="px-4 py-3 text-left border">Name</th>
                <th className="px-4 py-3 text-left border">User Role</th>
                <th className="px-4 py-3 text-center border">Actions</th>
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
                filteredOfficials.map((official, index) => (
                  <tr
                    key={official.of_id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                  >

                    {/* Image + Name */}
                    <td className="px-4 py-3 border">
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
                    <td className="px-4 py-3 border">
                      <span
                        className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full shadow ${getRoleColor(official.of_role)}`}
                      >
                        {official.of_role || "Unassigned"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 border text-center">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => navigate(`/dswd/account-management/${official.of_id}`)}
                          className="text-green-600 hover:text-green-700 transition"
                        >
                          <EyeIcon className="h-5 w-5" />
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
          {filteredOfficials.map((official, index) => (
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
                  className="bg-[#0000FF] text-white px-3 py-1 rounded text-sm"
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
