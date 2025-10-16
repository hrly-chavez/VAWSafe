// src/pages/dswd/Victim/SessionDetail.js
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import ServiceList from "./SessionDetail/ServiceList";

export default function SessionDetail({ sessionId, onClose }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await api.get(`/api/dswd/victims/sessions/${sessionId}/`);
        setSession(res.data);
      } catch (err) {
        console.error("Failed to load session:", err);
        setError("Failed to load session details.");
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
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-3xl w-full relative max-h-[90vh] overflow-y-auto z-[10000] border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* === HEADER === */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b shadow-sm">
          <h2 className="text-2xl font-bold text-[#292D96]">Session Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* === CONTENT === */}
        <div className="p-6 space-y-5">
          {loading ? (
            <p>Loading session...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : session ? (
            <>
              {/* === BASIC INFO === */}
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
                  label="Assigned Official"
                  value={session.official_name}
                />
              </div>

              {/* === DESCRIPTION === */}
              <div>
                <h3 className="text-lg font-semibold text-[#292D96] mt-4 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words bg-gray-50 border rounded-md p-3">
                  {session.sess_description || "—"}
                </p>
              </div>

              {/* === SESSION TYPES === */}
              {session.sess_type_display && session.sess_type_display.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#292D96] mt-4 mb-2">
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

              {/* === ANSWERED QUESTIONS === */}
              <div>
                <h3 className="text-lg font-semibold text-[#292D96] mt-4 mb-2">
                  Answered Questions
                </h3>
                {session.questions && session.questions.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      session.questions.reduce((acc, q) => {
                        const cat = q.question_category || "Uncategorized";
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(q);
                        return acc;
                      }, {})
                    ).map(([category, qs]) => (
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
                                {q.question_text || q.sq_custom_text}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Answer:</span>{" "}
                                {q.sq_value || "—"}
                              </p>
                              {q.sq_note && (
                                <p className="text-xs text-gray-500 italic">
                                  Note: {q.sq_note}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No answered questions available.
                  </p>
                )}
              </div>

              {/* === SERVICES GIVEN (READ-ONLY) === */}
              <div>
                <h3 className="text-lg font-semibold text-[#292D96] mt-6 mb-2">
                  Services Given
                </h3>
                {session.services_given && session.services_given.length > 0 ? (
                  <ServiceList services={session.services_given} />
                ) : (
                  <p className="text-sm text-gray-500">No services recorded.</p>
                )}
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
