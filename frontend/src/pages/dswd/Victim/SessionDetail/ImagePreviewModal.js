// src/pages/dswd/Victim/SessionDetail/ImagePreviewModal.js
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
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageSrc}
          alt="Service Proof"
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl border border-gray-300"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white text-gray-800 rounded-full p-2 shadow hover:bg-gray-100 font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
