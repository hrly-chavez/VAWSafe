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

        {/* Header */}
        <header className="h-40 rounded-t-xl bg-[#292D96] flex items-end p-6">
          <h1 className="text-3xl font-bold text-white shadow-sm">DSWD Official Profile</h1>
        </header>

        {/* Profile Info */}
        <section className="px-6 md:px-8 -mt-16 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center md:items-start">
            <img
              src={`http://localhost:8000${officialData.of_photo || "/media/photos/placeholder.jpg"}`}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white ring-4 ring-[#F59E0B] bg-gray-200 object-cover shadow-lg"
            />
            <h1 className="text-3xl font-bold mt-4 text-gray-800">{officialData.full_name}</h1>
            <p className="text-lg text-[#292D96] font-medium">{officialData.of_role}</p>
            <div className="mt-2 flex space-x-2 items-center">
              <span className="px-3 py-1 text-xs font-bold rounded-full uppercase bg-green-500 text-white">
                Approved
              </span>
              <p className="text-sm text-gray-500">Assigned: Regional Center</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex-grow w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-inner mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-[#292D96]">{officialData.active_caseload || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Active Caseloads</p>
            </div>
            <div className="text-center border-l border-gray-300">
              <p className="text-2xl font-extrabold text-[#10B981]">{officialData.total_user_accounts || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Total User Accounts</p>
            </div>
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
                <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-300">
                  <CheckBadgeIcon className="h-6 w-6 text-green-600 mr-3" />
                  <p className="text-gray-700 text-sm">
                    Account is <strong>Active</strong>. Last login:{" "}
                    {officialData.last_login
                      ? new Date(officialData.last_login).toLocaleString("en-PH", {
                          timeZone: "Asia/Manila",
                          dateStyle: "long",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </p>
                </div>
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
                <div className="space-y-2">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 border rounded-lg shadow-sm">
                      <p className="text-sm text-gray-700">
                        <strong>Action:</strong> {log.action}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Changes:</strong> {JSON.stringify(log.changes)}
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Date:</strong> {new Date(log.created_at).toLocaleString("en-PH")}
                      </p>
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
