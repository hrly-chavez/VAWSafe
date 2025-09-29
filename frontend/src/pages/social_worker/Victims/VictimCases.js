// src/pages/social_worker/Victims/VictimCases.js
import React from "react";
import {
  FolderIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline"; 

export default function VictimCases({ selectedIncident, onClose }) {
  if (!selectedIncident) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-4xl w-full relative max-h-[90vh] overflow-y-auto z-[10000] border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b shadow-sm">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#292D96]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h6" />
            </svg>
            <h2 className="text-2xl font-bold text-[#292D96]">Case Overview</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tree Layout */}
        <div className="p-6 space-y-8">
          {/* Case Info */}
          <TreeSection
            title="Case Info"
            icon={<FolderIcon className="h-6 w-6 text-[#292D96]" />}
            items={[
              { label: "Case No", value: selectedIncident.incident_num },
              { label: "Status", value: selectedIncident.status },
              { label: "Created At", value: new Date(selectedIncident.created_at).toLocaleString() },
              { label: "Handling Organization", value: selectedIncident.handling_organization },
              { label: "Case Manager", value: selectedIncident.case_manager },
              { label: "Position", value: selectedIncident.case_manager_position },
            ]}
          />

          {/* Perpetrator Info */}
          {selectedIncident.perp_id && (
            <TreeSection
              title="Perpetrator Info"
              icon={<UserCircleIcon className="h-6 w-6 text-[#292D96]" />}
              items={[
                {
                  label: "Full Name",
                  value: `${selectedIncident.perp_id.per_first_name} ${selectedIncident.perp_id.per_last_name}`,
                },
                { label: "Sex", value: selectedIncident.perp_id.per_sex },
                { label: "Birth Date", value: selectedIncident.perp_id.per_birth_date },
                { label: "Birth Place", value: selectedIncident.perp_id.per_birth_place },
                { label: "Nationality", value: selectedIncident.perp_id.per_nationality },
                { label: "Occupation", value: selectedIncident.perp_id.per_main_occupation },
                { label: "Religion", value: selectedIncident.perp_id.per_religion },
                { label: "Current Address", value: selectedIncident.perp_id.per_current_address },
                { label: "Relationship", value: selectedIncident.perp_id.per_relationship_type },
                ...(selectedIncident.perp_id.per_relationship_type !== "Stranger/Unknown"
                  ? [{ label: "Specific Relationship", value: selectedIncident.perp_id.per_relationship_subtype }]
                  : []),
              ]}
            />
          )}

          {/* Child Perpetrator */}
          {selectedIncident.is_child_perpetrator && (
            <TreeSection
              title="Child Perpetrator Details"
              icon={<UserIcon className="h-6 w-6 text-yellow-600" />}
              items={[
                { label: "Child Classification", value: selectedIncident.perp_child_class },
                { label: "Guardian First Name", value: selectedIncident.perp_guardian_fname },
                { label: "Guardian Middle Name", value: selectedIncident.perp_guardian_mname },
                { label: "Guardian Last Name", value: selectedIncident.perp_guardian_lname },
                { label: "Guardian Contact", value: selectedIncident.perp_guardian_contact },
              ]}
            />
          )}

          {/* Incident Details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-[#292D96]" />
              <h3 className="text-lg font-semibold text-[#292D96]">Incident Details</h3>
            </div>

            <div className="divide-y divide-gray-100 mb-6">
              {[
                { label: "Violence Type", value: selectedIncident.violence_type },
                { label: "Violence Subtype", value: selectedIncident.violence_subtype },
                { label: "Date of Incident", value: selectedIncident.incident_date },
                { label: "Time of Incident", value: selectedIncident.incident_time },
                { label: "Place of Incident", value: selectedIncident.incident_location },
                { label: "Type of Place", value: selectedIncident.type_of_place },
                { label: "Electronic Means", value: selectedIncident.electronic_means },
                { label: "Conflict Area", value: selectedIncident.conflict_area },
              ].map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-gray-800">{item.value || "N/A"}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <span className="font-medium text-gray-700 mb-2">Description:</span>
              <div className="text-sm text-gray-800 whitespace-pre-wrap break-words text-justify leading-relaxed border border-gray-200 rounded-md p-3 bg-gray-50">
                {selectedIncident.incident_description || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeSection({ title, items, icon }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-[#292D96]">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item, idx) => (
          <div key={idx} className="py-2 flex justify-between items-center">
            <span className="text-sm text-gray-500">{item.label}</span>
            {item.label === "Status" ? (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  item.value === "Open"
                    ? "bg-green-100 text-green-700"
                    : item.value === "Closed"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {item.value || "—"}
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-800">{item.value || "—"}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
