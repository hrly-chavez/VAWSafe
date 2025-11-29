// src/pages/dswd/Victim/VictimDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import SectionHeader from "../../../components/SectionHeader";
import CaseTreeModal from "./CaseTreeModal";
import SessionDetails from "./SessionDetail";
import Modal from "../../../components/Modal";
import ReportModal from "../../../components/ReportModal";

export default function VictimDetails() {
  const { vic_id } = useParams();
  const navigate = useNavigate();

  const [victim, setVictim] = useState(null);
  const [incidentList, setIncidentList] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [openSessionIndex, setOpenSessionIndex] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [reportsList, setReportsList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const [showCaseModal, setShowCaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lock scroll when case modal is open
  useEffect(() => {
    document.body.style.overflow = showCaseModal ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [showCaseModal]);

  // Fetch victim, incidents, and consolidated reports
  useEffect(() => {
    const fetchVictim = async () => {
      try {
        const res = await api.get(`/api/social_worker/victims/${vic_id}/`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setVictim(data || null);
      } catch (err) {
        setError(err?.response?.status ? `Error ${err.response.status}` : "Request failed");
      } finally {
        setLoading(false);
      }
    };

    const fetchIncidents = async () => {
      try {
        const res = await api.get(`/api/dswd/victims/case/${vic_id}/`);
        if (Array.isArray(res.data)) setIncidentList(res.data);
      } catch (err) {
        console.error("Failed to fetch incidents", err);
      }
    };

    // Consolidated reports (SW, Nurse, Psychometrician) — view-only for DSWD Admin
    const fetchReports = async () => {
      try {
        let swData = [];
        let nurseData = [];
        let psychComData = [];
        let psychMonthlyData = [];

        const normalize = (report, type) => ({
          ...report,
          report_type: report.report_type ?? type,
          prepared_by_id: report.prepared_by_id ?? report.prepared_by?.id ?? null,
          prepared_by_name: report.prepared_by_name ?? report.prepared_by?.full_name ?? "—",
          incident: report.incident?.id ?? report.incident ?? null,
        });

        try {
          const swRes = await api.get(`/api/social_worker/victims/${vic_id}/reports/`);
          swData = (Array.isArray(swRes.data) ? swRes.data : []).map(r =>
            normalize(r, "Social Worker")
          );
        } catch (err) {
          console.error("SW reports error", err);
        }

        try {
          const nurseRes = await api.get(`/api/nurse/victims/${vic_id}/monthly-reports/`);
          nurseData = (Array.isArray(nurseRes.data) ? nurseRes.data : []).map(r =>
            normalize(r, "Nurse")
          );
        } catch (err) {
          console.error("Nurse reports error", err);
        }

        try {
          const psychComRes = await api.get(`/api/nurse/victims/${vic_id}/psych-comprehensive-reports/`);
          psychComData = (Array.isArray(psychComRes.data) ? psychComRes.data : []).map(r =>
            normalize(r, "Psychometrician Comprehensive")
          );
        } catch (err) {
          console.error("Psych comprehensive error", err);
        }

        try {
          const psychMonthlyRes = await api.get(`/api/nurse/victims/${vic_id}/psych-monthly-progress-reports/`);
          psychMonthlyData = (Array.isArray(psychMonthlyRes.data) ? psychMonthlyRes.data : []).map(r =>
            normalize(r, "Psychometrician Monthly")
          );
        } catch (err) {
          console.error("Psych monthly error", err);
        }

        const combined = [
          ...swData,
          ...nurseData,
          ...psychComData,
          ...psychMonthlyData,
        ];

        combined.sort((a, b) => new Date(b.report_month) - new Date(a.report_month));
        setReportsList(combined);
      } catch (err) {
        console.error("Unexpected error fetching reports", err);
      }
    };
    
    if (vic_id) {
      fetchVictim();
      fetchIncidents();
      fetchReports();
    }
  }, [vic_id]);

  const get = (obj, keys, fallback = "—") => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v != null && v !== "") return v;
    }
    return fallback;
  };

  const fullName = victim
    ? [
      get(victim, ["vic_first_name"]),
      get(victim, ["vic_middle_name"]),
      get(victim, ["vic_last_name"]),
      get(victim, ["vic_extension"]),
    ]
      .filter(Boolean)
      .join(" ")
    : "";

  if (loading) return <p>Loading victim details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!victim) return <p>No victim data found.</p>;

  return (
    <div className="min-h-screen p-4 sm:p-8 flex justify-center bg-gray-100 font-inter">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {/* Victim Profile Header */}
        <header className="h-40 rounded-t-xl bg-[#292D96] flex items-start p-6">
          <h1 className="text-3xl font-bold text-white shadow-sm">Women Victim-Survivor Profile</h1>
        </header>

        <section className="px-6 md:px-8 -mt-16 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center md:items-start">
            <img
              src={get(victim, ["vic_photo"], "")}
              alt="Victim"
              className="w-32 h-32 rounded-full border-4 border-white ring-4 ring-[#F59E0B] bg-gray-200 object-cover shadow-lg"
            />
            <h1 className="text-3xl font-bold mt-4 text-gray-800">{fullName}</h1>
            <p className="text-lg text-[#292D96] font-medium">Victim ID: {get(victim, ["vic_id"])}</p>
            <div className="mt-2 flex space-x-2 items-center">
              <span className="px-3 py-1 text-xs font-bold rounded-full uppercase bg-green-500 text-white">
                Registered
              </span>
              <p className="text-sm text-gray-500">Referred: Social Worker</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="px-6 md:px-8 mt-6 border-b border-gray-300">
          <nav className="flex space-x-6">
            {["details", "case", "reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 border-b-2 transition duration-200 ${activeTab === tab
                  ? "border-[#292D96] text-[#292D96] font-semibold"
                  : "border-transparent text-gray-600 hover:text-[#292D96]"
                  }`}
              >
                {tab === "details" && "Details"}
                {tab === "case" && "Case Details"}
                {tab === "reports" && "Reports"}
              </button>
            ))}
          </nav>
        </div>

        {/* Details Tab */}
        <div className="p-6 md:p-8">
          {activeTab === "details" && (
            <div className="space-y-8">
              {/* Personal & Contact Details */}
              <div>
                <SectionHeader icon="/images/id-card.png" title="Personal Info" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Sex</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_sex"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Civil Status</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_civil_status"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Birth Date</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_birth_date"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Birth Place</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_birth_place"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Religion</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_religion"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Nationality</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_nationality"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 md:col-span-2">
                    <p className="text-gray-500">Contact Number</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_contact_number"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 md:col-span-2">
                    <p className="text-gray-500">Current Address</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_current_address"], "—")}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 md:col-span-2">
                    <p className="text-gray-500">Provincial Address</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_provincial_address"])}</p>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <SectionHeader icon="/images/portfolio.png" title="Experience" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Occupation</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_occupation"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Monthly Income</p>
                    <p className="text-gray-800 font-medium">
                      {victim?.vic_income ? `₱${parseFloat(victim.vic_income).toLocaleString()}` : "—"}
                    </p>
                  </div>
                  <div className="md:col-span-2 pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Skills</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_skills"])}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div>
                <SectionHeader icon="/images/graduation.png" title="Education" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Educational Attainment</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_educational_attainment"])}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <p className="text-gray-500">Last School Attended</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_last_school_attended"])}</p>
                  </div>
                  <div className="md:col-span-2 pb-2 border-b border-gray-200">
                    <p className="text-gray-500">School Address</p>
                    <p className="text-gray-800 font-medium">{get(victim, ["vic_last_school_address"])}</p>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <SectionHeader icon="/images/contact_member.png" title="Contact Person" />
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                  {victim.contact_persons?.length > 0 ? (
                    victim.contact_persons.map((person, index) => (
                      <div key={index} className="pb-2 border-b border-gray-200">
                        <p className="text-gray-500">Full Name</p>
                        <p className="text-gray-800 font-medium">{person.full_name}</p>
                        <p className="text-gray-500 mt-2">Relationship</p>
                        <p className="text-gray-800 font-medium">{person.cont_victim_relationship}</p>
                        <p className="text-gray-500 mt-2">Contact Number</p>
                        <p className="text-gray-800 font-medium">{person.cont_contact_number}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No contact person information available.</p>
                  )}
                </div>
              </div>

              {/* Family Members */}
              <div>
                <SectionHeader icon="/images/family.png" title="Family Members" />
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                  {victim.family_members?.length > 0 ? (
                    victim.family_members.map((member, index) => (
                      <div key={index} className="pb-2 border-b border-gray-200">
                        <p className="text-gray-500">Full Name</p>
                        <p className="text-gray-800 font-medium">{member.full_name}</p>
                        <p className="text-gray-500 mt-2">Relationship</p>
                        <p className="text-gray-800 font-medium">{member.fam_victim_relationship}</p>
                        <p className="text-gray-500 mt-2">Sex</p>
                        <p className="text-gray-800 font-medium">{member.fam_sex}</p>
                        <p className="text-gray-500 mt-2">Civil Status</p>
                        <p className="text-gray-800 font-medium">{member.fam_civil_status}</p>
                        <p className="text-gray-500 mt-2">Educational Attainment</p>
                        <p className="text-gray-800 font-medium">{member.fam_educational_attainment}</p>
                        <p className="text-gray-500 mt-2">Occupation</p>
                        <p className="text-gray-800 font-medium">{member.fam_occupation}</p>
                        <p className="text-gray-500 mt-2">Income</p>
                        <p className="text-gray-800 font-medium">{member.fam_income}</p>
                        <p className="text-gray-500 mt-2">Birth Date</p>
                        <p className="text-gray-800 font-medium">{member.fam_birth_date}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No family member information available.</p>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Case Tab */}
          {activeTab === "case" && (
            <div className="space-y-10">
              <div className="bg-white border rounded-xl shadow-md p-6">
                <SectionHeader icon="/images/case_details.png" title="Case Information" />
                {incidentList.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No case records found for this victim.</p>
                ) : (
                  incidentList.map((incident, index) => (
                    <div key={index} className="border rounded-md p-4 shadow-sm bg-gray-50">
                      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-700">
                        <div>
                          <span className="font-medium text-gray-800">Case No:</span>{" "}
                          {incident.incident_num || "—"}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedIncident(incident);
                              setShowCaseModal(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-3 py-1.5 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
                          >
                            View Case Details
                          </button>
                          <button
                            onClick={() => {
                              const isSame = openSessionIndex === index;
                              setOpenSessionIndex(isSame ? null : index);
                            }}
                            className="inline-flex items-center gap-2 rounded-md border border-green-600 text-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-600 hover:text-white transition"
                          >
                            {openSessionIndex === index ? "Hide Sessions" : "View Sessions"}
                          </button>
                        </div>
                      </div>

                      {/* Sessions inline list; click opens SessionDetails */}
                      {openSessionIndex === index && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {incident.sessions?.length ? (
                            incident.sessions.map((session) => (
                              <div
                                key={session.sess_id}
                                className="p-4 bg-gray-50 border rounded-lg shadow cursor-pointer hover:shadow-md"
                                onClick={() => setSelectedSessionId(session.sess_id)}
                              >
                                <h4 className="font-semibold text-[#292D96]">
                                  Session {session.sess_num || "—"}
                                </h4>
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Status:</span>{" "}
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded ${session.sess_status === "Pending"
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
                                </p>
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Scheduled:</span>{" "}
                                  {session.sess_next_sched
                                    ? new Date(session.sess_next_sched).toLocaleString()
                                    : "—"}
                                </p>
                                {session.sess_date_today && (
                                  <p className="text-sm">
                                    <span className="font-medium">Started:</span>{" "}
                                    {new Date(session.sess_date_today).toLocaleString()}
                                  </p>
                                )}
                                <p className="text-sm">
                                  <span className="font-medium">Location:</span>{" "}
                                  {session.sess_location || "—"}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Assigned Official:</span>{" "}
                                  {session.official_name || "—"}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">No sessions available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Reports Tab (view-only) */}
          {activeTab === "reports" && (
            <div className="space-y-10">
              <div className="bg-white border rounded-xl shadow-md p-6">
                <SectionHeader icon="/images/case_details.png" title="Reports" />
                {reportsList.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No reports available.</p>
                ) : (
                  reportsList.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => {
                        setSelectedReport(report);
                        setShowReportModal(true);
                      }}
                      className="bg-white border rounded-lg shadow-sm p-4 mt-3 cursor-pointer hover:shadow-md transition"
                    >
                      <h4
                        className={`text-md font-semibold ${report.report_type?.toLowerCase().includes("nurse")
                          ? "text-blue-600"
                          : report.report_type?.toLowerCase().includes("psychometrician")
                            ? "text-red-600"
                            : report.report_type?.toLowerCase().includes("social worker")
                              ? "text-yellow-500"
                              : "text-[#292D96]"
                          }`}
                      >
                        {report.report_type} Report —{" "}
                        {new Date(report.report_month).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Prepared by: {report.prepared_by_name}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {showReportModal && selectedReport && (
                <Modal title="View Report" onClose={() => setShowReportModal(false)}>
                  <ReportModal
                    report={selectedReport}
                    userRole="DSWD" // admin, view-only
                    onClose={() => setShowReportModal(false)}
                  />
                </Modal>
              )}
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-end mt-10">
            <Link
              to="/dswd/victims"
              className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
            >
              ← Back to List
            </Link>
          </div>
        </div>

        {/* Case Modal */}
        {showCaseModal && selectedIncident && (
          <CaseTreeModal
            selectedIncident={selectedIncident}
            onClose={() => {
              setShowCaseModal(false);
              setSelectedIncident(null);
            }}
          />
        )}

        {/* Session Modal */}
        {selectedSessionId && (
          <SessionDetails
            sessionId={selectedSessionId}
            onClose={() => setSelectedSessionId(null)}
          />
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}