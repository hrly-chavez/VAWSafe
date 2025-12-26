// RegisterVictim.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";

// imported pages
import VictimInfo from "./VictimInfo";
import FamilyComposition from "./FamilyComposition";
import ContactPerson from "./ContactPerson";
import IncidentInfo from "./IncidentInfo";
import PerpetratorInfo from "./PerpetratorInfo";
import CaptureVictimFacial from "./VictimFacial";
import SchedulePage from "../Sessions/Schedule";
import Evidences from "./Evidences";
import LegalAgreement from "./LegalAgreementGate";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// imported constants
import {
  VICTIM_FIELDS,
  INCIDENT_KEYS,
  PERP_KEYS,
  CONTACT_PERSON_FIELDS,
} from "./helpers/form-keys";

const FIELD_LABELS = {
  vic_first_name: "Victim First Name",
  vic_middle_name: "Victim Middle Name",
  vic_last_name: "Victim Last Name",
  vic_sex: "Victim Sex",
  vic_birth_date: "Victim Birth Date",
  vic_birth_place: "Victim Birth Place",

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
  // add more as needed...
};

const REQUIRED_VICTIM_KEYS = [
  "vic_first_name",
  "vic_middle_name",
  "vic_last_name",
  "vic_sex",
  "vic_birth_date",

  "violence_type",
  "incident_date",
  "incident_time",

  // "per_first_name",
  // "per_middle_name",
  // "per_last_name",
  // "per_birth_date",
  // "per_birth_place",
  // "cont_birth_date",
];

const hasAny = (state, keys) =>
  keys.some(
    (key) =>
      state[key] !== undefined && state[key] !== "" && state[key] !== null
  );

