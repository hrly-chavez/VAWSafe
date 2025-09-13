// src/pages/social_worker/Sessions/ViewSessions.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

export default function ViewSessions() {
  const { sess_id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/social_worker/sessions/${sess_id}/`)
      .then((res) => {
        setSession(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch session", err);
        setLoading(false);
      });
  }, [sess_id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) return <p className="p-6">Loading...</p>;

  if (!session) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Session not found or you are not assigned to it.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { victim, incident, case_report } = session;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">
        Session Details
      </h2>

      {/* Session Info */}
      <section>
        <h3 className="font-semibold text-lg mb-2">Session Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p><strong>Case No.:</strong> {incident?.incident_num || "—"}</p>
          <p><strong>Session No.:</strong> {session.sess_num || "—"}</p>
          <p><strong>Status:</strong> {session.sess_status || "—"}</p>
          <p><strong>Type:</strong> {session.sess_type || "—"}</p>
          <p><strong>Location:</strong> {session.sess_location || "—"}</p>
          <p><strong>Assigned Social Worker:</strong> {session.official_name || "—"}</p>
        </div>
      </section>

      {/* Victim Info */}
      {victim && (
        <section>
          <h3 className="font-semibold text-lg mb-2">Victim Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><strong>Full Name:</strong> {victim.vic_first_name} {victim.vic_middle_name} {victim.vic_last_name} {victim.vic_extension}</p>
            <p><strong>Sex:</strong> {victim.vic_sex}</p>
            <p><strong>Birth Date:</strong> {victim.vic_birth_date}</p>
            <p><strong>Birth Place:</strong> {victim.vic_birth_place}</p>
            <p><strong>Civil Status:</strong> {victim.vic_civil_status}</p>
            <p><strong>Education:</strong> {victim.vic_educational_attainment}</p>
            <p><strong>Nationality:</strong> {victim.vic_nationality}</p>
            <p><strong>Religion:</strong> {victim.vic_religion}</p>
            <p><strong>Contact:</strong> {victim.vic_contact_number}</p>
          </div>
        </section>
      )}

      {/* Incident Info */}
      {incident && (
        <section>
          <h3 className="font-semibold text-lg mb-2">Incident Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><strong>Description:</strong> {incident.incident_description}</p>
            <p><strong>Date:</strong> {incident.incident_date}</p>
            <p><strong>Time:</strong> {incident.incident_time}</p>
            <p><strong>Location:</strong> {incident.incident_location}</p>
            <p><strong>Type of Place:</strong> {incident.type_of_place}</p>
            <p><strong>Conflict Area:</strong> {incident.conflict_area || "—"}</p>
            <p><strong>Calamity Area:</strong> {incident.is_calamity_area ? "Yes" : "No"}</p>
          </div>
        </section>
      )}

      {/* Perpetrator Info */}
      {incident?.perpetrator && (
        <section>
          <h3 className="font-semibold text-lg mb-2">Perpetrator Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><strong>Name:</strong> {incident.perpetrator.perp_first_name} {incident.perpetrator.perp_last_name}</p>
            <p><strong>Sex:</strong> {incident.perpetrator.perp_sex}</p>
            <p><strong>Birth Date:</strong> {incident.perpetrator.perp_birth_date}</p>
            <p><strong>Contact:</strong> {incident.perpetrator.perp_contact_number}</p>
          </div>
        </section>
      )}


      {/* Case Report */}
        {case_report && (
          <section>
            <h3 className="font-semibold text-lg mb-2">Case Report</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><strong>Handling Organization:</strong> {case_report.handling_org || "—"}</p>
              <p><strong>Office Address:</strong> {case_report.office_address || "—"}</p>
              <p><strong>Report Type:</strong> {case_report.report_type || "—"}</p>
            </div>
          </section>
        )}


      <div className="mt-6 flex justify-end">
       <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Start Session
      </button>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Back
        </button>
      </div>
    </div>
  );
}
