// src/pages/nurse/Victims/SessionDetails/ServiceList.js
import React, { useState } from "react";
import api from "../../../../api/axios";
import UploadServiceModal from "./UploadServiceModal";
import ImagePreviewModal from "./ImagePreviewModal";


export default function ServiceList({ services, onFeedbackUpdate }) {
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleSaveFeedback = async (serviceId) => {
    try {
      await api.patch(`/api/nurse/services/${serviceId}/`, {
        service_feedback: feedbackText,
      });
      alert("Feedback saved successfully!");
      setEditingFeedbackId(null);
      setFeedbackText("");
      if (onFeedbackUpdate) onFeedbackUpdate(); // Refresh parent if needed
    } catch (err) {
      console.error("Failed to save feedback", err);
      alert("Failed to save feedback.");
    }
  };

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

          {/* Address Info */}
          {(s.service?.service_address || s.service?.assigned_place) && (
            <div className="mt-2 text-xs text-gray-700">
              <span className="font-medium">Address:</span>{" "}
              {s.service?.service_address?.full_address ||
                s.service?.assigned_place?.full_address ||
                "—"}
            </div>
          )}

         {/* Proof Upload */}
                <div className="mt-3 flex flex-col gap-1">
                {s.service_pic ? (
                    <>
                    {/*  Clickable Thumbnail Preview */}
                    <img
                        src={s.service_pic}
                        alt="Proof"
                        onClick={() => setPreviewImage(s.service_pic)} // 👈 open preview modal
                        className="w-32 h-32 object-cover rounded border mt-2 cursor-pointer hover:opacity-80 transition"
                    />

                    {/*  Feedback Display */}
                    {s.service_feedback && (
                        <p className="text-xs text-gray-700 mt-2">
                        <span className="font-medium">Feedback:</span> {s.service_feedback}
                        </p>
                    )}
                    </>
                ) : (
                    <button
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    onClick={() => {
                        setSelectedService(s);
                        setShowModal(true);
                    }}
                    >
                    Upload Proof / Feedback
                    </button>
                )}
                </div>


            {previewImage && (
            <ImagePreviewModal
                imageSrc={previewImage}
                onClose={() => setPreviewImage(null)}
            />
            )}

            {/* {s.service_pics.map((img, i) => ( 
            <img
                key={i}
                src={img.url}
                onClick={() => setPreviewImage(img.url)}
                ...
            />
            ))} */}

        </div>
      ))}
      {showModal && selectedService && (
        <UploadServiceModal
            service={selectedService}
            onClose={() => setShowModal(false)}
            onSuccess={onFeedbackUpdate} // refresh session data after success
        />
        )}

    </div>
  );
}
