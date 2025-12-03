import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import {
  CheckBadgeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

const iconMap = {
  "Full Name": <UserIcon className="h-4 w-4 text-gray-500" />,
  "Official Role": <BriefcaseIcon className="h-4 w-4 text-gray-500" />,
  "Contact Number": <PhoneIcon className="h-4 w-4 text-gray-500" />,
  "Email Address": <EnvelopeIcon className="h-4 w-4 text-gray-500" />,
};

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
        <div className="px-6 md:px-8 mt-8">
          <div className="flex border-b border-gray-300 bg-white">
            {["profile", "audit"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-sm font-semibold rounded-t-md transition-colors duration-200 ${isActive
                    ? "bg-[#292D96] text-white border border-gray-300 border-b-0"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#292D96] border border-gray-300"
                    }`}
                >
                  {tab === "profile" ? "Full Profile" : "Audit Logs"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 md:px-8 bg-white rounded-b-md">
          {activeTab === "profile" && (
            <div className="space-y-8 pt-4">
              {/* Personal & Contact Details */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Personal & Contact Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm p-6">
                  <Info label="Full Name" value={officialData.full_name} />
                  <Info label="Official Role" value={officialData.of_role} />
                  <Info label="Contact Number" value={officialData.of_contact || "N/A"} />
                  <Info label="Email Address" value={officialData.of_email} />
                  {/* Full Address */}
                  <Info
                    label="Full Address"
                    value={
                      [
                        officialData.address?.street,
                        officialData.address?.sitio,
                        officialData.address?.barangay_name,
                        officialData.address?.municipality_name,
                        officialData.address?.province_name,
                      ].filter(Boolean).join(", ") || "—"
                    }
                    icon={<MapPinIcon className="h-4 w-4 text-gray-500" />}
                  />
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">Account Status</h2>
                </div>
                <div className="p-6">
                  {officialData.deleted_at ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-300">
                      <span className="h-6 w-6 text-red-600 mr-3">✖</span>
                      <p className="text-gray-700 text-sm">
                        Account is <strong>Deactivated</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-300">
                      <CheckBadgeIcon className="h-6 w-6 text-green-600 mr-3" />
                      <p className="text-gray-700 text-sm">
                        Account is <strong>Active</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-8 pt-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">Audit Logs</h2>
                </div>
                <div className="p-6 space-y-4">
                  {auditLoading ? (
                    <p className="text-gray-500">Loading audit logs...</p>
                  ) : auditError ? (
                    <p className="text-red-500">{auditError}</p>
                  ) : auditLogs.length === 0 ? (
                    <p className="text-gray-500">No audit logs found.</p>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition"
                      >
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
                        {log.reason && (
                          <div className="text-xs text-gray-700 mb-1">
                            <span className="font-medium">Reason:</span> {log.reason}
                          </div>
                        )}
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
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
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

function Info({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      {iconMap[label]}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}
