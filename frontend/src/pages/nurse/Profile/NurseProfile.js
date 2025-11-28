import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

export default function NurseProfile() {
  const [officialData, setOfficialData] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [unavailability, setUnavailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");


  useEffect(() => {
    api
      .get("/api/dswd/profile/retrieve/")
      .then((res) => {
        setOfficialData(res.data);
        setAvailability(res.data.availability || []);
        setUnavailability(res.data.unavailability || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch profile data:", err);
        setError("Unable to load profile.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!officialData) return;

    setAuditLoading(true);
    api
      .get(`/api/dswd/profile/${officialData.of_id}/audits/`)
      .then((res) => {
        setAuditLogs(res.data); // should now be an array
        setAuditLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch audit logs:", err);
        setAuditLogs([]); // fallback
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
        <header className="h-40 rounded-t-xl bg-[#3F51B5] flex items-end p-6">
          <h1 className="text-3xl font-bold text-white shadow-sm">Official Profile & Records</h1>
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
            <p className="text-lg text-[#3F51B5] font-medium">{officialData.of_role} | Medical Evaluator</p>
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
              <p className="text-2xl font-extrabold text-[#3F51B5]">{officialData.victims_under_care || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Victims Under Medical Care</p>
            </div>
            <div className="text-center border-l border-gray-300">
              <p className="text-2xl font-extrabold text-[#10B981]">{officialData.followups_this_week || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Follow-up Appointments (This Week)</p>
            </div>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="px-6 md:px-8 mt-6 border-b border-gray-300">
          <nav className="flex space-x-6">
            {["profile", "workload", "schedule", "audits"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 border-b-2 transition duration-200 ${
                  activeTab === tab
                    ? "border-[#3F51B5] text-[#3F51B5] font-semibold"
                    : "border-transparent text-gray-600 hover:text-[#3F51B5]"
                }`}
              >
                {tab === "profile" && "Full Profile"}
                {tab === "workload" && "Performance & Workload"}
                {tab === "schedule" && "Schedule & Availability"}
                {tab === "audits" && "Audit Logs"}
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
                {/* Official Account Status */}
                <div>
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Official Account Status</h2>
                  <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-300">
                    <CheckBadgeIcon className="h-6 w-6 text-green-600 mr-3" />
                    <p className="text-gray-700 text-sm">
                      Account is <strong>Active</strong>. Last login:{" "}
                      {new Date(officialData.last_login).toLocaleString("en-PH", {
                        timeZone: "Asia/Manila",
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
                <h2 className="mt-5 text-xl font-bold mb-4 text-gray-800">Personal & Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Full Name</p>
                    <p className="text-gray-800 font-medium">{officialData.full_name}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Official Role</p>
                    <p className="text-[#3F51B5] font-medium">{officialData.of_role}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Contact Number</p>
                    <p className="text-gray-800">{officialData.of_contact || "N/A"}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Email Address</p>
                    <p className="text-gray-800">{officialData.of_email}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Date of Birth</p>
                    <p className="text-gray-800">{officialData.of_dob || "N/A"}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Place of Birth</p>
                    <p className="text-gray-800">{officialData.of_pob || "N/A"}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 md:col-span-2">
                    <p className="text-gray-500">Full Address</p>
                    <p className="text-gray-800 font-medium">
                      {[
                        officialData.address?.street,
                        officialData.address?.sitio,
                        officialData.address?.barangay_name,
                        officialData.address?.municipality_name,
                        officialData.address?.province_name,
                      ]
                        .filter(Boolean) // removes null/undefined
                        .join(", ") || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="bg-white border rounded-xl shadow-md p-6">
                <div className="relative mb-6">
                  <div className="flex items-center gap-4 mb-3">
                    <img src="/images/address.png" alt="Address Icon" className="h-8 w-8 object-contain" />
                    <h3 className="text-2xl font-bold text-[#292D96]">Address</h3>
                  </div>
                  <div className="relative flex items-center">
                    <div className="flex-grow">
                      <hr className="border-t border-gray-300" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                  <div>
                    <p className="text-xs text-gray-500">Province</p>
                    <p className="font-medium">{officialData.address?.province_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Municipality</p>
                    <p className="font-medium">{officialData.address?.municipality_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Barangay</p>
                    <p className="font-medium">{officialData.address?.barangay_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sitio</p>
                    <p className="font-medium">{officialData.address?.sitio || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">Street</p>
                    <p className="font-medium">{officialData.address?.street || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workload" && (
            <div className="space-y-8">
              {/* Section Title */}
              <div>
                <h2 className="text-xl font-bold mb-2 text-gray-800">Medical Assessments & Monitoring (Nurse)</h2>
                <p className="text-sm text-gray-600">
                  Focuses on recording medical evaluations, treatment notes, and monitoring physical health.
                </p>
              </div>

              {/* Case & Session Overview */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200">Case & Session Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#e0e7ff] p-5 rounded-lg border border-[#3F51B5]/30">
                    <p className="text-sm font-medium text-gray-600">Current Active Caseload</p>
                    <span className="text-3xl font-extrabold text-[#3F51B5]">
                      {officialData.active_caseload || 0}
                    </span>
                  </div>
                  <div className="bg-[#e0f7f1] p-5 rounded-lg border border-[#10B981]/30">
                    <p className="text-sm font-medium text-gray-600">Sessions Completed (This Week)</p>
                    <span className="text-3xl font-extrabold text-[#10B981]">
                      {officialData.sessions_completed || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reporting Duties */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4 border-b pb-2 border-gray-200">Reporting Duties</h3>
                <p className="text-sm text-gray-600">
                  Prepare and submit daily, weekly, and monthly reports summarizing survivor updates and interventions.
                </p>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Weekly Availability</h2>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {officialData.availability && officialData.availability.length > 0 ? (
                  officialData.availability.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300 shadow-sm"
                    >
                      <p className="font-medium text-gray-800 w-24">{slot.day_of_week}</p>
                      <p className="text-[#3F51B5] font-semibold">
                        {slot.start_time} - {slot.end_time}
                      </p>
                      <p className="text-xs text-gray-500 w-1/3 text-right truncate">
                        Remarks: {slot.remarks || "N/A"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No availability records found.</p>
                )}
              </div>

              <h2 className="text-xl font-bold mb-4 text-gray-800 mt-8">Unavailability Records</h2>
              <div className="space-y-3">
                {officialData.unavailability && officialData.unavailability.length > 0 ? (
                  officialData.unavailability.map((u, idx) => (
                    <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-300">
                      <div className="flex justify-between items-center text-sm">
                        <p className="font-medium text-red-700">
                          Start: {u.start_date} | End: {u.end_date}
                        </p>
                        <p className="text-gray-800 font-semibold">Reason: {u.reason || "N/A"}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Notes: {u.notes || "None"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No unavailability records found.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "audits" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Audit Logs</h2>
              
              {auditLoading ? (
                <p className="text-gray-500">Loading audit logs...</p>
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

        {/* EDIT & CHANGE PASSWORD */}
        <div className="mt-6 mb-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-[#3F51B5] text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
          >
            Edit Profile
          </button>

          <button
            onClick={() => setShowChangePassword(true)}
            className="bg-[#10B981] text-white px-5 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            Change Password / Username
          </button>
        </div>

        {/* Modals */}
        {showEditModal && (
          <EditProfileModal
            officialData={officialData}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveProfile}
          />
        )}

        {showChangePassword && (
          <ChangePasswordModal
            onClose={() => setShowChangePassword(false)}
          />
        )}
      </div>
    </div>
  );
}