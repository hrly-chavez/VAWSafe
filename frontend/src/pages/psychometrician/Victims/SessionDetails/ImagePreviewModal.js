// src/pages/psychometrician/Victims/ImagePreviewModal.js
import React from "react";

export default function ImagePreviewModal({ imageSrc, onClose }) {
  if (!imageSrc) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="relative"
        onClick={(e) => e.stopPropagation()} // prevent modal close when clicking image
      >
        <img
          src={imageSrc}
          alt="Service Proof"
          className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-lg border border-gray-300 object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white text-gray-700 rounded-full p-2 shadow hover:bg-gray-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
