// src/pages/desk_officer/RegisterVictim/RegisterVictim.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

// import Navbar from "../navBar";
// import Sidebar from "../sideBar";
import AdministrativeInfo from "./AdministrativeInfo";
import VictimInfo from "./VictimInfo";
import IncidentInfo from "./IncidentInfo";
import PerpetratorInfo from "./PerpetratorInfo";
import CaptureVictimFacial from "./VictimFacial";
import SchedulePage from "../Session/Schedule";

import api from "../../../api/axios";

const VICTIM_FIELDS = [
  "vic_first_name",
  "vic_middle_name",
  "vic_last_name",
  "vic_extension",
  "vic_sex",
  "vic_is_SOGIE",
  "vic_birth_date",
  "vic_birth_place",
  "vic_civil_status",
  "vic_educational_attainment",
  "vic_nationality",
  "vic_ethnicity",
  "vic_main_occupation",
  "vic_monthly_income",
  "vic_employment_status",
  "vic_migratory_status",
  "vic_religion",
  "vic_is_displaced",
  "vic_PWD_type",
  "vic_contact_number",
];

const REQUIRED_VICTIM_KEYS = ["vic_first_name", "vic_last_name", "vic_sex"];

const CASE_REPORT_KEYS = [
  "handling_org",
  "office_address",
  "report_type",
  "informant_name",
  "informant_relationship",
  "informant_contact",
];
const INCIDENT_KEYS = [
  "incident_description",
  "incident_date",
  "incident_time",
  "incident_location",
  "type_of_place",
  "is_via_electronic_means",
  "electronic_means",
  "is_conflict_area",
  "conflict_area",
  "is_calamity_area",
];
const PERP_KEYS = [
  "per_first_name",
  "per_middle_name",
  "per_last_name",
  "per_sex",
  "per_birth_date",
  "per_birth_place",
  "per_guardian_first_name",
  "per_guardian_middle_name",
  "per_guardian_last_name",
  "per_guardian_contact",
  "per_guardian_child_category",
  "per_nationality",
  "per_nationality_other",
  "per_occupation",
  "per_religion",
  "per_religion_other",
  "per_relationship_category",
  "per_relationship_detail",
  "per_actor_type",
  "per_state_actor_detail",
  "per_security_branch",
  "per_non_state_actor_detail",
];

const hasAny = (state, keys) =>
  keys.some(
    (key) =>
      state[key] !== undefined && state[key] !== "" && state[key] !== null
  );

