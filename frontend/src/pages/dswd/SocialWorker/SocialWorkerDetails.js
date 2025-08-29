// frontend/src/pages/dswd/socialworkers/SocialWorkerDetails.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Sidebar from "../sidebar";

const API_BASE = "http://127.0.0.1:8000/api/dswd";

export default function SocialWorkerDetails() {
  const { of_id } = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // same helper you used in VictimDetails
  const get = (obj, keys, fallback = "N/A") => {
    for (const k of keys) {
      if (obj && obj[k] != null && obj[k] !== "") return obj[k];
    }
    return fallback;
  };

  const fullName = useMemo(() => {
    if (!worker) return "";
    return [
      get(worker, ["of_fname", "first_name", "fname"], ""),
      get(worker, ["of_m_initial", "mname"], "") && `${get(worker, ["of_m_initial", "mname"], "")}.`,
      get(worker, ["of_lname", "last_name", "lname"], ""),
      get(worker, ["of_suffix", "suffix"], ""),
    ]
      .filter(Boolean)
      .join(" ");
  }, [worker]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/social_worker/${of_id}/`);
        // we’ll return a single object from the API, not a list
        setWorker(res.data || null);
      } catch (err) {
        setError(err?.response?.status ? `Error ${err.response.status}` : "Request failed");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [of_id]);

  const incidents = Array.isArray(worker?.handled_incidents) ? worker.handled_incidents : [];
  const sessions = Array.isArray(worker?.sessions_handled) ? worker.sessions_handled : [];
  const faces = Array.isArray(worker?.face_samples) ? worker.face_samples : [];

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-white">
        <Sidebar />

        <div className="flex-1 p-6">
          {loading && <p className="text-gray-600">Loading social worker details…</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="max-w-4xl rounded-2xl bg-white p-6 shadow">
              <h2 className="mb-4 text-2xl font-bold text-[#292D96]">Social Worker Details</h2>

              {!worker ? (
                <p className="text-gray-600">No data found.</p>
              ) : (
                <div className="space-y-6 text-gray-800">
                  {/* Header card */}
                  <div className="flex items-start gap-4">
                    {get(worker, ["of_photo", "photo"], null) ? (
                      <img
                        src={get(worker, ["of_photo", "photo"], "")}
                        alt={fullName}
                        className="h-24 w-24 rounded-xl object-cover border"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-xl bg-neutral-200" />
                    )}

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{fullName || "N/A"}</h3>
                      <p className="text-sm text-neutral-600">
                        <strong>Role:</strong> {get(worker, ["of_role"], "Social Worker")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <span>
                          <strong>Contact:</strong> {get(worker, ["of_contact"])}
                        </span>
                        
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <span>
                          <strong>Barangay Assigned:</strong> {get(worker, ["of_brgy_assigned"])}
                        </span>
                        <span>
                          <strong>Specialization:</strong> {get(worker, ["of_specialization"])}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Face samples */}
                  {faces.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-lg font-semibold">Face Samples</h4>
                      <div className="flex flex-wrap gap-2">
                        {faces.map((s, i) => (
                          <img
                            key={i}
                            src={get(s, ["photo"], "")}
                            alt={`Face sample ${i + 1}`}
                            className="h-24 w-24 rounded-md object-cover border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incidents handled */}
                  <div>
                    <h4 className="mb-2 text-lg font-semibold">Incidents Handled ({incidents.length})</h4>
                    {incidents.length === 0 ? (
                      <p className="text-sm text-neutral-600">No incidents recorded.</p>
                    ) : (
                      <ul className="space-y-3">
                        {incidents.map((inc) => (
                          <li key={inc.incident_id} className="rounded-lg border p-3">
                            <p><strong>Date:</strong> {get(inc, ["incident_date"])}</p>
                            <p><strong>Location:</strong> {get(inc, ["incident_location"])}</p>
                            <p><strong>Type of place:</strong> {get(inc, ["type_of_place"])}</p>
                            <p className="mt-1"><strong>Description:</strong> {get(inc, ["incident_description"])}</p>

                            {inc.victim ? (
                              <div className="mt-2 rounded-md bg-gray-50 p-2">
                                <h5 className="font-semibold">Victim</h5>
                                <p>
                                  <strong>Name:</strong>{" "}
                                  {[
                                    get(inc.victim, ["vic_first_name"], ""),
                                    get(inc.victim, ["vic_last_name"], "")
                                  ].filter(Boolean).join(" ") || "N/A"}
                                  {" "}
                                  (<Link
                                    to={`/dswd/victims/${get(inc.victim, ["vic_id"], "")}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    view details
                                  </Link>)
                                </p>
                                <p><strong>Sex:</strong> {get(inc.victim, ["vic_sex"])}</p>
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Sessions handled */}
                  <div>
                    <h4 className="mb-2 text-lg font-semibold">Sessions Handled ({sessions.length})</h4>
                    {sessions.length === 0 ? (
                      <p className="text-sm text-neutral-600">No sessions recorded.</p>
                    ) : (
                      <div className="max-h-[320px] overflow-auto rounded-xl border">
                        <table className="w-full table-auto border-collapse">
                          <thead className="sticky top-0 bg-neutral-50 text-left text-sm font-semibold text-neutral-700">
                            <tr>
                              <th className="px-4 py-3">Session ID</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Next Schedule</th>
                              <th className="px-4 py-3">Incident</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-sm">
                            {sessions.map((s) => (
                              <tr key={s.sess_id} className="hover:bg-neutral-50">
                                <td className="px-4 py-3">{s.sess_id}</td>
                                <td className="px-4 py-3">{get(s, ["sess_date_today"])}</td>
                                <td className="px-4 py-3">{get(s, ["sess_status"])}</td>
                                <td className="px-4 py-3">{get(s, ["sess_next_sched"])}</td>
                                <td className="px-4 py-3">
                                  {s.incident ? (
                                    <>
                                      #{get(s.incident, ["incident_id"])} — {get(s.incident, ["incident_date"])}
                                    </>
                                  ) : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/dswd/social-workers"
                  className="inline-flex items-center rounded-lg bg-[#292D96] px-4 py-2 text-white hover:bg-[#1f2375]"
                >
                  ← Back to List
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
