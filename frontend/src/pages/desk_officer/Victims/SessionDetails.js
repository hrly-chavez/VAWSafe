import React from "react";

export default function SessionDetails({ session }) {
  if (!session) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 text-sm text-gray-700">
      <h3 className="text-lg font-semibold text-[#292D96] mb-4">Session Details</h3>
      <div className="space-y-3">
        <div>
          <span className="font-medium text-gray-600">Title:</span>{" "}
          <span className="text-gray-800">{session.title || "N/A"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Date:</span>{" "}
          <span className="text-gray-800">{session.date || "N/A"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Time:</span>{" "}
          <span className="text-gray-800">{session.time || "N/A"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Location:</span>{" "}
          <span className="text-gray-800">{session.location || "N/A"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Facilitator:</span>{" "}
          <span className="text-gray-800">{session.facilitator || "N/A"}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Notes:</span>
          <p className="mt-1 text-gray-800 whitespace-pre-wrap break-words text-justify leading-relaxed bg-gray-50 rounded-md p-3 border">
            {session.notes || "No notes available."}
          </p>
        </div>
      </div>
    </div>
  );
}
