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
import PsychometricianReportForm from "../../../components/PsychometricianReportForm";
import PsychometricianMonthlyReport from "../../../components/PsychometricianMonthlyReport";

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
  const [openReportsIndex, setOpenReportsIndex] = useState(null);

  // "comprehensive" or "monthly"
  const [reportType, setReportType] = useState(null);

  const [currentOfficialId, setCurrentOfficialId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const fetchMe = async () => {
    try {
      const res = await api.get("/api/me/");
      // Normalize the ID field
      setCurrentOfficialId(res.data.of_id ?? res.data.official_id);
      setUserRole(res.data.role?.toLowerCase());
    } catch (err) {
      console.error("Failed to fetch current official", err);
    }
  };

  const handleSubmitComprehensiveReport = async (data) => {
    if (!selectedIncident) {
      console.error("No incident selected, cannot submit report");
      return;
    }
    try {
      const res = await api.post(`/api/psychometrician/victims/${vic_id}/comprehensive-reports/`, {
        ...data,
        incident: selectedIncident?.incident_id,
      });
      setShowAddReportModal(false);
      await fetchReports();
      setActiveTab("reports");
      setSelectedReport(res.data);
      setShowReportModal(true);
    } catch (err) {
      console.error("Failed to submit comprehensive report", err.response?.data || err);
    }
  };

  const handleSubmitMonthlyReport = async (data) => {
    try {
      const res = await api.post(`/api/psychometrician/victims/${vic_id}/monthly-progress-reports/`, {
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
      console.error("Failed to submit monthly progress report", err.response?.data || err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const fetchReports = async () => {
    try {
      const nurseRes = await api.get(`/api/nurse/victims/${vic_id}/monthly-reports/`);
      const psychComRes = await api.get(`/api/psychometrician/victims/${vic_id}/comprehensive-reports/`);
      const psychMonthlyRes = await api.get(`/api/psychometrician/victims/${vic_id}/monthly-progress-reports/`);

      const normalize = (report, type) => ({
        ...report,
        report_type: report.report_type ?? type,
        prepared_by_id: report.prepared_by_id ?? report.prepared_by?.id ?? null,
        prepared_by_name: report.prepared_by_name ?? report.prepared_by?.full_name ?? "—",
      });

      const combined = [
        ...(Array.isArray(nurseRes.data) ? nurseRes.data.map(r => normalize(r, "Nurse")) : []),
        ...(Array.isArray(psychComRes.data) ? psychComRes.data.map(r => normalize(r, "Psychometrician Comprehensive")) : []),
        ...(Array.isArray(psychMonthlyRes.data) ? psychMonthlyRes.data.map(r => normalize(r, "Psychometrician Monthly")) : []),
      ];

      setReportsList(combined);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await api.get(`/api/psychometrician/case/${vic_id}/`);
      if (Array.isArray(res.data)) setIncidentList(res.data);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    }
  };

  useEffect(() => {
    const fetchVictim = async () => {
      try {
        const res = await api.get(`/api/psychometrician/victims/${vic_id}/`);
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
        <div className="flex justify-center gap-6 border-b border-gray-300 text-base font-semibold">
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

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-10">
            {/* PERSONAL INFO */}
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/id-card.png" title="Personal Info" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div><p className="text-xs text-gray-500">Sex</p><p className="font-medium">{get(victim, ["vic_sex"])}</p></div>
                <div><p className="text-xs text-gray-500">Civil Status</p><p className="font-medium">{get(victim, ["vic_civil_status"])}</p></div>
                <div><p className="text-xs text-gray-500">Birth Date</p><p className="font-medium">{get(victim, ["vic_birth_date"])}</p></div>
                <div><p className="text-xs text-gray-500">Birth Place</p><p className="font-medium">{get(victim, ["vic_birth_place"])}</p></div>
                <div><p className="text-xs text-gray-500">Religion</p><p className="font-medium">{get(victim, ["vic_religion"])}</p></div>
                <div><p className="text-xs text-gray-500">Nationality</p><p className="font-medium">{get(victim, ["vic_nationality"])}</p></div>
              </div>
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
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 mb-6">
                    <div><p className="text-xs text-gray-500">Full Name</p><p className="font-medium">{member.full_name}</p></div>
                    <div><p className="text-xs text-gray-500">Relationship</p><p className="font-medium">{member.fam_victim_relationship}</p></div>
                    <div><p className="text-xs text-gray-500">Sex</p><p className="font-medium">{member.fam_sex}</p></div>
                    <div><p className="text-xs text-gray-500">Civil Status</p><p className="font-medium">{member.fam_civil_status}</p></div>
                    <div><p className="text-xs text-gray-500">Educational Attainment</p><p className="font-medium">{member.fam_educational_attainment}</p></div>
                    <div><p className="text-xs text-gray-500">Occupation</p><p className="font-medium">{member.fam_occupation}</p></div>
                    <div><p className="text-xs text-gray-500">Income</p><p className="font-medium">{member.fam_income}</p></div>
                    <div><p className="text-xs text-gray-500">Birth Date</p><p className="font-medium">{member.fam_birth_date}</p></div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No family member information available.</p>
              )}
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
                  <div key={incident.incident_id} className="border rounded-md p-4 shadow-sm bg-gray-50 mb-6">
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
                          navigate(`/psychometrician/more-sessions/create/${incident.incident_id}`)
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

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-10">
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/case_details.png" title="Reports" />
              {incidentList.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No case records found for this victim.</p>
              ) : (
                incidentList.map((incident, index) => {
                  const incidentReports = reportsList.filter((r) => r.incident === incident.incident_id);
                  return (
                    <div key={incident.incident_id} className="border rounded-md p-4 shadow-sm bg-gray-50 mb-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-700">
                        <div>
                          <span className="font-medium text-gray-800">Case No:</span>{" "}
                          {incident.incident_num || "—"}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const isSame = openReportsIndex === index;
                              setOpenReportsIndex(isSame ? null : index);
                              setSelectedIncident(incident);
                            }}
                            className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-3 py-1.5 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
                          >
                            {openReportsIndex === index ? "Hide Reports" : "View Reports"}
                          </button>

                          {/* Add Report */}
                          <div className="flex gap-3">
                            <button
                              disabled={!incident}
                              onClick={() => {
                                setShowReportModal(false);
                                setSelectedIncident(incident);
                                setSelectedReport(null);
                                setReportType("comprehensive");
                                setShowAddReportModal(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-md border border-blue-600 text-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-600 hover:text-white transition"
                            >
                              + Add Comprehensive Report
                            </button>

                            <button
                              onClick={() => {
                                setShowReportModal(false);
                                setSelectedIncident(incident);
                                setSelectedReport(null);
                                setReportType("monthly");
                                setShowAddReportModal(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-md border border-green-600 text-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-600 hover:text-white transition"
                            >
                              + Add Monthly Progress Report
                            </button>
                          </div>
                        </div>
                      </div>

                      {openReportsIndex === index && (
                        <div className="mt-3">
                          {incidentReports.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No reports available yet.</p>
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
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-md font-semibold text-[#292D96]">
                                    {report.report_type} Report —{" "}
                                    {new Date(report.report_month).toLocaleDateString("en-US", {
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </h4>
                                </div>
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
                  userRole={userRole}                 // ✅ now ReportModal knows the role
                  currentOfficialId={currentOfficialId}
                  onClose={() => setShowReportModal(false)}
                  onEdit={() => {
                    setShowReportModal(false);
                    setSelectedReport(selectedReport);

                    if (selectedReport.reason_for_referral) {
                      // Comprehensive Psychometrician Report
                      setReportType("comprehensive");
                    } else if (selectedReport.presentation) {
                      // Monthly Psychometrician Progress Report
                      setReportType("monthly");
                    }

                    setShowAddReportModal(true);
                  }}
                />
              </Modal>
            )}

            {/* Add Report Modal */}
            {showAddReportModal && !showReportModal && (
              <Modal onClose={() => setShowAddReportModal(false)}>
                {reportType === "comprehensive" ? (
                  <PsychometricianReportForm
                    victim={victim}
                    incident={selectedIncident}
                    onSubmit={handleSubmitComprehensiveReport}
                    onClose={() => setShowAddReportModal(false)}
                  />
                ) : (
                  <PsychometricianMonthlyReport
                    victim={victim}
                    incident={selectedIncident}
                    onSubmit={handleSubmitMonthlyReport}
                    onClose={() => setShowAddReportModal(false)}
                  />
                )}
              </Modal>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-end mt-10">
          <Link
            to="/psychometrician/victims"
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