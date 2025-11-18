import React from "react";

export default function SectionHeader({ icon, title }) {
  return (
    <div className="relative mb-6">
      {/* Title with icon */}
      <div className="flex items-center gap-4 mb-3">
        <img src={icon} alt={`${title} Icon`} className="h-8 w-8 object-contain" />
        <h3 className="text-2xl font-bold text-[#292D96]">{title}</h3>
      </div>

      {/* Horizontal line with pencil icon at end */}
      <div className="relative flex items-center">
        <div className="flex-grow">
          <hr className="border-t border-gray-300" />
        </div>
        <img
          src="/images/pen.png"
          alt="Edit Icon"
          className="ml-2 h-10 w-10 object-contain"
        />
      </div>
    </div>
  );
}
