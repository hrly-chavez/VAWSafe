// frontend/src/pages/desk_officer/RegisterVictim/RegisterVictim.js
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navBar";
import Sidebar from "../sideBar";
import AdministrativeInfo from "./AdministrativeInfo";
import VictimInfo from "./VictimInfo";
import IncidentInfo from "./IncidentInfo";
import PerpetratorInfo from "./PerpetratorInfo";

const API_BASE = "http://127.0.0.1:8000";

// Victim, case, incident, and perpetrator fields
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

// Utility
const hasAny = (state, keys) =>
  keys.some((key) => state[key] !== undefined && state[key] !== "" && state[key] !== null);

export default function RegisterVictim() {
  const navigate = useNavigate();
  const location = useLocation();
  const victimPhotos = location.state?.victimPhotos || [];

  const [currentStep, setCurrentStep] = useState(1);
  const [formDataState, setFormDataState] = useState({
    vic_first_name: "",
    vic_last_name: "",
    vic_sex: "",
  });
  const [openSections, setOpenSections] = useState({
    adminInfo: false,
    victimInfo: false,
    incidentInfo: false,
    perpInfo: false,
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const cancel = () => {
    alert("Form cancelled!");
    navigate("/desk_officer/");
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setStatusMessage("⏳ Processing registration...");

      // Required fields
      for (const k of REQUIRED_VICTIM_KEYS) {
        if (!formDataState[k]) {
          setStatusMessage(` Missing required victim field: ${k}`);
          setLoading(false);
          return;
        }
      }
      if (victimPhotos.length !== 3 || victimPhotos.some((p) => !p)) {
        setStatusMessage(" Please capture exactly 3 victim photos.");
        setLoading(false);
        return;
      }

      // Victim payload (only include filled fields)
      const victimPayload = {};
      VICTIM_FIELDS.forEach((k) => {
        const v = formDataState[k];
        if (v !== undefined && v !== null && v !== "") {
          victimPayload[k] = v;
        }
      });

      // Optional sections (only include if something was filled)
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

      // Build multipart form-data for the unified endpoint
      const fd = new FormData();
      fd.append("victim", JSON.stringify(victimPayload));
      if (caseReportPayload)
        fd.append("case_report", JSON.stringify(caseReportPayload));
      if (incidentPayload)
        fd.append("incident", JSON.stringify(incidentPayload));
      if (perpetratorPayload)
        fd.append("perpetrator", JSON.stringify(perpetratorPayload));
      victimPhotos.forEach((file) => fd.append("photos", file));

      const res = await fetch(
        `${API_BASE}/api/desk_officer/victims/register/`,
        {
          method: "POST",
          body: fd, // don't set Content-Type manually
        }
      );

      // Parse JSON if possible, otherwise keep raw response for debugging
      const raw = await res.text();
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { raw };
      }

      if (!res.ok || payload?.success === false) {
        const errors = payload?.errors;
        let msg = payload?.error || " Registration failed.";

        if (errors && typeof errors === "object") {
          const lines = Object.entries(errors).map(
            ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
          );
          msg = ` Registration failed:\n${lines.join("\n")}`;
        }
        console.error("Register error payload:", payload);
        setStatusMessage(msg);
        setLoading(false);
        return;
      }

      setStatusMessage(" Victim registered successfully!");
      setLoading(false);
      navigate("/desk_officer/session");
    } catch (err) {
      console.error("Register victim exception:", err);
      setStatusMessage(" Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-row">
        <Sidebar />
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

            {/* Administrative Info */}
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

            {/* Perpetrator Info */}
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

            {/* Incident Report */}
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

            {/* Status message */}
            {statusMessage && (
              <div className="mt-4 p-3 rounded text-sm bg-yellow-100 text-yellow-800">
                {statusMessage}
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancel}
                className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
              >
                CANCEL FORM
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-5 py-2 rounded text-white font-semibold transition ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Submitting..." : "SUBMIT FORM"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
