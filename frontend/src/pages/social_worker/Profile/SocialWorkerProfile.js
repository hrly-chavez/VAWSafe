import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function SocialWorkerProfile() {
  const [officialData, setOfficialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

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

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const handleSaveProfile = (updatedData) => setOfficialData(updatedData);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center px-4 mt-10">
        <div className="w-[180px] h-[180px] rounded-full overflow-hidden border-4 border-gray-200 shadow-xl">
          <img
            src={`http://localhost:8000${officialData.of_photo || "/media/photos/placeholder.jpg"}`}
            alt="Official"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-3xl font-bold text-[#292D96] mt-6">{officialData.full_name}</h2>
        <p className="text-base text-gray-500">{officialData.of_role}</p>
      </div>

      {/* Details Section */}
      <div className="px-6 py-10 max-w-screen-lg mx-auto space-y-10">
        {/* BASIC INFO */}
        <div className="bg-white border rounded-xl shadow-md p-6">
          <div className="relative mb-6">
            <div className="flex items-center gap-4 mb-3">
              <img src="/images/id-card.png" alt="Basic Info Icon" className="h-8 w-8 object-contain" />
              <h3 className="text-2xl font-bold text-[#292D96]">Basic Info</h3>
            </div>
            <div className="relative flex items-center">
              <div className="flex-grow">
                <hr className="border-t border-gray-300" />
              </div>
              <button onClick={() => setShowEditModal(true)} title="Edit">
                <img src="/images/pen.png" alt="Edit Icon" className="ml-2 h-10 w-10 object-contain" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{officialData.of_email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Contact Number</p>
              <p className="font-medium">{officialData.of_contact || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date of Birth</p>
              <p className="font-medium">{officialData.of_dob || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Place of Birth</p>
              <p className="font-medium">{officialData.of_pob || "N/A"}</p>
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
              <button onClick={() => setShowEditModal(true)} title="Edit">
                <img src="/images/pen.png" alt="Edit Icon" className="ml-2 h-10 w-10 object-contain" />
              </button>
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

        {/* CHANGE PASSWORD */}
        <div className="flex justify-center">
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
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
