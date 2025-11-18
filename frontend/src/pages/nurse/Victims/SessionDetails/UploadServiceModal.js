// src/pages/nurse/Victims/UploadServiceModal.js
import React, { useState } from "react";
import api from "../../../../api/axios";

export default function UploadServiceModal({ service, onClose, onSuccess }) {
  const [feedback, setFeedback] = useState(service?.service_feedback || "");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !feedback) {
      alert("Please upload a proof or add feedback before submitting.");
      return;
    }

    const formData = new FormData();
    if (file) formData.append("service_pic", file);
    if (feedback) formData.append("service_feedback", feedback);

    try {
      setLoading(true);
      await api.patch(`/api/nurse/services/${service.id}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Service proof and feedback updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload proof.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-lg font-bold text-[#292D96] mb-4">
          Upload Proof & Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Proof Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border p-2 rounded text-sm"
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback / Remarks
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full border p-2 rounded text-sm"
              placeholder="Write feedback or remarks about this service..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#292D96] text-white rounded hover:bg-[#1f2280]"
            >
              {loading ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
