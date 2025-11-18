// src/components/Modal.js
import React from "react";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-xl shadow-lg max-w-3xl w-full h-[90vh] 
                   overflow-y-scroll [-ms-overflow-style:'none'] [scrollbar-width:'none'] 
                   [&::-webkit-scrollbar]:hidden p-6 relative"
      >
        {/* Header */}
        <h3 className="text-xl font-bold text-[#292D96] mb-4">{title}</h3>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
