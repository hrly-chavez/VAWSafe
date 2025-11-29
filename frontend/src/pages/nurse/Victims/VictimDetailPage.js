// src/pages/nurse/Victims/VictimDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../Navbar";
import api from "../../../api/axios";
import VictimCases from "./VictimCases";
import SessionDetails from "./SessionDetails";
import SessionCard from "./SessionCard";
import SectionHeader from "../../../components/SectionHeader";
import ReportModal from "../../../components/ReportModal";
import Modal from "../../../components/Modal";
import NurseReportForm from "../../../components/NurseReportForm";

export default function VictimDetailPage() {
  const { vic_id } = useParams();
  const [victim, setVictim] = useState(null);
  const [incidentList, setIncidentList] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);
  const [openSessionIndex, setOpenSessionIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const navigate = useNavigate();

  const [reportsList, setReportsList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);

  const userRole = "Nurse";

  // ✅ Only nurse report submission
  const handleSubmitNurseReport = async (data) => {
    try {
      const res = await api.post(`/api/nurse/victims/${vic_id}/monthly-reports/`, {
        ...data,
        incident: selectedIncident?.incident_id,
        report_month: new Date().toISOString().split("T")[0],
      });

      setShowAddReportModal(false);
      await fetchReports();
      setActiveTab("reports");
      setSelectedReport(res.data);
      setShowReportModal(true);
    } catch (err) {
      console.error("Failed to submit nurse report", err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  // ✅ Fetch all reports
  const fetchReports = async () => {
    try {
      let nurseData = [];
      let psychComData = [];
      let psychMonthlyData = [];

      try {
        const nurseRes = await api.get(`/api/nurse/victims/${vic_id}/monthly-reports/`);
        nurseData = Array.isArray(nurseRes.data) ? nurseRes.data : [];
      } catch (err) {
        console.error("Failed to fetch nurse reports", err);
      }

      try {
        const psychComRes = await api.get(`/api/nurse/victims/${vic_id}/psych-comprehensive-reports/`);
        psychComData = Array.isArray(psychComRes.data) ? psychComRes.data : [];
      } catch (err) {
        console.error("Failed to fetch psychometrician comprehensive reports", err);
      }

      try {
        const psychMonthlyRes = await api.get(`/api/nurse/victims/${vic_id}/psych-monthly-progress-reports/`);
        psychMonthlyData = Array.isArray(psychMonthlyRes.data) ? psychMonthlyRes.data : [];
      } catch (err) {
        console.error("Failed to fetch psychometrician monthly progress reports", err);
      }

      const normalize = (report, type) => ({
        ...report,
        report_type: report.report_type ?? type,
        prepared_by_id: report.prepared_by_id ?? report.prepared_by?.id ?? null,
        prepared_by_name: report.prepared_by_name ?? report.prepared_by?.full_name ?? "—",
        incident: report.incident?.id ?? report.incident ?? null,
      });

      const combined = [
        ...nurseData.map(r => normalize(r, "Nurse")),
        ...psychComData.map(r => normalize(r, "Psychometrician Comprehensive")),
        ...psychMonthlyData.map(r => normalize(r, "Psychometrician Monthly")),
      ];

      // Sort by report_month descending (true chronological order)
      combined.sort((a, b) => new Date(b.report_month) - new Date(a.report_month));

      setReportsList(combined);
    } catch (err) {
      console.error("Unexpected error in fetchReports", err);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await api.get(`/api/nurse/case/${vic_id}/`);
      if (Array.isArray(res.data)) setIncidentList(res.data);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    }
  };

  useEffect(() => {
    const fetchVictim = async () => {
      try {
        const res = await api.get(`/api/nurse/victims/${vic_id}/`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setVictim(data || null);
      } catch (err) {
        setError(err?.response?.status ? `Error ${err.response.status}` : "Request failed");
      } finally {
        setLoading(false);
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
      if (obj && obj[k] != null && obj[k] !== "") return obj[k];
    }
    return fallback;
  };

  const fullName = victim
    ? [
      get(victim, ["vic_first_name"]),
      get(victim, ["vic_middle_name"]),
      get(victim, ["vic_last_name"]),
      get(victim, ["vic_extension"]),
    ].filter(Boolean).join(" ")
    : "";

  if (loading) return <p>Loading victim details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!victim) return <p>No victim data found.</p>;

  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />

      <div className="px-6 py-10 max-w-screen-lg mx-auto space-y-10">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <img
            src={get(victim, ["vic_photo"], "")}
            alt="Victim"
            className="h-[220px] w-[220px] object-cover rounded-full border-4 border-white shadow-xl"
          />
        </div>

        {/* Name + ID */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#292D96]">{fullName}</h2>
          <p className="text-sm text-gray-500 mt-1">Victim ID: {get(victim, ["vic_id"])}</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-6 border-b border-gray-300 text-sm font-medium">
          {["details", "case", "reports"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 transition ${activeTab === tab
                ? "border-b-2 border-[#292D96] text-[#292D96]"
                : "text-gray-500 hover:text-[#292D96]"
                }`}
            >
              {tab === "details" ? "Details" : tab === "case" ? "Case Details" : "Reports"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-10">
            {/* PERSONAL INFO */}
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/id-card.png" title="Personal Info" />

              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Sex</p>
                  <p className="font-medium">{get(victim, ["vic_sex"])}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Civil Status</p>
                  <p className="font-medium">{get(victim, ["vic_civil_status"])}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Birth Date</p>
                  <p className="font-medium">{get(victim, ["vic_birth_date"])}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Birth Place</p>
                  <p className="font-medium">{get(victim, ["vic_birth_place"])}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Religion</p>
                  <p className="font-medium">{get(victim, ["vic_religion"])}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nationality</p>
                  <p className="font-medium">{get(victim, ["vic_nationality"])}</p>
                </div>
              </div>

              {/* Single-column fields */}
              <div className="mt-6 text-sm text-gray-700">
                <p className="text-xs text-gray-500">Contact Number</p>
                <p className="font-medium">{get(victim, ["vic_contact_number"])}</p>
              </div>
              <div className="mt-6 text-sm text-gray-700">
                <p className="text-xs text-gray-500">Provincial Address</p>
                <p className="font-medium">{get(victim, ["vic_provincial_address"])}</p>
              </div>
              <div className="mt-6 text-sm text-gray-700">
                <p className="text-xs text-gray-500">Current Address</p>
                <p className="text-sm font-medium text-gray-800 bg-gray-50 border rounded-md p-3 whitespace-pre-wrap break-words">
                  {get(victim, ["vic_current_address"], "—")}
                </p>
              </div>
            </div>

            {/* EXPERIENCE */}
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/portfolio.png" title="Experience" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Occupation</p>
                  <p className="font-medium">{get(victim, ["vic_occupation"])}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monthly Income</p>
                  <p className="font-medium">
                    {victim?.vic_income ? `₱${parseFloat(victim.vic_income).toLocaleString()}` : "—"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Skills</p>
                  <p className="font-medium">{get(victim, ["vic_skills"])}</p>
                </div>
              </div>
            </div>

            {/* EDUCATION */}
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/graduation.png" title="Education" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Educational Attainment</p>
                  <p className="font-medium">{get(victim, ["vic_educational_attainment"])}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last School Attended</p>
                  <p className="font-medium">{get(victim, ["vic_last_school_attended"])}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">School Address</p>
                  <p className="font-medium">{get(victim, ["vic_last_school_address"])}</p>
                </div>
              </div>
            </div>

            {/* CONTACT PERSON */}
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/contact_member.png" title="Contact Person" />

              {victim.contact_persons?.length > 0 ? (
                victim.contact_persons.map((person, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">{person.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Relationship</p>
                      <p className="font-medium">{person.cont_victim_relationship}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Contact Number</p>
                      <p className="font-medium">{person.cont_contact_number}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No contact person information available.</p>
              )}
            </div>

            {/* FAMILY MEMBERS */}
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/family.png" title="Family Members" />

              {victim.family_members?.length > 0 ? (
                victim.family_members.map((member, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 mb-6"
                  >
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium">{member.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Relationship</p>
                      <p className="font-medium">{member.fam_victim_relationship}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sex</p>
                      <p className="font-medium">{member.fam_sex}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Civil Status</p>
                      <p className="font-medium">{member.fam_civil_status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Educational Attainment</p>
                      <p className="font-medium">{member.fam_educational_attainment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Occupation</p>
                      <p className="font-medium">{member.fam_occupation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Income</p>
                      <p className="font-medium">{member.fam_income}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Birth Date</p>
                      <p className="font-medium">{member.fam_birth_date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No family member information available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "case" && (
          <div className="space-y-10">
            {/* Case Information Header */}
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
                            setShowModal(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-3 py-1.5 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
                        >
                          View Case Details
                        </button>
                        <button
                          onClick={() => {
                            const isSame = openSessionIndex === index;
                            setOpenSessionIndex(isSame ? null : index);
                            setSelectedSessionIndex(null);
                          }}
                          className="inline-flex items-center gap-2 rounded-md border border-green-600 text-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-600 hover:text-white transition"
                        >
                          {openSessionIndex === index ? "Hide Sessions" : "View Sessions"}
                        </button>
                      </div>
                    </div>

                    {openSessionIndex === index && (
                      <SessionCard
                        incident={incident}
                        onSelectSession={(id) => setSelectedSessionIndex(id)}
                        onCreateSession={() =>
                          navigate(`/nurse/more-sessions/create/${incident.incident_id}`)
                        }
                        navigate={navigate}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-10">
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/case_details.png" title="Reports" />

              {incidentList.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No case records found for this victim.
                </p>
              ) : (
                incidentList.map((incident, index) => {
                  const incidentReports = reportsList.filter(
                    (r) => r.incident === incident.incident_id
                  );

                  const isOpen = openSessionIndex === index; // reuse or create a new state like openReportsIndex

                  return (
                    <div
                      key={incident.incident_id}
                      className="border rounded-md p-4 shadow-sm bg-gray-50 mb-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-700">
                        <div>
                          <span className="font-medium text-gray-800">Case No:</span>{" "}
                          {incident.incident_num || "—"}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const isSame = openSessionIndex === index;
                              setOpenSessionIndex(isSame ? null : index);
                              setSelectedIncident(incident);
                            }}
                            className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-3 py-1.5 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
                          >
                            {isOpen ? "Hide Reports" : "View Reports"}
                          </button>
                          {userRole && (
                            <button
                              onClick={() => {
                                setShowReportModal(false);
                                setSelectedIncident(incident);
                                setSelectedReport(null);
                                setShowAddReportModal(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-md border border-green-600 text-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-600 hover:text-white transition"
                            >
                              + Add Monthly Report
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reports list for this incident */}
                      {isOpen && (
                        <div className="mt-3">
                          {incidentReports.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                              No reports available yet.
                            </p>
                          ) : (
                            incidentReports.map((report) => (
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
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Report Modal */}
            {showReportModal && !showAddReportModal && selectedReport && (
              <Modal title="View Report" onClose={() => setShowReportModal(false)}>
                <ReportModal
                  report={selectedReport}
                  userRole={userRole}
                  onClose={() => setShowReportModal(false)}
                />
              </Modal>
            )}

            {/* Add Report Modal */}
            {showAddReportModal && !showReportModal && (
              <Modal onClose={() => setShowAddReportModal(false)}>
                <NurseReportForm
                  victim={victim}
                  incident={selectedIncident}
                  onSubmit={handleSubmitNurseReport}
                  onClose={() => setShowAddReportModal(false)}
                />
              </Modal>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-end mt-10">
          <Link
            to="/nurse/victims"
            className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
          >
            ← Back to List
          </Link>
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedIncident && (
        <VictimCases
          selectedIncident={selectedIncident}
          onClose={() => {
            setShowModal(false);
            setSelectedIncident(null);
          }}
        />
      )}
      {selectedSessionIndex && (
        <SessionDetails
          sessionId={selectedSessionIndex}
          onClose={() => setSelectedSessionIndex(null)}
          onSessionCompleted={() => fetchIncidents()}
        />
      )}
    </div>
  );
}