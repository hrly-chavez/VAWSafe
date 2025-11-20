// src/components/Modal.js
import React from "react";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-xl shadow-lg max-w-3xl w-full h-[90vh]
                   overflow-y-auto [-ms-overflow-style:'none'] [scrollbar-width:'none']
                   [&::-webkit-scrollbar]:hidden relative"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b flex justify-between items-center px-6 py-3 z-10">
          <h3 className="text-xl font-bold text-[#292D96]">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