export default function RegisterVictim() {
  const navigate = useNavigate();

  const [formDataState, setFormDataState] = useState({
    vic_first_name: "",
    vic_last_name: "",
    vic_sex: "",
    victimPhotos: [], // 👈 store photos here
  });

  const victimPhotos = formDataState.victimPhotos || [];

  const [openSections, setOpenSections] = useState({
    facialCapture: false,
    adminInfo: false,
    victimInfo: false,
    incidentInfo: false,
    perpInfo: false,
    evidenceRecords: false,
    barangayNote: false,
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSchedulePage, setShowSchedulePage] = useState(false);

  const cancel = () => {
    alert("Form cancelled!");
    navigate("/desk_officer/");
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setStatusMessage("⏳ Processing registration...");

      // Required fields
      for (const k of REQUIRED_VICTIM_KEYS) {
        if (!formDataState[k]) {
          setStatusMessage(`❌ Missing required victim field: ${k}`);
          setLoading(false);
          return;
        }
      }
      if (victimPhotos.length !== 3 || victimPhotos.some((p) => !p)) {
        setStatusMessage("❌ Please capture exactly 3 victim photos.");
        setLoading(false);
        return;
      }

      // Victim payload
      const victimPayload = {};
      VICTIM_FIELDS.forEach((k) => {
        const v = formDataState[k];
        if (v !== undefined && v !== null && v !== "") {
          victimPayload[k] = v;
        }
      });

      const caseReportPayload = hasAny(formDataState, CASE_REPORT_KEYS)
        ? Object.fromEntries(
            CASE_REPORT_KEYS.map((k) => [k, formDataState[k] ?? ""])
          )
        : null;

      const incidentPayload = hasAny(formDataState, INCIDENT_KEYS)
        ? Object.fromEntries(
            INCIDENT_KEYS.map((k) => [
              k,
              typeof formDataState[k] === "boolean"
                ? !!formDataState[k]
                : formDataState[k] ?? "",
            ])
          )
        : null;

      const perpetratorPayload = hasAny(formDataState, PERP_KEYS)
        ? Object.fromEntries(PERP_KEYS.map((k) => [k, formDataState[k] ?? ""]))
        : null;

      // Build form-data
      const fd = new FormData();
      fd.append("victim", JSON.stringify(victimPayload));
      if (caseReportPayload)
        fd.append("case_report", JSON.stringify(caseReportPayload));
      if (incidentPayload)
        fd.append("incident", JSON.stringify(incidentPayload));
      if (perpetratorPayload)
        fd.append("perpetrator", JSON.stringify(perpetratorPayload));
      victimPhotos.forEach((file) => fd.append("photos", file));

      // ✅ axios request
      const res = await api.post("/api/desk_officer/victims/register/", fd);

      if (!res.data || res.data.success === false) {
        const errors = res.data?.errors;
        let msg = res.data?.error || "❌ Registration failed.";

        if (errors && typeof errors === "object") {
          const lines = Object.entries(errors).map(
            ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
          );
          msg = `❌ Registration failed:\n${lines.join("\n")}`;
        }

        console.error("Register error payload:", res.data);
        setStatusMessage(msg);
        setLoading(false);
        return;
      }

      setStatusMessage("✅ Victim registered successfully!");
      setLoading(false);
      setShowSchedulePage(true); // 👈 show schedule after success
    } catch (err) {
      console.error("Register victim exception:", err);
      setStatusMessage("❌ Something went wrong.");
      setLoading(false);
    }
  };

  const isAnySectionOpen = Object.values(openSections).some((v) => v);

  return (
    <div className="h-[85vh] overflow-y-auto w-full p-6">
      <div className="border-2 border-blue-600 rounded-lg p-6 bg-white max-w-5xl mx-auto shadow">
        <h2 className="text-xl font-bold text-blue-800 mb-4">
          Victim Registration
        </h2>
        <div className="bg-gray-100 border rounded p-3 mb-4 text-sm">
          <strong>
            NATIONAL VIOLENCE AGAINST WOMEN (NVAW) DOCUMENTATION SYSTEM
          </strong>{" "}
          (Intake Form)
        </div>

        {/* Capture Victim Facial */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("facialCapture")}
            className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
          >
            {openSections.facialCapture ? "▼" : "▶"} Capture Victim Facial
          </button>
          {openSections.facialCapture && (
            <div className="mt-4 border-l-4 border-blue-500 pl-4">
              <CaptureVictimFacial
                victimPhotos={victimPhotos}
                setFormDataState={setFormDataState}
              />
            </div>
          )}
        </div>

        {/* Other Sections */}
        {/* Admin Info */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("adminInfo")}
            className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
          >
            {openSections.adminInfo ? "▼" : "▶"} Barangay Client Card
          </button>
          {openSections.adminInfo && (
            <div className="mt-4 border-l-4 border-blue-500 pl-4">
              <AdministrativeInfo
                formDataState={formDataState}
                setFormDataState={setFormDataState}
              />
            </div>
          )}
        </div>

        {/* Victim Info */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("victimInfo")}
            className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
          >
            {openSections.victimInfo ? "▼" : "▶"} Victim-Survivor Information
          </button>
          {openSections.victimInfo && (
            <div className="mt-4 border-l-4 border-blue-500 pl-4">
              <VictimInfo
                formDataState={formDataState}
                setFormDataState={setFormDataState}
              />
            </div>
          )}
        </div>

        {/* Perp Info */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("perpInfo")}
            className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
          >
            {openSections.perpInfo ? "▼" : "▶"} Alleged Perpetrator Information
          </button>
          {openSections.perpInfo && (
            <div className="mt-4 border-l-4 border-blue-500 pl-4">
              <PerpetratorInfo
                formDataState={formDataState}
                setFormDataState={setFormDataState}
              />
            </div>
          )}
        </div>

        {/* Incident Info */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("incidentInfo")}
            className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
          >
            {openSections.incidentInfo ? "▼" : "▶"} Incident Report
          </button>
          {openSections.incidentInfo && (
            <div className="mt-4 border-l-4 border-blue-500 pl-4">
              <IncidentInfo
                formDataState={formDataState}
                setFormDataState={setFormDataState}
              />
            </div>
          )}
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded text-sm ${
              statusMessage.startsWith("✅")
                ? "bg-green-100 text-green-800"
                : statusMessage.startsWith("⏳")
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Buttons only if section open */}
        {isAnySectionOpen && (
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={cancel}
              className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition-all"
            >
              <XCircleIcon className="h-5 w-5 text-white" />
              Cancel Form
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold shadow transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              }`}
            >
              <CheckCircleIcon className="h-5 w-5 text-white" />
              {loading ? "Submitting..." : "Submit Form"}
            </button>
          </div>
        )}
      </div>

      {/* Show schedule page after success */}
      {showSchedulePage && (
        <div className="mt-10 border-t pt-6">
          <SchedulePage embedded={true} />
        </div>
      )}
    </div>
  );
}
