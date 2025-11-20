import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function PsychometricianProfile() {
  const [officialData, setOfficialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

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

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const handleSaveProfile = (updatedData) => setOfficialData(updatedData);

  return (
    <div className="p-6 font-sans max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#292D96] mb-8 text-center md:text-left">
        My Profile
      </h1>

      {/* Profile Container */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">

          {/* Profile Image */}
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
            <img
              src={`http://localhost:8000${officialData.of_photo || "/media/photos/placeholder.jpg"}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Information */}
          <div className="flex-1 w-full">
            {/* Basic Info */}
            <div className="space-y-1 mb-4">
              <p className="text-2xl font-semibold text-gray-900">
                {officialData.full_name}
              </p>
              <p className="text-sm text-gray-600">{officialData.of_role}</p>
              <p className="text-sm text-gray-600">{officialData.of_email}</p>
              <p className="text-sm text-gray-600">
                {officialData.of_contact || "No contact available"}
              </p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="font-semibold text-gray-700 mb-1">Date of Birth</p>
                <p className="text-gray-600">{officialData.of_dob || "N/A"}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="font-semibold text-gray-700 mb-1">Place of Birth</p>
                <p className="text-gray-600">{officialData.of_pob || "N/A"}</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="mt-5 bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <p><strong>Province:</strong> {officialData.address?.province_name || "N/A"}</p>
                <p><strong>Municipality:</strong> {officialData.address?.municipality_name || "N/A"}</p>
                <p><strong>Barangay:</strong> {officialData.address?.barangay_name || "N/A"}</p>
                <p><strong>Sitio:</strong> {officialData.address?.sitio || "N/A"}</p>
                <p><strong>Street:</strong> {officialData.address?.street || "N/A"}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
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

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  );
}
