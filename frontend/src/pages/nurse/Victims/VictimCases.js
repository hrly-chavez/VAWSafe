// src/pages/desk_officer/Victims/CaseTreeModal.js
import React from "react";
import {
  FolderIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  PhoneIcon,
  UserGroupIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const iconMap = {
  // Case Info
  "Case No": <FolderIcon className="h-4 w-4 text-gray-500" />,
  Status: <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />,
  "Created At": <CalendarIcon className="h-4 w-4 text-gray-500" />,
  "Violence Type": (
    <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
  ),
  "Violence Subtype": (
    <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />
  ),
  "Date of Incident": <CalendarIcon className="h-4 w-4 text-gray-500" />,
  "Time of Incident": <ClockIcon className="h-4 w-4 text-gray-500" />,
  Description: <DocumentIcon className="h-4 w-4 text-gray-500" />,

  // Perpetrator Info
  "Full Name": <UserIcon className="h-4 w-4 text-gray-500" />,
  Alias: <UserCircleIcon className="h-4 w-4 text-gray-500" />,
  Sex: <UserIcon className="h-4 w-4 text-gray-500" />,
  "Birth Date": <CalendarIcon className="h-4 w-4 text-gray-500" />,
  "Birth Place": <MapPinIcon className="h-4 w-4 text-gray-500" />,
  Religion: <GlobeAltIcon className="h-4 w-4 text-gray-500" />,
  "Relationship to Victim": <UserGroupIcon className="h-4 w-4 text-gray-500" />,
  "Educational Attainment": (
    <BuildingLibraryIcon className="h-4 w-4 text-gray-500" />
  ),
  Occupation: <BriefcaseIcon className="h-4 w-4 text-gray-500" />,
  "Contact Number": <PhoneIcon className="h-4 w-4 text-gray-500" />,
  "Known Address": <MapPinIcon className="h-4 w-4 text-gray-500" />,
};

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
          <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800">Case Info</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm p-6">
              <InfoItem label="Case No" value={selectedIncident.incident_num} />
              <InfoItem label="Status" value={selectedIncident.incident_status} />
              <InfoItem
                label="Created At"
                value={new Date(selectedIncident.created_at).toLocaleString()}
              />
              <InfoItem
                label="Violence Type"
                value={selectedIncident.violence_type}
              />
              <InfoItem
                label="Violence Subtype"
                value={selectedIncident.violence_subtype}
              />
              <InfoItem
                label="Date of Incident"
                value={selectedIncident.incident_date}
              />
              <InfoItem
                label="Time of Incident"
                value={selectedIncident.incident_time}
              />
            </div>
            <div className="p-6">
              <InfoItem
                label="Description"
                value={selectedIncident.incident_description}
              />
            </div>
          </div>

          {/* Perpetrator Info */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800">
                Perpetrator Info
              </h2>
            </div>
            {selectedIncident.perpetrator ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm p-6">
                <InfoItem
                  label="Full Name"
                  value={
                    selectedIncident.perpetrator
                      ? [
                        selectedIncident.perpetrator.per_first_name,
                        selectedIncident.perpetrator.per_middle_name,
                        selectedIncident.perpetrator.per_last_name,
                        selectedIncident.perpetrator.per_extension,
                      ]
                        .filter(Boolean)
                        .join(" ")
                      : ""
                  }
                />

                <InfoItem
                  label="Alias"
                  value={selectedIncident.perpetrator.per_alias}
                />
                <InfoItem
                  label="Sex"
                  value={selectedIncident.perpetrator.per_sex}
                />
                <InfoItem
                  label="Birth Date"
                  value={selectedIncident.perpetrator.per_birth_date}
                />
                <InfoItem
                  label="Birth Place"
                  value={selectedIncident.perpetrator.per_birth_place}
                />
                <InfoItem
                  label="Religion"
                  value={selectedIncident.perpetrator.per_religion}
                />
                <InfoItem
                  label="Relationship to Victim"
                  value={selectedIncident.perpetrator.per_victim_relationship}
                />
                <InfoItem
                  label="Educational Attainment"
                  value={
                    selectedIncident.perpetrator.per_educational_attainment
                  }
                />
                <InfoItem
                  label="Occupation"
                  value={selectedIncident.perpetrator.per_occupation}
                />
                <InfoItem
                  label="Contact Number"
                  value={selectedIncident.perpetrator.per_contact_number}
                />
                <InfoItem
                  label="Known Address"
                  value={selectedIncident.perpetrator.per_known_address}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic p-6">
                No perpetrator information available.
              </p>
            )}
          </div>

          {/* Evidence */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800">Evidence</h2>
            </div>
            <div className="p-6">
              {selectedIncident.evidences?.length > 0 ? (
                <div className="space-y-4 text-sm text-gray-700">
                  {selectedIncident.evidences.map((ev, idx) => (
                    <div key={idx} className="border rounded-md p-3 bg-white">
                      <InfoItem label="Description" value={ev.description} />
                      <InfoItem
                        label="Uploaded At"
                        value={new Date(ev.uploaded_at).toLocaleString()}
                      />
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
                <p className="text-sm text-gray-500 italic">
                  No evidence files available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      {iconMap[label]}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}
