import React from "react";

export default function SectionHeader({ icon, title }) {
  return (
    <div className="relative mb-4">
      {/* Title with icon */}
      <div className="flex items-center gap-2 mb-2">
        <img src={icon} alt={`${title} Icon`} className="h-6 w-6 object-contain" />
        <h3 className="text-lg font-semibold text-[#292D96]">{title}</h3>
      </div>

      {/* Horizontal line with pencil icon at end */}
      <div className="relative flex items-center">
        <div className="flex-grow">
          <hr className="border-t border-gray-300" />
        </div>
        <img
          src="/images/pen.png"
          alt="Edit Icon"
          className="ml-2 h-5 w-5 object-contain"
        />
      </div>
    </div>
  );
}