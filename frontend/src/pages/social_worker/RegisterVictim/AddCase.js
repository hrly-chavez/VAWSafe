// AddCase.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";

import IncidentInfo from "./IncidentInfo";
import PerpetratorInfo from "./PerpetratorInfo";
import ContactPerson from "./ContactPerson";
import Evidences from "./Evidences";
import SchedulePage from "../Sessions/Schedule";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// imported constants
import {
  INCIDENT_KEYS,
  PERP_KEYS,
  CONTACT_PERSON_FIELDS,
} from "./helpers/form-keys";

const FIELD_LABELS = {
  incident_date: "Incident Date",
  incident_time: "Incident Time",
  violence_type: "Violence Type",

  per_first_name: "Perpetrator First Name",
  per_middle_name: "Perpetrator Middle Name",
  per_last_name: "Perpetrator Last Name",
  per_sex: "Perpetrator Sex",
  per_birth_date: "Perpetrator Birth Date",
  per_birth_place: "Perpetrator Birth Place",

  cont_birth_date: "Contact Person Birth Date",
};

const REQUIRED_INCIDENT_KEYS = [
  "violence_type",
  "incident_date",
  "incident_time",
];

const hasAny = (state, keys) =>
  keys.some(
    (key) =>
      state[key] !== undefined && state[key] !== "" && state[key] !== null
  );

export default function AddCase() {
  const location = useLocation();
  const { victim } = location.state || {};

  const [formDataState, setFormDataState] = useState({
    ...INCIDENT_KEYS.reduce((acc, k) => ({ ...acc, [k]: "" }), {}),
    ...PERP_KEYS.reduce((acc, k) => ({ ...acc, [k]: "" }), {}),
    ...CONTACT_PERSON_FIELDS.reduce((acc, k) => ({ ...acc, [k]: "" }), {}),
    evidences: [],
  });

  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [openSections, setOpenSections] = useState({
    incidentInfo: true,
    perpInfo: false,
    contactPerson: false,
    evidences: false,
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSchedulePage, setShowSchedulePage] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const navigate = useNavigate();

  const cancel = () => {
    alert("Add Case cancelled!");
    navigate(`/social_worker/victim/${victim.vic_id}`);
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setStatusMessage("⏳ Processing new case...");

      for (const k of REQUIRED_INCIDENT_KEYS) {
        if (!formDataState[k]) {
          const label = FIELD_LABELS[k] || k;
          setStatusMessage(`❌ Missing required field: ${label}`);
          setLoading(false);
          return;
        }
      }

      const incidentPayload = Object.fromEntries(
        INCIDENT_KEYS.map((k) => [k, formDataState[k] ?? ""])
      );
      incidentPayload.vic_id = victim.vic_id;

      const perpetratorPayload = hasAny(formDataState, PERP_KEYS)
        ? Object.fromEntries(PERP_KEYS.map((k) => [k, formDataState[k] ?? ""]))
        : null;

      const contactPersonPayload = hasAny(formDataState, CONTACT_PERSON_FIELDS)
        ? Object.fromEntries(
            CONTACT_PERSON_FIELDS.map((k) => [k, formDataState[k] ?? ""])
          )
        : null;

      const fd = new FormData();
      fd.append("vic_id", victim.vic_id);
      fd.append("incident", JSON.stringify(incidentPayload));
      if (perpetratorPayload)
        fd.append("perpetrator", JSON.stringify(perpetratorPayload));
      if (contactPersonPayload)
        fd.append("contact_person", JSON.stringify(contactPersonPayload));
      if (formDataState.evidences?.length) {
        evidenceFiles.forEach((f) => fd.append("evidences", f.file));
      }

      const res = await api.post("/api/social_worker/add-case/", fd);

      if (!res.data || res.data.success === false) {
        const errors = res.data?.errors;
        let msg = res.data?.error || "❌ Adding case failed.";
        if (errors && typeof errors === "object") {
          const lines = Object.entries(errors).map(
            ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
          );
          msg = ` Adding case failed:\n${lines.join("\n")}`;
        }
        setStatusMessage(msg);
        setLoading(false);
        return;
      }

      setStatusMessage("✅ Case added successfully!");
      setIsLocked(true);
      setLoading(false);

      if (evidenceFiles.length) {
        const zip = new JSZip();
        evidenceFiles.forEach((f) => {
          zip.file(f.file.name, f.file);
        });
        zip.generateAsync({ type: "blob" }).then((blob) => {
          saveAs(blob, `evidence_photos_${Date.now()}.zip`);
        });
      }

      setShowSchedulePage({
        victim,
        incident: res.data.incident,
      });
    } catch (err) {
      console.error("Add Case exception:", err);
      setStatusMessage(" Something went wrong.");
      setLoading(false);
    }
  };

  const isAnySectionOpen = Object.values(openSections).some((v) => v);

  return (
    <div className="h-[85vh] overflow-y-auto w-full p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg border border-blue-200 p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4 text-center">
          Add New Case
        </h2>

        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 mb-6 rounded text-sm sm:text-base font-medium text-blue-900">
          Adding new case for:{" "}
          <strong>
            {victim.vic_first_name} {victim.vic_last_name}
          </strong>
        </div>

        {/* Sections */}
        {[
          {
            key: "incidentInfo",
            label: "Incident Report",
            Component: IncidentInfo,
          },
          {
            key: "perpInfo",
            label: "Alleged Perpetrator Information",
            Component: PerpetratorInfo,
          },
          {
            key: "contactPerson",
            label: "Contact Person Information",
            Component: ContactPerson,
          },
          { key: "evidences", label: "Evidences", Component: Evidences },
        ].map(({ key, label, Component }) => (
          <div key={key} className="mb-4">
            <button
              onClick={() => toggleSection(key)}
              className="w-full flex justify-between items-center bg-blue-100 hover:bg-blue-200 px-4 py-3 rounded font-semibold text-blue-800 text-left transition-colors"
            >
              <span>{label}</span>
              <span>{openSections[key] ? "▼" : "▶"}</span>
            </button>
            {openSections[key] && (
              <div className="mt-4 border-l-4 border-blue-500 pl-4">
                {key === "evidences" ? (
                  <Component
                    files={evidenceFiles}
                    setFiles={setEvidenceFiles}
                    isLocked={isLocked}
                  />
                ) : (
                  <Component
                    formDataState={formDataState}
                    setFormDataState={setFormDataState}
                    isLocked={isLocked}
                  />
                )}
              </div>
            )}
          </div>
        ))}

        {/* Status banner */}
        {statusMessage && (
          <div
            className={`mt-6 p-3 rounded text-sm sm:text-base ${
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

        {/* Buttons */}
        {isAnySectionOpen && !isLocked && (
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            <button
              onClick={cancel}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition-all"
            >
              <XCircleIcon className="h-5 w-5 text-white" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold shadow transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              }`}
            >
              <CheckCircleIcon className="h-5 w-5 text-white" />
              {loading ? "Adding..." : "Add Case"}
            </button>
          </div>
        )}
      </div>

      {/* Show schedule page after success */}
      {showSchedulePage && (
        <div className="mt-6">
          <SchedulePage
            embedded={true}
            victim={showSchedulePage.victim}
            incident={showSchedulePage.incident}
          />
        </div>
      )}
    </div>
  );
}
