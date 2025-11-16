import React, { useState, useEffect } from "react";
import api from "../../../api/axios"; 
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal"; // We'll create this modal

export default function SocialWorkerProfile() {
  const [officialData, setOfficialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);


  useEffect(() => {
    setLoading(true);
    setError("");

    api.get("/api/dswd/profile/retrieve/")
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
    <div className="p-6 font-sans max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#292D96] mb-8">
        My Profile
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Image */}
        <div className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 mx-auto md:mx-0">
          <img
            src={`http://localhost:8000${officialData.of_photo || "/media/photos/placeholder.jpg"}`}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-4 border-gray-200 shadow-lg"
          />
        </div>

        {/* Profile Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-gray-800">{officialData.full_name}</p>
            <p className="text-sm text-gray-500">{officialData.of_role}</p>
            <p className="text-sm text-gray-500">{officialData.of_contact || "No contact available"}</p>
            <p className="text-sm text-gray-500">{officialData.of_email || "No email available"}</p>
            <p className="text-sm text-gray-500">Date of Birth: {officialData.of_dob}</p>
            <p className="text-sm text-gray-500">Place of Birth: {officialData.of_pob}</p>
          </div>

          {/* Address Card */}
          <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Address</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Province:</strong> {officialData.address?.province_name || "—"}</p>
              <p><strong>Municipality:</strong> {officialData.address?.municipality_name || "—"}</p>
              <p><strong>Barangay:</strong> {officialData.address?.barangay_name || "—"}</p>
              <p><strong>Sitio:</strong> {officialData.address?.sitio || "—"}</p>
              <p><strong>Street:</strong> {officialData.address?.street || "—"}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Edit Profile
            </button>

            <button
              onClick={() => setShowChangePassword(true)}
              className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition ml-4"
            >
              Change Password / Username
            </button>
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
          // You can add an onSave function here if needed
        />
      )}
    </div>
  );
}
