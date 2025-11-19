// src/pages/social_worker/Victims/SessionDetails.js
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import ServiceList from "./SessionDetails/ServiceList";

export default function SessionDetails({ sessionId, onClose }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRole, setOpenRole] = useState([]);

  function formatDateTime(dateStr) {
    if (!dateStr) return "—";

    const [datePart, timePart] = dateStr.split("T");
    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    // Convert to 12-hour format manually
    let h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    const finalTime = `${h}:${minute} ${suffix}`;

    // Convert date only (safe)
    const readableDate = new Date(`${year}-${month}-${day}T00:00:00`).toLocaleDateString(
      "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );

    return `${readableDate} ${finalTime}`;
  }

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await api.get(`/api/social_worker/sessions/${sessionId}/`);
        setSession(res.data);
      } catch (err) {
        setError("Failed to load session details");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (!sessionId) return null;

return (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[9999]"
    onClick={onClose}
  >
    <div
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-5xl w-full relative max-h-[90vh] overflow-y-auto z-[10000] border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b shadow-sm">
        <h2 className="text-2xl font-bold text-[#292D96]">Session Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {loading ? (
          <p>Loading session...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : session ? (
          <>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Session Number" value={session.sess_num} />
              <DetailItem label="Status" value={session.sess_status} />
              {session.sess_next_sched && (
              <DetailItem
                label="Scheduled Date"
                value={formatDateTime(session.sess_next_sched)}
              />

            )}

              <DetailItem
                label="Start Date"
                value={
                  session.sess_date_today
                    ? new Date(session.sess_date_today).toLocaleString([], {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "—"
                }
              />
              
              <DetailItem
                label="Assigned Officials"
                value={
                  session.official_names?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {session.official_names.map((name, idx) => (
                        <li key={idx}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )
                }
              />
            </div>

            {/* Description */}
            {/* <div>
              <h3 className="text-lg font-semibold text-[#292D96] mt-6 mb-2">
                 Session Feedback
              </h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words bg-gray-50 border rounded-md p-3">
                {session.sess_description || "—"}
              </p>
            </div> */}

            {/* Session Types */}
            {session.sess_type_display?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#292D96] mt-6 mb-2">
                  Session Type(s)
                </h3>
                <div className="p-3 border rounded-md bg-gray-50 space-y-1">
                  {session.sess_type_display.map((type, idx) => (
                    <p key={idx} className="text-sm font-medium text-gray-800">
                      {type.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Grouped Questions by Role → Category */}        
            <div>
              <h3 className="text-lg font-semibold text-[#292D96] mt-6 mb-3">
                Questions by Role
              </h3>

              {(() => {
                const questions = session.questions || [];
                const progress = session.progress || [];

                // Collect roles from questions + progress
                const rolesSet = new Set();

                questions.forEach((q) => {
                  const r = q.assigned_role || q.question_role || "Unassigned";
                  rolesSet.add(r);
                });

                progress.forEach((p) => {
                  if (p.official_role) rolesSet.add(p.official_role);
                });

                const roles = Array.from(rolesSet);
                if (roles.length === 0) {
                  return (
                    <p className="text-sm text-gray-500">No mapped questions answered.</p>
                  );
                }

                // Build structure: Role → Category → Questions
                const grouped = {};
                roles.forEach((role) => (grouped[role] = {}));

                questions.forEach((q) => {
                  const role = q.assigned_role || q.question_role || "Unassigned";
                  const category = q.question_category_name || "Uncategorized";

                  if (!grouped[role]) grouped[role] = {};
                  if (!grouped[role][category]) grouped[role][category] = [];
                  grouped[role][category].push(q);
                });

                const roleColors = {
                  "Social Worker": "border-green-400 bg-green-50",
                  Nurse: "border-blue-400 bg-blue-50",
                  Psychometrician: "border-purple-400 bg-purple-50",
                  "Home Life": "border-orange-400 bg-orange-50",
                  Unassigned: "border-gray-300 bg-gray-50",
                };

                return roles.map((role) => {
                  const categories = grouped[role] || {};
                  const roleProgress = progress.find(
                    (p) =>
                      String(p.official_role || "").toLowerCase() ===
                      String(role).toLowerCase()
                  );

                  return (
                    <div
                      key={role}
                      className="mb-6 border rounded-lg shadow-sm overflow-hidden"
                    >
                      {/* Role Header */}
                      <button
                        onClick={() => {
                          setOpenRole((prev) =>
                            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
                          );
                        }}
                        className={`w-full text-left px-5 py-3 font-semibold text-gray-900 flex items-center justify-between border-b ${roleColors[role]}`}
                      >
                        <span>{role}</span>
                        <span className="text-lg">
                          {openRole.includes(role) ? "−" : "+"}
                        </span>
                      </button>

                      {/* Slide down */}
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          openRole.includes(role)
                            ? "max-h-[2000px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {/* Questions + Answers */}
                        <div className="p-4 bg-white space-y-5">
                          {Object.entries(categories).map(([category, qs]) => (
                            <div key={category}>
                              <h4 className="text-md font-semibold text-gray-700 mb-2">
                                {category}
                              </h4>
                              <div className="space-y-3">
                                {qs.map((q) => (
                                  <div
                                    key={q.sq_id}
                                    className="p-3 border rounded-md bg-gray-50"
                                  >
                                    <p className="text-sm font-medium text-gray-800">
                                      {q.question_text}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                      <span className="font-semibold">Answer:</span>{" "}
                                      {q.sq_value || "—"}
                                    </p>

                                    {q.sq_note && (
                                      <p className="text-sm text-gray-500 italic">
                                        Note: {q.sq_note}
                                      </p>
                                    )}

                                    {/* {q.answered_by_name && (
                                      <p className="text-xs text-gray-400 italic">
                                        Answered by {q.answered_by_name}
                                      </p>
                                    )} */}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Per-role feedback */}
                          <div className="mt-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">
                              {role} Feedback
                            </h4>
                            <textarea
                              readOnly
                              value={roleProgress?.notes || ""}
                              className="w-full border rounded-md p-2 bg-gray-50 text-sm"
                              rows={3}
                              placeholder="No feedback submitted"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>


          </>
        ) : (
          <p>No session found.</p>
        )}
      </div>
    </div>
  </div>
);
}

function DetailItem({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-md px-4 py-3 border shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}
