// src/pages/desk_officer/tabs/RegisterVictim.js
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/sideBar";
import Navbar from "../components/navBar";
import AdministrativeInfo from "../components/AdministrativeInfo";
import VictimInfo from "../components/VictimInfo";
import IncidentInfo from "../components/IncidentInfo";
import PerpetratorInfo from "../components/PerpetratorInfo";

// Point to your Django dev server
const API_BASE = "http://127.0.0.1:8000";

// Only real Victim model fields
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
    (k) => state[k] !== undefined && state[k] !== "" && state[k] !== null
  );

export default function RegisterVictim() {
  const location = useLocation();
  const victimPhotos = location.state?.victimPhotos || [];

  // Unified state passed to all child sections
  const [formDataState, setFormDataState] = useState({
    vic_first_name: "",
    vic_last_name: "",
    vic_sex: "",
  });

  const handleSubmit = async () => {
    try {
      // Required fields
      for (const k of REQUIRED_VICTIM_KEYS) {
        if (!formDataState[k]) {
          alert(`Missing required victim field: ${k}`);
          return;
        }
      }
      if (victimPhotos.length !== 3 || victimPhotos.some((p) => !p)) {
        alert("Please capture exactly 3 victim photos.");
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
        // Present DRF field errors nicely when available
        const errors = payload?.errors;
        let msg = payload?.error || "Registration failed.";
        if (errors && typeof errors === "object") {
          const lines = Object.entries(errors).map(
            ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
          );
          msg = `Registration failed:\n${lines.join("\n")}`;
        }
        console.error("Register error payload:", payload);
        alert(msg);
        return;
      }

      alert("Victim registered successfully!");
      // TODO: optionally reset state or navigate elsewhere
    } catch (err) {
      console.error("Register victim exception:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="outline-2">
      <Navbar />
      <div className="flex flex-row">
        <Sidebar />
        <div className="h-[80vh] overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
            <AdministrativeInfo
              formDataState={formDataState}
              setFormDataState={setFormDataState}
            />
            <VictimInfo
              formDataState={formDataState}
              setFormDataState={setFormDataState}
            />
            <IncidentInfo
              formDataState={formDataState}
              setFormDataState={setFormDataState}
            />
            <PerpetratorInfo
              formDataState={formDataState}
              setFormDataState={setFormDataState}
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
