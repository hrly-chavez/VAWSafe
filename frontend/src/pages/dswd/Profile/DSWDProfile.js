import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

export default function DSWDProfile() {
  const [officialData, setOfficialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");

  // Helper function to make changes human-readable
  const formatChange = (field, value) => {
    const fieldLabels = {
      of_fname: "First Name",
      of_lname: "Last Name",
      of_m_initial: "Middle Initial",
      of_suffix: "Suffix",
      of_sex: "Sex",
      of_dob: "Date of Birth",
      of_pob: "Place of Birth",
      of_contact: "Contact",
      of_email: "Email",
      deleted_at: "Deleted At",
      username: "Username",
      // add more fields as needed
    };

    const label = fieldLabels[field] || field;

    if (Array.isArray(value) && value.length === 2) {
      return `${label} changed from ${value[0]} to ${value[1]}`;
    } else if (Array.isArray(value) && value.length === 1) {
      return `${label} set to ${value[0]}`;
    } else {
      return `${label} changed to ${value}`;
    }
  };


  // Fetch profile
  useEffect(() => {
    api
      .get("/api/dswd/profile/retrieve/")
      .then((res) => {
        setOfficialData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch profile data:", err);
        setError("Unable to load profile.");
        setLoading(false);
      });
  }, []);

  // Fetch audit logs once profile data is available
  useEffect(() => {
    if (!officialData) return;

    setAuditLoading(true);
    api
      .get(`/api/dswd/profile/${officialData.of_id}/audits/`)
      .then((res) => {
        setAuditLogs(res.data); // array of audit logs
        setAuditLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch audit logs:", err);
        setAuditError("Unable to load audit logs.");
        setAuditLoading(false);
      });
  }, [officialData]);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const handleSaveProfile = (updatedData) => setOfficialData(updatedData);

  return (
    <div className="min-h-screen p-4 sm:p-8 flex justify-center bg-gray-100 font-inter">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">

        {/* Shorter Header */}
        <header className="h-24 rounded-t-xl bg-[#292D96]"></header>

        {/* Profile Section */}
        <section className="px-6 md:px-8 flex flex-row items-start gap-6">
          {/* Profile Photo (overlaps header) */}
          <div className="-mt-16">
            <img
              src={`http://localhost:8000${officialData.of_photo || "/media/photos/placeholder.jpg"}`}
              alt="Profile"
              className="w-40 h-40 rounded-full border-4 border-white bg-gray-200 object-cover shadow-lg"
            />
          </div>

          {/* Name, Role, Status + Actions */}
          <div className="mt-2 flex flex-col justify-center flex-grow">
            {/* Name + Status + Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{officialData.full_name}</h1>

              {/* Status Badge */}
              <span className="inline-block px-3 py-1.5 text-sm font-medium rounded-full bg-green-100 text-green-700">
                {officialData.status || "Approved"}
              </span>

              {/* Action Buttons */}
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 hover:text-[#292D96] transition"
                title="Edit Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.1 2.1 0 1 1 2.97 2.97L8.25 18.04l-4.5 1.5 1.5-4.5 11.612-11.553z" />
                </svg>
              </button>

              <button
                onClick={() => setShowChangePassword(true)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-600 hover:text-[#292D96] transition"
                title="Change Password / Username"
              >
                <svg xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-1.5 0h12a1.5 1.5 0 0 1 1.5 1.5v6.75a1.5 1.5 0 0 1-1.5 1.5h-12a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5z" />
                </svg>
              </button>
            </div>

            {/* Role below name */}
            <p className="text-sm text-gray-600 mt-2">{officialData.of_role}</p>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="px-6 md:px-8 mt-6 border-b border-gray-300">
          <nav className="flex space-x-6">
            {["profile", "audit"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 border-b-2 transition duration-200 ${
                  activeTab === tab
                    ? "border-[#292D96] text-[#292D96] font-semibold"
                    : "border-transparent text-gray-600 hover:text-[#292D96]"
                }`}
              >
                {tab === "profile" ? "Full Profile" : "Audit Logs"}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Personal & Contact Details */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Personal & Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Full Name</p>
                    <p className="text-gray-800 font-medium">{officialData.full_name}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Official Role</p>
                    <p className="text-[#292D96] font-medium">{officialData.of_role}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Contact Number</p>
                    <p className="text-gray-800">{officialData.of_contact || "N/A"}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Email Address</p>
                    <p className="text-gray-800">{officialData.of_email}</p>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Account Status</h2>

                {officialData.deleted_at ? (
                  <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-300">
                    <div className="h-6 w-6 text-red-600 mr-3" />
                    <p className="text-gray-700 text-sm">
                      Account is <strong>Deactivated</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-300">
                    <CheckBadgeIcon className="h-6 w-6 text-green-600 mr-3" />
                    <p className="text-gray-700 text-sm">
                      Account is <strong>Active</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Audit Logs</h2>

              {auditLoading ? (
                <p className="text-gray-500">Loading audit logs...</p>
              ) : auditError ? (
                <p className="text-red-500">{auditError}</p>
              ) : auditLogs.length === 0 ? (
                <p className="text-gray-500">No audit logs found.</p>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 border rounded-lg shadow-sm hover:bg-gray-100 transition"
                    >
                      {/* Header: Action by Actor */}
                      <div className="flex justify-between text-sm mb-1">
                        <div>
                          <span className="font-medium capitalize">{log.action}</span>{" "}
                          <span className="opacity-70">by</span>{" "}
                          <span className="font-medium">{log.actor_name || "System"}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString("en-PH")}
                        </div>
                      </div>

                      {/* Reason */}
                      {log.reason && (
                        <div className="text-xs text-gray-700 mb-1">
                          <span className="font-medium">Reason:</span> {log.reason}
                        </div>
                      )}

                      {/* Changes (hide for create, archive, unarchive) */}
                      {!["create", "archive", "unarchive"].includes(log.action) && log.changes && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Changes:</span>
                          <ul className="list-disc ml-5 mt-1">
                            {Object.entries(log.changes).map(([field, value], index) => (
                              <li key={index}>{formatChange(field, value)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Edit & Change Password Buttons */}
        <div className="px-6 md:px-8 pb-8">
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-[#292D96] text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              Edit Profile
            </button>

            <button
              onClick={() => setShowChangePassword(true)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              Change Password / Username
            </button>
          </div>
        </div>

        {/* Modals */}
        {showEditModal && (
          <EditProfileModal
            officialData={officialData}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveProfile}
          />
        )}
        {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      </div>
    </div>
  );
}
