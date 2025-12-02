// src/pages/psychometrician/VictimDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import VictimCases from "./VictimCases";
import SessionDetails from "./SessionDetails";
import SessionCard from "./SessionCard";
import Modal from "../../../components/Modal";
import ReportModal from "../../../components/ReportModal";
import PsychometricianReportForm from "../../../components/PsychometricianReportForm";
import PsychometricianMonthlyReport from "../../../components/PsychometricianMonthlyReport";

import {
  GlobeAltIcon,
  UserIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  PhoneIcon,
  MapPinIcon,
  HomeIcon,
  FlagIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ClockIcon,
  BookOpenIcon,
  TrophyIcon,
  SparklesIcon,
  CogIcon,
} from "@heroicons/react/24/solid";

const iconMap = {
  // Personal Info
  "Full Name": <UserIcon className="h-4 w-4 text-gray-500" />,
  Sex: <UserIcon className="h-4 w-4 text-gray-500" />,
  "Birth Date": <CalendarIcon className="h-4 w-4 text-gray-500" />,
  "Birth Place": <MapPinIcon className="h-4 w-4 text-gray-500" />,
  "Civil Status": <BuildingLibraryIcon className="h-4 w-4 text-gray-500" />,
  Religion: <GlobeAltIcon className="h-4 w-4 text-gray-500" />,
  Nationality: <FlagIcon className="h-4 w-4 text-gray-500" />,
  "Contact Number": <PhoneIcon className="h-4 w-4 text-gray-500" />,
  "Current Address": <HomeIcon className="h-4 w-4 text-gray-500" />,
  "Provincial Address": <HomeIcon className="h-4 w-4 text-gray-500" />,
  "Work Address": <BriefcaseIcon className="h-4 w-4 text-gray-500" />,

  // Education
  "Educational Attainment": <AcademicCapIcon className="h-4 w-4 text-gray-500" />,
  "Last School Attended": <BuildingLibraryIcon className="h-4 w-4 text-gray-500" />,
  "School Address": <MapPinIcon className="h-4 w-4 text-gray-500" />,
  "School Type": <BuildingLibraryIcon className="h-4 w-4 text-gray-500" />,
  "School Years": <CalendarIcon className="h-4 w-4 text-gray-500" />,
  "Subject Interest": <BookOpenIcon className="h-4 w-4 text-gray-500" />,
  Honors: <TrophyIcon className="h-4 w-4 text-gray-500" />,
  Hobbies: <SparklesIcon className="h-4 w-4 text-gray-500" />,
  "Vocational Interest": <CogIcon className="h-4 w-4 text-gray-500" />,

  // Experience / Skills / Training
  Occupation: <BriefcaseIcon className="h-4 w-4 text-gray-500" />,
  "Monthly Income": <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />,
  Skills: <WrenchScrewdriverIcon className="h-4 w-4 text-gray-500" />,
  "Previous Skills": <WrenchScrewdriverIcon className="h-4 w-4 text-gray-500" />,
  "Type of Training": <AcademicCapIcon className="h-4 w-4 text-gray-500" />,
  "Training Location": <MapPinIcon className="h-4 w-4 text-gray-500" />,
  "Training Time": <ClockIcon className="h-4 w-4 text-gray-500" />,
  "Employment Experience": <BriefcaseIcon className="h-4 w-4 text-gray-500" />,

  // Contact Person
  Relationship: <UserGroupIcon className="h-4 w-4 text-gray-500" />,
  "Contact Number (Contact Person)": <PhoneIcon className="h-4 w-4 text-gray-500" />,

  // Family Members
  Income: <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />,
};

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
  const [openRole, setOpenRole] = useState(null);

  const [reportType, setReportType] = useState(null);
  const [currentOfficialId, setCurrentOfficialId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const groupedReports = {
    "Social Worker": reportsList.filter(r => r.report_type?.toLowerCase().includes("social worker")),
    "Nurse": reportsList.filter(r => r.report_type?.toLowerCase().includes("nurse")),
    "Psychometrician": reportsList.filter(r => r.report_type?.toLowerCase().includes("psychometrician")),
  };

  const roleColors = {
    "Social Worker": "border-yellow-400 bg-yellow-50",
    Nurse: "border-blue-400 bg-blue-50",
    Psychometrician: "border-red-400 bg-red-50",
  };

  // Helpers
  const get = (obj, keys, fallback = "—") => {
    for (const k of keys) {
      if (obj && obj[k] != null && obj[k] !== "") return obj[k];
    }
    return fallback;
  };

  // Fetch incidents
  const fetchIncidents = async () => {
    try {
      const res = await api.get(`/api/psychometrician/case/${vic_id}/`);
      if (Array.isArray(res.data)) setIncidentList(res.data);
    } catch (err) {
      console.error("Failed to fetch incidents", err);
    }
  };

  // Fetch reports
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

      combined.sort((a, b) => new Date(b.report_month) - new Date(a.report_month));
      setReportsList(combined);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  // Submit handlers
  const handleSubmitComprehensiveReport = async (data) => {
    if (!selectedIncident) return;
    try {
      await api.post(`/api/psychometrician/victims/${vic_id}/comprehensive-reports/`, {
        ...data,
        incident: selectedIncident?.incident_id,
      });
      await fetchReports();
      setShowAddReportModal(false);
      setActiveTab("reports");
    } catch (err) {
      console.error("Failed to submit comprehensive report", err.response?.data || err);
    }
  };

  const handleSubmitMonthlyReport = async (data) => {
    try {
      await api.post(`/api/psychometrician/victims/${vic_id}/monthly-progress-reports/`, {
        ...data,
        incident: selectedIncident?.incident_id,
        report_month: new Date().toISOString().split("T")[0],
      });
      await fetchReports();
      setOpenReportsIndex(
        incidentList.findIndex(i => i.incident_id === selectedIncident.incident_id)
      );
      setShowAddReportModal(false);
      setActiveTab("reports");
    } catch (err) {
      console.error("Failed to submit monthly progress report", err.response?.data || err);
    }
  };

  // Initial load
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
    <div className="min-h-screen p-4 sm:p-8 flex justify-center bg-gray-100 font-inter">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        {/* Victim Profile Header */}
        <header className="h-24 rounded-t-xl bg-[#292D96]"></header>

        {/* Profile Section */}
        <section className="px-6 md:px-8 flex flex-row items-start gap-6">
          <div className="-mt-16">
            <img
              src={get(victim, ["vic_photo"], "")}
              alt="Victim"
              className="w-40 h-40 rounded-full border-4 border-white bg-gray-200 object-cover shadow-lg"
            />
          </div>
          <div className="mt-2 flex flex-col justify-center">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{fullName}</h1>
              <span className="inline-block px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                Registered Victim
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Victim Code: {get(victim, ["code"])}
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div className="px-6 md:px-8 mt-8">
          <div className="flex border-b border-gray-300 bg-white">
            {["details", "case", "reports"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-sm font-semibold rounded-t-md transition-colors duration-200 ${isActive
                    ? "bg-[#292D96] text-white border border-gray-300 border-b-0"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#292D96] border border-gray-300"
                    }`}
                >
                  {tab === "details" && "Details"}
                  {tab === "case" && "Case Details"}
                  {tab === "reports" && "Reports"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details Tab */}
        <div className="px-6 md:px-8 bg-white rounded-b-md">
          {activeTab === "details" && (
            <div className="space-y-8 pt-4">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                {/* Title bar with gray background */}
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Personal Information
                  </h2>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm p-6">
                  <Info
                    label="Sex"
                    value={get(victim, ["vic_sex"])}
                    icon={<UserIcon className="h-4 w-4 text-gray-500" />}
                  />
                  <Info
                    label="Civil Status"
                    value={get(victim, ["vic_civil_status"])}
                    icon={
                      <BuildingLibraryIcon className="h-4 w-4 text-gray-500" />
                    }
                  />
                  <Info
                    label="Birth Date"
                    value={get(victim, ["vic_birth_date"])}
                    icon={<CalendarIcon className="h-4 w-4 text-gray-500" />}
                  />
                  <Info
                    label="Birth Place"
                    value={get(victim, ["vic_birth_place"])}
                    icon={<MapPinIcon className="h-4 w-4 text-gray-500" />}
                  />
                  <Info
                    label="Religion"
                    value={get(victim, ["vic_religion"])}
                    icon={<GlobeAltIcon className="h-4 w-4 text-gray-500" />}
                  />
                  <Info
                    label="Nationality"
                    value={get(victim, ["vic_nationality"])}
                    icon={<FlagIcon className="h-4 w-4 text-gray-500" />}
                  />
                  <Info
                    label="Contact Number"
                    value={get(victim, ["vic_contact_number"])}
                    icon={<PhoneIcon className="h-4 w-4 text-gray-500" />}
                  />
                  <Info
                    label="Current Address"
                    value={get(victim, ["vic_current_address"])}
                    icon={<HomeIcon className="h-4 w-4 text-gray-500" />}
                  />
                  <Info
                    label="Provincial Address"
                    value={get(victim, ["vic_provincial_address"])}
                    icon={<HomeIcon className="h-4 w-4 text-gray-500" />}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Experience
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm p-6">
                  <Info
                    label="Occupation"
                    value={get(victim, ["vic_occupation"])}
                    icon={iconMap["Occupation"]}
                  />
                  <Info
                    label="Monthly Income"
                    value={
                      victim?.vic_income
                        ? `₱${parseFloat(victim.vic_income).toLocaleString()}`
                        : "—"
                    }
                    icon={iconMap["Monthly Income"]}
                  />
                  <Info
                    label="Skills"
                    value={get(victim, ["vic_skills"])}
                    icon={iconMap["Skills"]}
                  />
                  <Info
                    label="Previous Skills"
                    value={get(victim, ["previous_skills"])}
                    icon={iconMap["Previous Skills"]}
                  />
                  <Info
                    label="Type of Training"
                    value={get(victim, ["type_of_training"])}
                    icon={iconMap["Type of Training"]}
                  />
                  <Info
                    label="Training Location"
                    value={get(victim, ["training_where"])}
                    icon={iconMap["Training Location"]}
                  />
                  <Info
                    label="Training Time"
                    value={get(victim, ["training_when"])}
                    icon={iconMap["Training Time"]}
                  />
                  <Info
                    label="Employment Experience"
                    value={get(victim, ["employment_experience"])}
                    icon={iconMap["Employment Experience"]}
                  />
                </div>
              </div>

              {/* Education */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Education
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm p-6">
                  <Info
                    label="Educational Attainment"
                    value={get(victim, ["vic_educational_attainment"])}
                    icon={iconMap["Educational Attainment"]}
                  />
                  <Info
                    label="Last School Attended"
                    value={get(victim, ["vic_last_school_attended"])}
                    icon={iconMap["Last School Attended"]}
                  />
                  <Info
                    label="School Address"
                    value={get(victim, ["vic_last_school_address"])}
                    icon={iconMap["School Address"]}
                  />
                  <Info
                    label="School Type"
                    value={get(victim, ["vic_school_type"])}
                    icon={iconMap["School Type"]}
                  />
                  <Info
                    label="School Years"
                    value={get(victim, ["vic_school_years"])}
                    icon={iconMap["School Years"]}
                  />
                  <Info
                    label="Subject Interest"
                    value={get(victim, ["subject_interest"])}
                    icon={iconMap["Subject Interest"]}
                  />
                  <Info
                    label="Honors"
                    value={get(victim, ["honors"])}
                    icon={iconMap["Honors"]}
                  />
                  <Info
                    label="Hobbies"
                    value={get(victim, ["hobbies"])}
                    icon={iconMap["Hobbies"]}
                  />
                  <Info
                    label="Vocational Interest"
                    value={get(victim, ["vocational_interest"])}
                    icon={iconMap["Vocational Interest"]}
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">Contact Person</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm p-6">
                  {victim.contact_persons?.length > 0 ? (
                    victim.contact_persons.map((person, index) => (
                      <React.Fragment key={index}>
                        <Info label="Full Name" value={person.full_name} icon={iconMap["Full Name"]} />
                        <Info label="Relationship" value={person.cont_victim_relationship} icon={iconMap["Relationship"]} />
                        <Info label="Contact Number" value={person.cont_contact_number} icon={iconMap["Contact Number (Contact Person)"]} />
                        <Info label="Birth Date" value={person.cont_birth_date} icon={iconMap["Birth Date"]} />
                        <Info label="Birth Place" value={person.cont_birth_place} icon={iconMap["Birth Place"]} />
                        <Info label="Civil Status" value={person.cont_civil_status} icon={iconMap["Civil Status"]} />
                        <Info label="Provincial Address" value={person.cont_prov_address} icon={iconMap["Provincial Address"]} />
                        <Info label="Sex" value={person.cont_sex} icon={iconMap["Sex"]} />
                        <Info label="Work Address" value={person.cont_work_address} icon={iconMap["Work Address"]} />
                      </React.Fragment>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No contact person information available.
                    </p>
                  )}
                </div>
              </div>

              {/* Family Members */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">Family Members</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm p-6">
                  {victim.family_members?.length > 0 ? (
                    victim.family_members.map((member, index) => (
                      <React.Fragment key={index}>
                        <Info label="Full Name" value={member.full_name} icon={iconMap["Full Name"]} />
                        <Info label="Relationship" value={member.fam_victim_relationship} icon={iconMap["Relationship"]} />
                        <Info label="Sex" value={member.fam_sex} icon={iconMap["Sex"]} />
                        <Info label="Civil Status" value={member.fam_civil_status} icon={iconMap["Civil Status"]} />
                        <Info label="Educational Attainment" value={member.fam_educational_attainment} icon={iconMap["Educational Attainment"]} />
                        <Info label="Occupation" value={member.fam_occupation} icon={iconMap["Occupation"]} />
                        <Info label="Income" value={member.fam_income} icon={iconMap["Income"]} />
                        <Info label="Birth Date" value={member.fam_birth_date} icon={iconMap["Birth Date"]} />
                      </React.Fragment>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No family member information available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Case Tab */}
          {activeTab === "case" && (
            <div className="space-y-8 pt-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                {/* Title bar with gray background */}
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Case Information
                  </h2>
                </div>

                {/* Content */}
                <div className="p-6">
                  {incidentList.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No case records found for this victim.
                    </p>
                  ) : (
                    incidentList.map((incident, index) => (
                      <div
                        key={index}
                        className="border rounded-md p-4 shadow-sm bg-white mb-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-700">
                          <div>
                            <span className="font-medium text-gray-800">
                              Case No:
                            </span>{" "}
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
                              {openSessionIndex === index
                                ? "Hide Sessions"
                                : "View Sessions"}
                            </button>
                          </div>
                        </div>

                        {/* Sessions inline list */}
                        {openSessionIndex === index && (
                          <SessionCard
                            incident={incident}
                            onSelectSession={(id) =>
                              setSelectedSessionIndex(id)
                            }
                            onCreateSession={() =>
                              navigate(
                                `/psychometrician/more-sessions/create/${incident.incident_id}`
                              )
                            }
                            navigate={navigate}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-10">
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
                        <div className="mt-3 space-y-6">
                          {["Social Worker", "Nurse", "Psychometrician"].map((role) => {
                            const roleReports = incidentReports.filter(r =>
                              r.report_type?.toLowerCase().includes(role.toLowerCase())
                            );
                            return (
                              <div key={role} className="border rounded-md overflow-hidden">
                                {/* Dropdown header */}
                                <button
                                  onClick={() => setOpenRole(openRole === role ? null : role)}
                                  className={`w-full flex justify-between items-center font-semibold px-6 py-4 text-base ${roleColors[role]}`}
                                >
                                  <span>{role} Reports</span>
                                  <span>{openRole === role ? "−" : "+"}</span>
                                </button>

                                {/* Dropdown content */}
                                {openRole === role && (
                                  <div className="bg-white px-4 py-3 space-y-3">
                                    {roleReports.length === 0 ? (
                                      <p className="text-sm text-gray-500 italic">No {role} reports available.</p>
                                    ) : (
                                      roleReports.map((report) => (
                                        <div
                                          key={report.id}
                                          onClick={() => {
                                            setSelectedReport(report);
                                            setShowReportModal(true);
                                          }}
                                          className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-semibold text-gray-800">
                                              {report.report_type} —{" "}
                                              {new Date(report.report_month).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                              })}
                                            </h4>
                                          </div>
                                          <p className="text-xs text-gray-500">Prepared by: {report.prepared_by_name}</p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}


              {/* Report Modal */}
              {showReportModal && !showAddReportModal && selectedReport && (
                <Modal title="View Report" onClose={() => setShowReportModal(false)}>
                  <ReportModal
                    report={selectedReport}
                    userRole={userRole}
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

          {/* Back Button at the bottom */}
          <div className="flex justify-end mt-10 px-6 md:px-8 mb-8">
            <Link
              to="/psychometrician/victims"
              className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Back to Victims
            </Link>
          </div>
        </div>
      </div>

      {/* Case Modal */}
      {showModal && selectedIncident && (
        <VictimCases
          selectedIncident={selectedIncident}
          onClose={() => { setShowModal(false); setSelectedIncident(null); }}
        />
      )}

      {/* Session Modal */}
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

function Info({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}

function ReportDropdown({ title, reports, autoOpen, onSelect }) {
  const [open, setOpen] = useState(autoOpen);

  return (
    <div className="mb-6 border rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 py-3 font-semibold flex items-center justify-between border-b bg-gray-100"
      >
        <span>{title} Reports</span>
        <span className="text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          {reports.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No reports available.</p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelect(report)}
                className="bg-white border rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition"
              >
                <h4 className="text-sm font-semibold text-gray-800">
                  {report.report_type} —{" "}
                  {new Date(report.report_month).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
                <p className="text-xs text-gray-500">Prepared by: {report.prepared_by_name}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}