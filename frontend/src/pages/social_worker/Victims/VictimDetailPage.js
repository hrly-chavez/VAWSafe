import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./VictimDetailPage.css";
import Navbar from "../../Navbar";
import Sidebar from "../../Sidebar";

export default function VictimDetailPage() {
  const { vic_id } = useParams();
  const [victim, setVictim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/social_worker/victims/${vic_id}/`)
      .then((res) => {
        setVictim(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [vic_id]);

  if (loading) return <p>Loading victim details...</p>;
  if (!victim) return <p>No victim data found.</p>;

  return (
    <div>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="victim-detail-page">
          <div className="victim-detail-card">
            <h2>Victim Details</h2>
            <p><strong>Victim ID:</strong> {victim.vic_id}</p>
            <p><strong>Name:</strong> {victim.vic_first_name} {victim.vic_middle_name || ""} {victim.vic_last_name} {victim.vic_extension || ""}</p>
            <p><strong>Sex:</strong> {victim.vic_sex}</p>
            <p><strong>Age:</strong> {victim.age ? victim.age : "N/A"}</p>
            <p><strong>Birth Place:</strong> {victim.vic_birth_place || "N/A"}</p>

            {/* Victim Photo
            {victim.vic_photo && (
              <div className="victim-photo">
                <img
                  src={`http://127.0.0.1:8000${victim.vic_photo}`}
                  alt="Victim"
                  width="200"
                />
              </div>
            )} */}
            {/* Victim Photo */}
                {victim.vic_photo && (
                <div className="victim-photo">
                    <h3>Profile Photo(Mobile?)</h3>
                    <img
                    src={victim.vic_photo}   // already a full URL
                    alt="Victim"
                    width="200"
                    />
                </div>
                )}


            {/* Case Report */}
            {victim.case_report && (
              <div className="case-report">
                <h3>Case Report</h3>
                <p><strong>Handling Org:</strong> {victim.case_report.handling_org}</p>
                <p><strong>Report Type:</strong> {victim.case_report.report_type}</p>
                <p><strong>Informant:</strong> {victim.case_report.informant_name} ({victim.case_report.informant_relationship})</p>
                <p><strong>Contact:</strong> {victim.case_report.informant_contact}</p>
              </div>
            )}

            {/* Incidents with Perpetrators */}
            {victim.incidents && victim.incidents.length > 0 && (
              <div className="incidents">
                <h3>Incidents</h3>
                <ul>
                  {victim.incidents.map((incident) => (
                    <li key={incident.incident_id} className="incident-item">
                      <p><strong>Date:</strong> {incident.incident_date}</p>
                      <p><strong>Description:</strong> {incident.incident_description}</p>
                      <p><strong>Location:</strong> {incident.incident_location}</p>

                      {incident.perpetrator ? (
                        <div className="perpetrator">
                          <h4>Perpetrator</h4>
                          <p><strong>Name:</strong> {incident.perpetrator.per_first_name} {incident.perpetrator.per_last_name}</p>
                          <p><strong>Sex:</strong> {incident.perpetrator.per_sex || "N/A"}</p>
                          <p><strong>Relationship:</strong> {incident.perpetrator.per_relationship_category || "N/A"}</p>
                        </div>
                      ) : (
                        <p><em>No perpetrator linked</em></p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Face Samples */}
                {victim.face_samples && victim.face_samples.length > 0 && (
                <div className="face-samples">
                    <h3>Face Samples</h3>
                    <div className="photos">
                    {victim.face_samples.map((sample, index) => (
                        <img
                        key={index}
                        src={sample.photo}   // already a full URL
                        alt={`Sample ${index + 1}`}
                        width="150"
                        />
                    ))}
                    </div>
                </div>
                )}

            {/* Back Button */}
            <Link to="/social_worker/victims" className="btn-back">
              ← Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
