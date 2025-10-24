// src/pages/desk_officer/Victims/SessionDetails/ServiceList.js
import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

export default function ServiceList({ services }) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!services || services.length === 0) {
    return <p className="text-sm text-gray-500">No services recorded.</p>;
  }

  return (
    <div className="space-y-3">
      {services.map((s) => (
        <div
          key={s.id}
          className="p-4 border rounded-lg bg-gray-50 hover:shadow-md transition"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {s.service?.name || "—"}
              </p>
              <p className="text-xs text-gray-500 italic">
                {s.service?.category || "—"}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded font-medium ${
                s.service_status === "Done"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {s.service_status}
            </span>
          </div>

          {/* Contact Info */}
          <div className="mt-2 text-xs text-gray-700 space-y-1">
            {s.service?.contact_person && (
              <p>
                <span className="font-medium">Contact Person:</span>{" "}
                {s.service.contact_person}
              </p>
            )}
            {s.service?.contact_number && (
              <p>
                <span className="font-medium">Contact No.:</span>{" "}
                {s.service.contact_number}
              </p>
            )}
          </div>

          {/* Handled By */}
          {s.handled_by && (
            <p className="mt-2 text-xs text-gray-700">
              <span className="font-medium">Handled By:</span> {s.handled_by}
            </p>
          )}

          {/* Proof Image */}
          {s.service_pic ? (
            <div className="mt-3">
              <p className="text-xs text-gray-700 font-medium mb-1">Proof Image:</p>
              <img
                src={s.service_pic}
                alt="Proof"
                onClick={() => setPreviewImage(s.service_pic)}
                className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition"
              />
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-3 italic">No proof uploaded.</p>
          )}

          {/* Feedback */}
          {s.service_feedback && (
            <div className="mt-3">
              <p className="text-xs text-gray-700 font-medium">Feedback:</p>
              <p className="text-xs text-gray-600 bg-white border rounded-md p-2">
                {s.service_feedback}
              </p>
            </div>
          )}
        </div>
      ))}

      {previewImage && (
        <ImagePreviewModal
          imageSrc={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
