import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PendingAccount() {

    // Example Pending Accounts
    const [pendingOfficials, setPendingOfficials] = useState([
        {
            of_id: 101,
            full_name: "Jane Dela Cruz",
            of_role: "Social Worker",
            of_contact: "jane.delacruz@example.com",
            of_photo: "https://via.placeholder.com/40",
        },
        {
            of_id: 102,
            full_name: "Mark Santos",
            of_role: "VAWDesk",
            of_contact: "mark.santos@example.com",
            of_photo: "https://via.placeholder.com/40",
        },
    ]);

    // Users Color Role
    const getRoleColor = (role) => {
        switch ((role || "").toLowerCase()) {
            case "social worker":
                return "bg-yellow-500";
            case "vawdesk":
                return "bg-blue-600";
            case "dswd":
                return "bg-green-600";
            default:
                return "bg-gray-400";
        }
    };

    return (
        <div className="p-6 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-[#292D96]">Permissions & Accounts › Pending Accounts</h1>
            </div>

            <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-medium">
                        <tr>
                            <th className="px-4 py-3 w-12">
                                <input type="checkbox" />
                            </th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">User Role</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingOfficials.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">No pending accounts.</td>
                            </tr>
                        ) : (
                            pendingOfficials.map((official) => (
                                <tr key={official.of_id} className="border-t hover:bg-gray-50 transition">
                                    <td className="px-4 py-3">
                                        <input type="checkbox" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={official.of_photo}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-800">{official.full_name}</div>
                                                <div className="text-xs text-gray-500">{official.of_contact}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-1 text-xs text-white rounded-full ${getRoleColor(official.of_role)}`}>
                                            {official.of_role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm shadow hover:bg-green-700">
                                                Approve
                                            </button>
                                            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm shadow hover:bg-red-600">
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                <div>
                    Show:
                    <select className="ml-2 border rounded px-2 py-1">
                        <option>5</option>
                        <option>10</option>
                        <option>15</option>
                        <option>25</option>
                    </select>
                </div>
                <div className="space-x-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-100">First</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-100">1</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-100">2</button>
                    <button className="px-2 py-1 border rounded hover:bg-gray-100">Last</button>
                </div>
            </div>
        </div>
    );
}


