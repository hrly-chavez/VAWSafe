import React, { useState } from "react";

export default function OngoingSession() {
  const [sessions, setSessions] = useState([
    { id: 1, name: "Session 1" },
    { id: 2, name: "Session 2" },
    { id: 3, name: "Session 3" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-[#292D96] mb-4">
          Ongoing Sessions
        </h2>

        {sessions.length === 0 ? (
          <p className="text-gray-600">No ongoing sessions.</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="p-4 rounded-lg border bg-gray-50 shadow-sm hover:shadow-md transition"
              >
                <p className="font-medium text-gray-800">{session.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
