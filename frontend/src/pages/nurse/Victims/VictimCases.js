// src/pages/nurse/Victims/VictimCases.js
import React from "react";
import {
  FolderIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import SectionHeader from "../../../components/SectionHeader"; // reuse the header component

export default function VictimCases({ selectedIncident, onClose }) {
  if (!selectedIncident) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative max-h-[90vh] overflow-y-auto z-[10000] border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b shadow-sm">
          <div className="flex items-center gap-2">
            <FolderIcon className="h-6 w-6 text-[#292D96]" />
            <h2 className="text-2xl font-bold text-[#292D96]">Case Overview</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-10">
          {/* Case Info */}
          <div className="bg-white border rounded-xl shadow-md p-6">
            <SectionHeader icon="/images/case_details.png" title="Case Info" />

            {/* Two-column grid for most fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <InfoItem label="Case No" value={selectedIncident.incident_num} />
              <InfoItem label="Status" value={selectedIncident.incident_status} />
              <InfoItem label="Created At" value={new Date(selectedIncident.created_at).toLocaleString()} />
              <InfoItem label="Violence Type" value={selectedIncident.violence_type} />
              <InfoItem label="Violence Subtype" value={selectedIncident.violence_subtype} />
              <InfoItem label="Date of Incident" value={selectedIncident.incident_date} />
              <InfoItem label="Time of Incident" value={selectedIncident.incident_time} />
            </div>

            {/* Full-width Incident Location */}
            <div className="mt-6 text-sm text-gray-700">
              <p className="text-xs text-gray-500">Place of Incident</p>
              <p className="text-sm font-medium text-gray-800 bg-gray-50 border rounded-md p-3 whitespace-pre-wrap break-words">
                {selectedIncident.incident_location || "—"}
              </p>
            </div>

            {/* Description */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm font-medium text-gray-800 bg-gray-50 border rounded-md p-3 whitespace-pre-wrap break-words">
                {selectedIncident.incident_description || "—"}
              </p>
            </div>
          </div>

          {/* Perpetrator Info */}
          <div className="bg-white border rounded-xl shadow-md p-6">
            <SectionHeader icon="/images/thief.png" title="Perpetrator Info" />
            {selectedIncident.perpetrator ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <InfoItem
                  label="Full Name"
                  value={`${selectedIncident.perpetrator.per_first_name || ""} ${selectedIncident.perpetrator.per_last_name || ""}`}
                />
                <InfoItem label="Alias" value={selectedIncident.perpetrator.per_alias} />
                <InfoItem label="Sex" value={selectedIncident.perpetrator.per_sex} />
                <InfoItem label="Birth Date" value={selectedIncident.perpetrator.per_birth_date} />
                <InfoItem label="Birth Place" value={selectedIncident.perpetrator.per_birth_place} />
                <InfoItem label="Religion" value={selectedIncident.perpetrator.per_religion} />
                <InfoItem label="Relationship to Victim" value={selectedIncident.perpetrator.per_victim_relationship} />
                <InfoItem label="Educational Attainment" value={selectedIncident.perpetrator.per_educational_attainment} />
                <InfoItem label="Occupation" value={selectedIncident.perpetrator.per_occupation} />
                <InfoItem label="Contact Number" value={selectedIncident.perpetrator.per_contact_number} />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No perpetrator information available.</p>
            )}
          </div>

          {/* Evidence */}
          <div className="bg-white border rounded-xl shadow-md p-6">
            <SectionHeader icon="/images/case_details.png" title="Evidence" />
            {selectedIncident.evidences?.length > 0 ? (
              <div className="space-y-4 text-sm text-gray-700">
                {selectedIncident.evidences.map((ev, idx) => (
                  <div key={idx} className="border rounded-md p-3 bg-gray-50">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="font-medium mb-2">{ev.description || "—"}</p>
                    <p className="text-xs text-gray-500">Uploaded At</p>
                    <p className="font-medium">{new Date(ev.uploaded_at).toLocaleString()}</p>
                    <a
                      href={ev.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-[#292D96] text-xs font-medium underline"
                    >
                      View File
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No evidence files available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
