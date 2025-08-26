// frontend/src/pages/dswd/victims/VictimDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Sidebar from "../sidebar";

const API_BASE = "http://127.0.0.1:8000/api/dswd";

export default function VictimDetails() {
  const { vic_id } = useParams();
  const [victim, setVictim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/victims/${vic_id}/`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setVictim(data || null);
      } catch (err) {
        setError(err?.response?.status ? `Error ${err.response.status}` : "Request failed");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [vic_id]);

  // small helper to read whichever key exists (keeps UI from going blank if fields differ)
  const get = (obj, keys, fallback = "N/A") => {
    for (const k of keys) {
      if (obj && obj[k] != null && obj[k] !== "") return obj[k];
    }
    return fallback;
  };

  const fullName = victim
    ? [
        get(victim, ["vic_first_name", "first_name", "fname", "given_name"], ""),
        get(victim, ["vic_middle_name", "middle_name", "mname"], ""),
        get(victim, ["vic_last_name", "last_name", "lname", "surname"], ""),
        get(victim, ["vic_extension", "name_suffix"], ""),
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        <Sidebar />

        <div className="flex-1 p-6">
          {loading && <p className="text-gray-600">Loading victim details…</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="max-w-3xl rounded-2xl bg-white p-6 shadow">
              <h2 className="mb-4 text-2xl font-bold text-[#292D96]">Victim Details</h2>

              {!victim ? (
                <p className="text-gray-600">No victim data found.</p>
              ) : (
                <div className="space-y-2 text-gray-800">
                  <p><strong>Victim ID:</strong> {get(victim, ["vic_id", "id"])}</p>
                  <p><strong>Name:</strong> {fullName || "N/A"}</p>
                  <p><strong>Sex:</strong> {get(victim, ["vic_sex", "sex", "gender"])}</p>
                  <p><strong>Age:</strong> {get(victim, ["age"])}</p>
                  <p><strong>Birth Place:</strong> {get(victim, ["vic_birth_place", "birth_place", "place"])}</p>

                  {/* Photo if provided (expects absolute URL) */}
                  {get(victim, ["vic_photo", "photo_url", "photo"], null) && (
                    <div className="mt-4">
                      <h3 className="mb-1 text-lg font-semibold">Profile Photo</h3>
                      <img
                        src={get(victim, ["vic_photo", "photo_url", "photo"], "")}
                        alt="Victim"
                        width="220"
                        className="rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Case Report */}
                  {victim.case_report && (
                    <div className="mt-6">
                      <h3 className="mb-2 text-lg font-semibold">Case Report</h3>
                      <p><strong>Handling Org:</strong> {get(victim.case_report, ["handling_org"])}</p>
                      <p><strong>Report Type:</strong> {get(victim.case_report, ["report_type"])}</p>
                      <p>
                        <strong>Informant:</strong> {get(victim.case_report, ["informant_name"])} (
                        {get(victim.case_report, ["informant_relationship"])})
                      </p>
                      <p><strong>Contact:</strong> {get(victim.case_report, ["informant_contact"])}</p>
                    </div>
                  )}

                  {/* Incidents */}
                  {Array.isArray(victim.incidents) && victim.incidents.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-2 text-lg font-semibold">Incidents</h3>
                      <ul className="space-y-3">
                        {victim.incidents.map((incident) => (
                          <li key={incident.incident_id} className="rounded-lg border p-3">
                            <p><strong>Date:</strong> {get(incident, ["incident_date"])}</p>
                            <p><strong>Description:</strong> {get(incident, ["incident_description"])}</p>
                            <p><strong>Location:</strong> {get(incident, ["incident_location"])}</p>

                            {incident.perpetrator ? (
                              <div className="mt-2 rounded-md bg-gray-50 p-2">
                                <h4 className="font-semibold">Perpetrator</h4>
                                <p>
                                  <strong>Name:</strong>{" "}
                                  {[
                                    get(incident.perpetrator, ["per_first_name", "first_name"], ""),
                                    get(incident.perpetrator, ["per_last_name", "last_name"], "")
                                  ].filter(Boolean).join(" ") || "N/A"}
                                </p>
                                <p><strong>Sex:</strong> {get(incident.perpetrator, ["per_sex", "sex"])}</p>
                                <p><strong>Relationship:</strong> {get(incident.perpetrator, ["per_relationship_category", "relationship"])}</p>
                              </div>
                            ) : (
                              <p><em>No perpetrator linked</em></p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Face samples */}
                  {Array.isArray(victim.face_samples) && victim.face_samples.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-2 text-lg font-semibold">Face Samples</h3>
                      <div className="flex flex-wrap gap-2">
                        {victim.face_samples.map((sample, i) => (
                          <img key={i} src={get(sample, ["photo"], "")} alt={`Sample ${i + 1}`} width="150" className="rounded-md border" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/dswd/victims"
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
