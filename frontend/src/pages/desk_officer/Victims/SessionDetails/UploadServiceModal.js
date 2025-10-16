// src/pages/desk_officer/Victims/SessionDetails/UploadServiceModal.js
import React from "react";

export default function UploadServiceModal() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
        <h2 className="text-lg font-bold text-[#292D96] mb-3">
          Upload Restricted
        </h2>
        <p className="text-sm text-gray-700 mb-5">
          Desk Officers have view-only access. Only Social Workers can upload
          proofs or update service feedback.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-[#292D96] text-white rounded hover:bg-[#1f2280]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
