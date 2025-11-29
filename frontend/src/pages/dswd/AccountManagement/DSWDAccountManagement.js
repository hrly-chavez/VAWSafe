import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RegisterUser from "../../RegisterUser";
import ChangePass from "../AccountManagement/ChangePass/ChangePass";
import ReasonModal from "../AccountManagement/Feedback/ReasonModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  MagnifyingGlassIcon,
  EyeIcon,
  KeyIcon,
  UserPlusIcon,
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/solid";
import api from "../../../api/axios";

export default function AccountManagement() {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // NEW: filter state: 'active' | 'archived' | 'all'
  const [filter, setFilter] = useState("active");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonAction, setReasonAction] = useState(null);
  const [reasonType, setReasonType] = useState("archive");

  //change pass
  const [showChangePassModal, setShowChangePassModal] = useState(false);

  // mao ni ang modal para sa register user
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const url = "/api/dswd/officials/?include_archived=1"; // always fetch all
    api.get(url)
      .then((res) => {
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
        {/* Left side: Search + Filter */}
        <div className="flex items-center gap-3 flex-1">
          {/* Search bar */}
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
        </div>

        {/* Right side: Buttons */}
        <div className="flex gap-3">
          {/* Filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={() => setShowChangePassModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition shadow-sm"
          >
            <KeyIcon className="h-5 w-5" />
            Change Password
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition shadow-sm"
          >
            <UserPlusIcon className="h-5 w-5" />
            Add User
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-md overflow-hidden">

        {/* Desktop Table */}
        <div className="hidden md:block max-h-[600px] overflow-auto">
          <table className="w-full text-sm text-neutral-800">
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 text-sm font-semibold shadow">
              <tr>
                <th className="px-4 py-3 text-left border">Name</th>
                <th className="px-4 py-3 text-left border">Contact Number</th>
                <th className="px-4 py-3 text-left border">User Role</th>
                <th className="px-4 py-3 text-left border">Address</th>
                <th className="px-4 py-3 text-left border">Status</th>
                <th className="px-4 py-3 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    Loading officials...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : officials.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No officials found.
                  </td>
                </tr>
              ) : (
                filteredOfficials.map((official, index) => (
                  <tr key={official.of_id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}>
                    {/* Name */}
                    <td className="px-4 py-3 border font-medium text-gray-800">{official.full_name}</td>

                    {/* Contact */}
                    <td className="px-4 py-3 border">{official.of_contact || "N/A"}</td>

                    {/* Role */}
                    <td className="px-4 py-3 border">
                      <span className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full shadow ${getRoleColor(official.of_role)}`}>
                        {official.of_role || "Unassigned"}
                      </span>
                    </td>

                    {/* Address */}
                    <td className="px-4 py-3 border text-sm text-gray-700">
                      {[
                        official.address?.street,
                        official.address?.sitio,
                        official.address?.barangay_name,
                        official.address?.municipality_name,
                        official.address?.province_name,
                      ].filter(Boolean).join(", ") || "N/A"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 border">
                      {official.deleted_at ? (
                        <span className="text-red-600 font-semibold">Archived</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Active</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 border text-center">
                      <div className="flex justify-center gap-4">
                        {/* View */}
                        <button
                          onClick={() => navigate(`/dswd/account-management/${official.of_id}`)}
                          className="text-green-600 hover:text-green-700 transition"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>

                        {/* Archive */}
                        {!official.deleted_at && (
                          <button
                            onClick={() => {
                              setReasonAction(() => async (reason) => {
                                try {
                                  await api.post(`/api/dswd/officials/${official.of_id}/archive_or_deactivate/`, { reason });
                                  toast.success("Official archived & deactivated.", {
                                    position: "top-right",
                                    autoClose: 2000,
                                  });
                                  const res = await api.get("/api/dswd/officials/?include_archived=1");
                                  setOfficials(res.data || []);
                                } catch {
                                  toast.error("Failed to archive.", {
                                    position: "top-right",
                                    autoClose: 4000,
                                  });
                                }
                              });
                              setReasonType("archive");
                              setShowReasonModal(true);
                            }}
                            className="text-red-600 hover:text-red-700 transition"
                            title="Archive"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}

                        {/* Unarchive */}
                        {official.deleted_at && (
                          <button
                            onClick={() => {
                              setReasonAction(() => async (reason) => {
                                try {
                                  await api.post(`/api/dswd/officials/${official.of_id}/unarchive_or_reactivate/`, { reason });
                                  toast.success("Official successfully unarchived and reactivated.", {
                                    position: "top-right",
                                    autoClose: 2000,
                                  });
                                  const res = await api.get("/api/dswd/officials/?include_archived=1");
                                  setOfficials(res.data || []);
                                } catch {
                                  toast.error("Failed to unarchive/reactivate.", {
                                    position: "top-right",
                                    autoClose: 4000,
                                  });
                                }
                              });
                              setReasonType("unarchive");
                              setShowReasonModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-800 transition"
                            title="Unarchive"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
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
          {filteredOfficials.map((official) => (
            <div key={official.of_id} className="p-4">

              {/* Header with photo + name */}
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

              {/* Role badge */}
              <div className="mt-2">
                <span
                  className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full ${getRoleColor(official.of_role)}`}
                >
                  {official.of_role || "Unassigned"}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/dswd/account-management/${official.of_id}`)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                >
                  View
                </button>

                {official.deleted_at && (
                  <button
                    onClick={() => {
                      setReasonAction(() => async (reason) => {
                        try {
                          await api.post(
                            `/api/dswd/officials/${official.of_id}/unarchive_or_reactivate/`,
                            { reason }
                          );
                          const res = await api.get("/api/dswd/officials/?include_archived=1");
                          setOfficials(res.data.filter((o) => !!o.deleted_at));

                          // ✅ Toast success
                          toast.success("Official successfully unarchived and reactivated.", {
                            position: "top-right",
                            autoClose: 2000,
                          });
                        } catch {
                          // ✅ Toast error
                          toast.error("Failed to unarchive/reactivate.", {
                            position: "top-right",
                            autoClose: 4000,
                          });
                        }
                      });
                      setReasonType("unarchive");
                      setShowReasonModal(true);
                    }}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition"
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
      {showReasonModal && (
        <ReasonModal
          type={reasonType}
          onSubmit={reasonAction}
          onClose={() => setShowReasonModal(false)}
        />
      )}

      <ToastContainer />

    </div>
  );
}
