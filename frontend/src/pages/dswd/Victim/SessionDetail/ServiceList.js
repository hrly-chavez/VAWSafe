// src/pages/dswd/Victim/SessionDetail/ServiceList.js
import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

export default function ServiceList({ services }) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!services || services.length === 0) {
    return <p className="text-sm text-gray-500">No services recorded.</p>;
  }

  return (
    <div className="space-y-4">
      {services.map((s) => (
        <div
          key={s.id}
          className="p-5 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
        >
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-base font-semibold text-gray-900">
                {s.service?.name || "—"}
              </h4>
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

          {/* Contact Details */}
          <div className="mt-3 text-xs text-gray-700 space-y-1">
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
          <div className="mt-3">
            {s.service_pic ? (
              <>
                <p className="text-xs font-medium text-gray-700 mb-1">Proof Image:</p>
                <img
                  src={s.service_pic}
                  alt="Service Proof"
                  onClick={() => setPreviewImage(s.service_pic)}
                  className="w-32 h-32 object-cover rounded-md border cursor-pointer hover:opacity-80 transition"
                />
              </>
            ) : (
              <p className="text-xs italic text-gray-500">No proof uploaded.</p>
            )}
          </div>

          {/* Feedback Section */}
          {s.service_feedback && (
            <div className="mt-3">
              <p className="text-xs text-gray-700 font-medium">Feedback / Remarks:</p>
              <p className="text-xs text-gray-600 bg-gray-50 border rounded-md p-2">
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