export default function RegisterVictim() {
  // this is for disabling form after registering
  const [isLocked, setIsLocked] = useState(false);

  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const navigate = useNavigate();

  const makeInitialState = (keys) =>
    keys.reduce((acc, key) => {
      acc[key] = "";
      return acc;
    }, {});

  const [formDataState, setFormDataState] = useState({
    ...makeInitialState(VICTIM_FIELDS),
    ...makeInitialState(INCIDENT_KEYS),
    ...makeInitialState(PERP_KEYS),
    ...makeInitialState(CONTACT_PERSON_FIELDS),
    victimPhotos: [],
    evidences: [],
    vic_sex: "Female",
    address: { province: "", municipality: "", barangay: "" },
    familyMembers: [],
  });

  const victimPhotos = formDataState.victimPhotos || [];

  const [openSections, setOpenSections] = useState({
    facialCapture: false,
    victimInfo: false,
    familyComposition: false,
    contactPerson: false,
    incidentInfo: false,
    perpInfo: false,
    evidenceRecords: false,
    barangayNote: false,
    evidences: false,
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSchedulePage, setShowSchedulePage] = useState(null);

  const cancel = () => {
    alert("Form cancelled!");
    navigate("/social_worker/");
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // const resolveSitioId = async (sitioName) => {
  //   if (!sitioName) return null;
  //   try {
  //     const res = await api.post("/api/desk_officer/sitios/resolve/", { name: sitioName });
  //     return res.data?.id || null;
  //   } catch (err) {
  //     console.error("Failed to resolve Sitio:", err);
  //     return null;
  //   }
  // };

  // const resolveStreetId = async (streetName, sitioId) => {
  //   if (!streetName || !sitioId) return null;
  //   try {
  //     const res = await api.post("/api/desk_officer/streets/resolve/", {
  //       name: streetName,
  //       sitio: sitioId,
  //     });
  //     return res.data?.id || null;
  //   } catch (err) {
  //     console.error("Failed to resolve Street:", err);
  //     return null;
  //   }
  // };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setStatusMessage("⏳ Processing registration...");

      for (const k of REQUIRED_VICTIM_KEYS) {
        if (!formDataState[k]) {
          const label = FIELD_LABELS[k] || k;
          setStatusMessage(`❌ Missing required field: ${label}`);
          alert(`Missing required field: ${label}`);
          setLoading(false);
          return;
        }
      }
      if (victimPhotos.length !== 3 || victimPhotos.some((p) => !p)) {
        setStatusMessage(" Please capture exactly 3 victim photos.");
        setLoading(false);
        return;
      }

      const victimPayload = {};
      VICTIM_FIELDS.forEach((k) => {
        const v = formDataState[k];
        if (v !== undefined && v !== null && v !== "") victimPayload[k] = v;
      });

      victimPayload.address = formDataState.address;
      if (formDataState.vic_current_address)
        victimPayload.vic_current_address = formDataState.vic_current_address;

      const contactPersonPayload = hasAny(formDataState, CONTACT_PERSON_FIELDS)
        ? Object.fromEntries(
            CONTACT_PERSON_FIELDS.map((k) => [
              k,
              formDataState[k] === "" ? null : formDataState[k],
            ])
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

      if (incidentPayload) {
        incidentPayload.province = formDataState.selectedProvince || null;
        incidentPayload.municipality =
          formDataState.selectedMunicipality || null;
        incidentPayload.barangay = formDataState.selectedBarangay || null;
      }

      const perpetratorPayload = hasAny(formDataState, PERP_KEYS)
        ? Object.fromEntries(
            PERP_KEYS.map((k) => [
              k,
              formDataState[k] === "" ? null : formDataState[k],
            ])
          )
        : null;

      const fd = new FormData();
      fd.append("victim", JSON.stringify(victimPayload));
      if (incidentPayload)
        fd.append("incident", JSON.stringify(incidentPayload));
      if (perpetratorPayload)
        fd.append("perpetrator", JSON.stringify(perpetratorPayload));
      if (contactPersonPayload)
        fd.append("contact_person", JSON.stringify(contactPersonPayload));

      const cleanedFamilyMembers = formDataState.familyMembers.map((member) => {
        const cleaned = { ...member };

        if (cleaned.fam_birth_date === "") {
          cleaned.fam_birth_date = null;
        }

        return cleaned;
      });

      if (formDataState.familyMembers?.length) {
        fd.append("familyMembers", JSON.stringify(cleanedFamilyMembers));
      }

      victimPhotos.forEach((file) => fd.append("photos", file));
      evidenceFiles.forEach((f) => fd.append("evidences", f.file));

      const res = await api.post("/api/social_worker/register-victim/", fd);

      const victimData = res.data?.victim;
      const incidentData = res.data?.incident;
      localStorage.setItem("victimData", JSON.stringify(victimData));
      localStorage.setItem("incidentData", JSON.stringify(incidentData));

      if (!res.data || res.data.success === false) {
        const errors = res.data?.errors;
        let msg = res.data?.error || "❌ Registration failed.";
        if (errors && typeof errors === "object") {
          const lines = Object.entries(errors).map(
            ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
          );
          msg = ` Registration failed:\n${lines.join("\n")}`;
        }
        setStatusMessage(msg);
        setLoading(false);
        return;
      }

      setStatusMessage("✅ Victim registered successfully!");
      setLoading(false);
      setIsLocked(true);

      if (evidenceFiles.length) {
        const zip = new JSZip();
        evidenceFiles.forEach((f, idx) => {
          zip.file(f.file.name, f.file);
        });

        zip.generateAsync({ type: "blob" }).then((blob) => {
          saveAs(blob, `evidence_photos_${Date.now()}.zip`);
        });
      }

      setShowSchedulePage({
        victim: res.data.victim,
        incident: res.data.incident,
      });
    } catch (err) {
      console.error("Register victim exception:", err);
      setStatusMessage(" Something went wrong.");
      setLoading(false);
    }
  };

  const isAnySectionOpen = Object.values(openSections).some((v) => v);

  return (
    <>
      {!legalAccepted && <LegalAgreement setLegalAccepted={setLegalAccepted} />}

      {legalAccepted && (
        <div className="h-[85vh] overflow-y-auto w-full p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg border border-blue-200 p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4 text-center">
              Victim Registration
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 mb-6 rounded text-sm sm:text-base font-medium text-blue-900">
              NATIONAL VIOLENCE AGAINST WOMEN (NVAW) DOCUMENTATION SYSTEM
              (Intake Form)
            </div>

            {/* Sections */}
            {[
              {
                key: "facialCapture",
                label: "Capture Victim Facial",
                Component: CaptureVictimFacial,
              },
              {
                key: "victimInfo",
                label: "Victim-Survivor Information",
                Component: VictimInfo,
              },
              {
                key: "familyComposition",
                label: "Family Composition",
                Component: FamilyComposition,
              },
              {
                key: "contactPerson",
                label: "Contact Person Information",
                Component: ContactPerson,
              },
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
                        victimPhotos={victimPhotos}
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
                  {loading ? "Registering..." : "Register"}
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
      )}
    </>
  );
}
