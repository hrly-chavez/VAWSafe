// src/pages/social_worker/CaseRecords/CaseRecords.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";   
import "./CaseRecords.css";

export default function CaseRecords() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get("/api/social_worker/cases/");
        setCases(res.data);
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <div>
      <div className="flex min-h-screen bg-white">
        <div className="sw-case-records-page">
          <div className="sw-case-records-card">
            <h2 className="caserecordstext">Case Records</h2>
            <p className="list-text">List of Case Records</p>

            <div className="table-container">
              {loading ? (
                <p>Loading cases...</p>
              ) : (
                <table className="table-case-records">
                  <thead>
                    <tr>
                      <th>Case No.</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Case Status</th>
                      <th>Case</th>
                      <th>Intake Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.length > 0 ? (
                      cases.map((c) => (
                        <tr key={c.incident_id}>
                          <td>{c.incident_num || c.incident_id}</td>
                          <td>{c.victim_name}</td>
                          <td>{c.gender}</td>
                          <td>{c.incident_status}</td>
                          <td>{c.violence_type}</td>
                          <td>
                            <Link to={`/social_worker/case-records/${c.incident_id}`}>
                              View Form
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center" }}>
                          No cases found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
