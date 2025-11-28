import React, { useState } from "react";

export default function ReasonModal({ type = "archive", onSubmit, onClose }) {
    const [reason, setReason] = useState("");

    const isArchive = type === "archive";
    const title = isArchive ? "Add New Archive Reason" : "Add Unarchive Reason";
    const buttonLabel = isArchive ? "ADD ARCHIVE REASON" : "ADD UNARCHIVE REASON";

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">
                    Once this reason is submitted, it will be recorded in the system.
                    You can view all changes and actions related to this account in your audit trail for transparency and tracking.
                </p>

                {/* Input field */}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Change in employment status"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                />

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                    >
                        CLOSE
                    </button>
                    <button
                        onClick={() => { onSubmit(reason); onClose(); }}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        {buttonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
