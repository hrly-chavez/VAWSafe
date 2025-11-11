import React, { useState, useEffect } from "react";
import api from "../../../api/axios"; // Assuming your api.js is correctly set up
import EditProfileModal from "./EditProfileModal";

export default function DSWDProfile() {
  const [officialData, setOfficialData] = useState(null);  // State to hold official profile data
  const [loading, setLoading] = useState(true);  // State for loading indicator
  const [error, setError] = useState(""); // State for error message
  const [showModal, setShowModal] = useState(false); // Show modal

  useEffect(() => {
    setLoading(true);
    setError("");

    // Fetch the current user's profile data
    api.get("/api/dswd/profile/retrieve/")  // This endpoint is for the current user's profile
      .then((res) => {
        setOfficialData(res.data);  // Set official data with the response
        setLoading(false);  // Stop loading after data is fetched
      })
      .catch((err) => {
        console.error("Failed to fetch profile data:", err);
        setError("Unable to load profile.");
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  // Render loading, error, or profile data
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleEditProfile = () => {
    setShowModal(true); // Open the modal to edit the profile
  };

  const handleSaveProfile = (updatedData) => {
    setOfficialData(updatedData); // Update the profile data in state after successful save
  };

  // Render loading, error, or profile data
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6 font-sans">
      <h1 className="text-xl font-bold text-[#292D96] mb-6">My Profile</h1>

      <div className="flex gap-6">
        {/* Profile Image */}
        <div className="w-40 h-40">
          <img
            src={`http://localhost:8000${officialData.of_photo || "/media/photos/placeholder.jpg"}`} // Prepend the base URL
            alt="Profile"
            className="w-full h-full rounded-full object-cover border border-gray-300"
          />
        </div>

        {/* Profile Details */}
        <div className="flex flex-col justify-center">
          <p className="text-2xl font-semibold text-gray-800">{officialData.full_name}</p>
          <p className="text-sm text-gray-500">{officialData.of_role}</p>
          <p className="text-sm text-gray-500 mt-2">{officialData.of_contact || "No contact available"}</p>
          <p className="text-sm text-gray-500 mt-2">{officialData.of_email || "No email available"}</p>
          <p className="text-sm text-gray-500 mt-2">Date of Birth: {officialData.of_dob}</p>
          <p className="text-sm text-gray-500 mt-2">Place of Birth: {officialData.of_pob}</p>
        </div>

        {/* Display Address */}
        <div className="mt-4">
          <h3 className="font-semibold">Address</h3>
          <p><strong>Province:</strong> {officialData.address?.province_name || "—"}</p>
          <p><strong>Municipality:</strong> {officialData.address?.municipality_name || "—"}</p>
          <p><strong>Barangay:</strong> {officialData.address?.barangay_name || "—"}</p>
          <p><strong>Sitio:</strong> {officialData.address?.sitio || "—"}</p>
          <p><strong>Street:</strong> {officialData.address?.street || "—"}</p>
        </div>
      </div>

      {/* Button to Edit Profile */}
      <div className="mt-6">
        <button
          onClick={handleEditProfile} // You can add the edit functionality or modal here
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit Profile
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <EditProfileModal
          officialData={officialData} // Pass existing data to modal
          onClose={() => setShowModal(false)} // Close the modal when canceled
          onSave={handleSaveProfile} // Save the updated profile when saved
        />
      )}
    </div>
  );
}
