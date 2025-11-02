// src/pages/social_worker/Victims/SessionCard.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SessionCard({ incident, onSelectSession, navigate }) {
  const [openRole, setOpenRole] = useState("Shared");

  if (!incident.sessions || incident.sessions.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic mt-3">
        No sessions recorded for this case yet.
      </p>
    );
  }


// Group sessions strictly by official role and handle shared separately
const grouped = incident.sessions.reduce((acc, s) => {
  // Shared session (sess_num === 1)
  if (s.sess_num === 1) {
    if (!acc["Shared"]) acc["Shared"] = [];
    acc["Shared"].push(s);
    return acc;
  }

  // Determine which roles this session belongs to
  const roles = s.official_roles && s.official_roles.length > 0 ? s.official_roles : ["Unassigned"];

  roles.forEach((role) => {
    if (!acc[role]) acc[role] = [];
    acc[role].push(s);
  });

  return acc;
}, {});


// Keep consistent order
const roleOrder = ["Shared", "Social Worker", "Psychometrician", "Nurse", "Home Life", "Unassigned"];
const orderedRoles = roleOrder.filter((r) => grouped[r] && grouped[r].length > 0);

// Show how many sessions each group has
const roleTitles = {
  Shared: `👥 Shared Session(s)`,
  "Social Worker": `Social Worker Session(s) — Total: ${grouped["Social Worker"]?.length || 0}`,
  Psychometrician: `Psychometrician Session(s) — Total: ${grouped["Psychometrician"]?.length || 0}`,
  Nurse: `Nurse Session(s) — Total: ${grouped["Nurse"]?.length || 0}`,
  "Home Life": `Home Life Session(s) — Total: ${grouped["Home Life"]?.length || 0}`,
  Unassigned: `Other Session(s) — Total: ${grouped["Unassigned"]?.length || 0}`,
};


  return (
    <div className="mt-5 space-y-5">
      {orderedRoles.map((role) => {
        const sessions = grouped[role];
        return (
          <div
            key={role}
            className="border rounded-lg bg-white shadow-sm overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => setOpenRole((prev) => (prev === role ? null : role))}
              className="w-full text-left px-5 py-3 border-b bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition"
            >
              <span className="font-semibold text-[#292D96] text-base">
                {roleTitles[role] || role}
              </span>
              <span className="text-gray-500 text-lg">
                {openRole === role ? "−" : "+"}
              </span>
            </button>

            {/* Collapsible Sessions */}
            <AnimatePresence initial={false}>
              {openRole === role && (
                <motion.div
                  key={role}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <div
                        key={session.sess_id}
                        onClick={() => onSelectSession(session.sess_id)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold text-[#292D96]">
                            Session {session.sess_num}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              session.sess_status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : session.sess_status === "Ongoing"
                                ? "bg-blue-100 text-blue-700"
                                : session.sess_status === "Done"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {session.sess_status}
                          </span>
                        </div>

                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                          <p>
                              <span className="font-medium">Started On:</span>{" "}
                              {session.sess_date_today
                                ? new Date(session.sess_date_today).toLocaleString([], {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                : "—"}
                            </p>
                          <p>
                            <span className="font-medium">Assigned Official(s):</span>{" "}
                            {session.official_names && session.official_names.length > 0
                              ? session.official_names.join(", ")
                              : "—"}
                          </p>
                        </div>


                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Create Session Button */}
      {(() => {
        const session1 = (incident.sessions || []).find((s) => s.sess_num === 1);
        const canCreate = session1 && session1.sess_status === "Done";
        if (canCreate) {
          return (
            <div className="flex justify-end mt-6">
              <button
                onClick={() =>
                  navigate(
                    `/social_worker/more-sessions/create/${incident.incident_id}`
                  )
                }
                className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
              >
                + Create New Session
              </button>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
