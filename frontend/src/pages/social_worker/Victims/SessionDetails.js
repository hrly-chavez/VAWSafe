// src/pages/social_worker/Victims/SessionDetails.js
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import ServiceList from "./SessionDetails/ServiceList";

export default function SessionDetails({ sessionId, onClose }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRole, setOpenRole] = useState([]);

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
              <DetailItem
                label="Scheduled Date"
                value={
                  session.sess_next_sched
                    ? new Date(session.sess_next_sched).toLocaleString([], {
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
              <DetailItem label="Location" value={session.sess_location} />
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
            <div>
              <h3 className="text-lg font-semibold text-[#292D96] mt-6 mb-2">
                 Worker Feedback
              </h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap break-words bg-gray-50 border rounded-md p-3">
                {session.sess_description || "—"}
              </p>
            </div>

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
              <h3 className="text-lg font-semibold text-[#292D96] mt-6 mb-2">
                Questions by Role
              </h3>

              {(() => {
                // Group questions by Role → Category
                const groupedByRole = session.questions?.reduce((acc, q) => {
                  const role = q.assigned_role || "Unassigned";
                  const category = q.question_category_name || "Uncategorized";
                  if (!acc[role]) acc[role] = {};
                  if (!acc[role][category]) acc[role][category] = [];
                  acc[role][category].push(q);
                  return acc;
                }, {});

                if (!groupedByRole || Object.keys(groupedByRole).length === 0)
                  return (
                    <p className="text-sm text-gray-500">
                      No mapped questions answered.
                    </p>
                  );

                const roleColors = {
                  "Social Worker": "border-green-400 bg-green-50",
                  "Nurse": "border-blue-400 bg-blue-50",
                  "Psychometrician": "border-purple-400 bg-purple-50",
                  "Home Life": "border-orange-400 bg-orange-50",
                  "Unassigned": "border-gray-300 bg-gray-50",
                };

                return Object.entries(groupedByRole).map(([role, categories]) => (
                  <div
                    key={role}
                    className="mb-5 border rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Toggle button */}
                          <button
                            onClick={() => {
                              setOpenRole((prev) =>
                                prev.includes(role)
                                  ? prev.filter((r) => r !== role)
                                  : [...prev, role]
                              );
                            }}
                            className={`w-full text-left px-5 py-3 font-semibold text-gray-900 border-b ${
                              roleColors[role] || "border-gray-300 bg-gray-50"
                            } flex items-center justify-between`}
                          >
                            <span>{role}</span>
                            <span className="text-lg">
                              {openRole.includes(role) ? "−" : "+"}
                            </span>
                          </button>

                          {/* Smooth slide-down animation */}
                          <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                              openRole.includes(role)
                                ? "max-h-[1000px] opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >


                      <div className="p-4 bg-white space-y-4">
                        {Object.entries(categories).map(([category, qs]) => (
                          <div key={category}>
                            <h4 className="text-md font-semibold text-gray-700 mb-2">{category}</h4>
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
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>


                  </div>
                ));
              })()}
            </div>


            {/* Custom Questions */}
            <div>
              <h3 className="text-lg font-semibold text-[#292D96] mt-6 mb-2">
                Custom Questions
              </h3>
              {session.questions?.filter((q) => q.sq_custom_text).length > 0 ? (
                <div className="space-y-3">
                  {session.questions
                    .filter((q) => q.sq_custom_text)
                    .map((q) => (
                      <div
                        key={q.sq_id}
                        className="p-3 border rounded-md bg-gray-50"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {q.sq_custom_text}
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
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No custom questions answered.
                </p>
              )}
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold text-[#292D96] mt-6 mb-2">
                Services Given
              </h3>
              <ServiceList
                services={session.services_given}
                onFeedbackUpdate={async () => {
                  try {
                    const res = await api.get(
                      `/api/social_worker/sessions/${sessionId}/`
                    );
                    setSession(res.data);
                  } catch (err) {
                    console.error("Failed to refresh session data", err);
                  }
                }}
              />
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
