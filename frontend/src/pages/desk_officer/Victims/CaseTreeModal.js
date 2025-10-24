//src/pages/desk_officer/Victims/CaseTreeModal.js
import React from "react";
import {
    FolderIcon,
    UserCircleIcon,
    ExclamationTriangleIcon,
    UserIcon,
} from "@heroicons/react/24/outline";

export default function CaseTreeModal({ selectedIncident, onClose }) {
    if (!selectedIncident) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[9999]"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl max-w-4xl w-full relative max-h-[90vh] overflow-y-auto z-[10000] border border-gray-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-2">
                        <FolderIcon className="h-6 w-6 text-[#292D96]" />
                        <h2 className="text-xl font-bold text-[#292D96]">Case Overview</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <TreeSection
                        title="Case Information"
                        icon={<FolderIcon className="h-5 w-5 text-[#292D96]" />}
                        items={[
                            { label: "Case No", value: selectedIncident.incident_num },
                            { label: "Status", value: selectedIncident.status },
                            {
                                label: "Created At",
                                value: new Date(selectedIncident.created_at).toLocaleString(),
                            },
                            {
                                label: "Handling Organization",
                                value: selectedIncident.handling_organization,
                            },
                            { label: "Case Manager", value: selectedIncident.case_manager },
                            {
                                label: "Position",
                                value: selectedIncident.case_manager_position,
                            },
                        ]}
                    />

                    {selectedIncident.perpetrator && (
                        <TreeSection
                            title="Perpetrator Information"
                            icon={<UserCircleIcon className="h-5 w-5 text-[#292D96]" />}
                            items={[
                                {
                                    label: "Full Name",
                                    value: `${selectedIncident.perpetrator.per_first_name} ${selectedIncident.perpetrator.per_last_name}`,
                                },
                                { label: "Sex", value: selectedIncident.perpetrator.per_sex },
                                {
                                    label: "Birth Date",
                                    value: selectedIncident.perpetrator.per_birth_date,
                                },
                                {
                                    label: "Birth Place",
                                    value: selectedIncident.perpetrator.per_birth_place,
                                },
                                {
                                    label: "Nationality",
                                    value: selectedIncident.perpetrator.per_nationality,
                                },
                                {
                                    label: "Occupation",
                                    value: selectedIncident.perpetrator.per_main_occupation,
                                },
                                {
                                    label: "Religion",
                                    value: selectedIncident.perpetrator.per_religion,
                                },
                                {
                                    label: "Current Address",
                                    value: selectedIncident.perpetrator.per_current_address,
                                },
                                {
                                    label: "Relationship",
                                    value: selectedIncident.perpetrator.per_relationship_type,
                                },
                                ...(selectedIncident.perpetrator.per_relationship_type !==
                                    "Stranger/Unknown"
                                    ? [
                                        {
                                            label: "Specific Relationship",
                                            value:
                                                selectedIncident.perpetrator
                                                    .per_relationship_subtype || "—",
                                        },
                                    ]
                                    : []),
                            ]}
                        />
                    )}

                    {selectedIncident.is_child_perpetrator && (
                        <TreeSection
                            title="Child Perpetrator Details"
                            icon={<UserIcon className="h-5 w-5 text-yellow-600" />}
                            items={[
                                {
                                    label: "Child Classification",
                                    value: selectedIncident.perp_child_class,
                                },
                                {
                                    label: "Guardian First Name",
                                    value: selectedIncident.perp_guardian_fname,
                                },
                                {
                                    label: "Guardian Middle Name",
                                    value: selectedIncident.perp_guardian_mname,
                                },
                                {
                                    label: "Guardian Last Name",
                                    value: selectedIncident.perp_guardian_lname,
                                },
                                {
                                    label: "Guardian Contact",
                                    value: selectedIncident.perp_guardian_contact,
                                },
                            ]}
                        />
                    )}

                    {/* Incident Details Section */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-6">
                        <div className="flex items-center gap-2 border-b pb-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-[#292D96]" />
                            <h3 className="text-lg font-semibold text-[#292D96]">Incident Details</h3>
                        </div>

                        {/* Boxed Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div
                                    key={idx}
                                    className="bg-gray-50 border border-gray-200 rounded-md p-3 flex flex-col"
                                >
                                    <span className="text-xs font-semibold text-gray-500 mb-1">
                                        {item.label}
                                    </span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {item.value || "N/A"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Description Block */}
                        <div>
                            <span className="text-xs font-semibold text-gray-500 mb-1 block">
                                Description
                            </span>
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2 border-b pb-2">
                {icon}
                <h3 className="text-lg font-semibold text-[#292D96]">{title}</h3>
            </div>

            {/* Boxed Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-gray-50 border border-gray-200 rounded-md p-3 flex flex-col"
                    >
                        <span className="text-xs font-semibold text-gray-500 mb-1">
                            {item.label}
                        </span>
                        {item.label === "Status" ? (
                            <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${item.value === "Open"
                                    ? "bg-green-100 text-green-700"
                                    : item.value === "Closed"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {item.value || "—"}
                            </span>
                        ) : (
                            <span className="text-sm font-medium text-gray-800">
                                {item.value || "—"}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

