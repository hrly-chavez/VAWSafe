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

// imported constants
import { VICTIM_FIELDS, INCIDENT_KEYS, PERP_KEYS, CONTACT_PERSON_FIELDS } from "./helpers/form-keys";

const REQUIRED_VICTIM_KEYS = ["vic_first_name", "vic_last_name", "vic_sex"];

const hasAny = (state, keys) =>
  keys.some((key) => state[key] !== undefined && state[key] !== "" && state[key] !== null);

export default function RegisterVictim() {
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

      const victimPayload = {};
      VICTIM_FIELDS.forEach((k) => {
        const v = formDataState[k];
        if (v !== undefined && v !== null && v !== "") victimPayload[k] = v;
      });
      victimPayload.address = formDataState.address;
      if (formDataState.vic_current_address) victimPayload.vic_current_address = formDataState.vic_current_address;

      const contactPersonPayload = hasAny(formDataState, CONTACT_PERSON_FIELDS)
        ? Object.fromEntries(CONTACT_PERSON_FIELDS.map((k) => [k, formDataState[k] ?? ""]))
        : null;

      const incidentPayload = hasAny(formDataState, INCIDENT_KEYS)
        ? Object.fromEntries(
            INCIDENT_KEYS.map((k) => [
              k,
              typeof formDataState[k] === "boolean" ? !!formDataState[k] : formDataState[k] ?? "",
            ])
          )
        : null;

      if (incidentPayload) {
        incidentPayload.province = formDataState.selectedProvince || null;
        incidentPayload.municipality = formDataState.selectedMunicipality || null;
        incidentPayload.barangay = formDataState.selectedBarangay || null;
      }

      const perpetratorPayload = hasAny(formDataState, PERP_KEYS)
        ? Object.fromEntries(PERP_KEYS.map((k) => [k, formDataState[k] ?? ""]))
        : null;

      const fd = new FormData();
      fd.append("victim", JSON.stringify(victimPayload));
      if (incidentPayload) fd.append("incident", JSON.stringify(incidentPayload));
      if (perpetratorPayload) fd.append("perpetrator", JSON.stringify(perpetratorPayload));
      if (contactPersonPayload) fd.append("contact_person", JSON.stringify(contactPersonPayload));

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
      setShowSchedulePage({ victim: res.data.victim, incident: res.data.incident });
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
              NATIONAL VIOLENCE AGAINST WOMEN (NVAW) DOCUMENTATION SYSTEM (Intake Form)
            </div>

            {/* Sections */}
            {[
              { key: "facialCapture", label: "Capture Victim Facial", Component: CaptureVictimFacial },
              { key: "victimInfo", label: "Victim-Survivor Information", Component: VictimInfo },
              { key: "familyComposition", label: "Family Composition", Component: FamilyComposition },
              { key: "contactPerson", label: "Contact Person Information", Component: ContactPerson },
              { key: "incidentInfo", label: "Incident Report", Component: IncidentInfo },
              { key: "perpInfo", label: "Alleged Perpetrator Information", Component: PerpetratorInfo },
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
                      <Component files={evidenceFiles} setFiles={setEvidenceFiles} />
                    ) : (
                      <Component formDataState={formDataState} setFormDataState={setFormDataState} victimPhotos={victimPhotos} />
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
            {isAnySectionOpen && (
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
              <SchedulePage embedded={true} victim={showSchedulePage.victim} incident={showSchedulePage.incident} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

//MAO NI ANG INYO CODE AKO RHA GI COMMENT KAY IF NAAY ERROR SA NEW CODE SA TAAS PWEDE RHA NINYO I UNCOMMENT
// // RegisterVictim.js
// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
// import api from "../../../api/axios";

// // imported pages
// import VictimInfo from "./VictimInfo";
// import FamilyComposition from "./FamilyComposition";
// import ContactPerson from "./ContactPerson";
// import IncidentInfo from "./IncidentInfo";
// import PerpetratorInfo from "./PerpetratorInfo";
// import CaptureVictimFacial from "./VictimFacial";
// import SchedulePage from "../Sessions/Schedule";
// import Evidences from "./Evidences";
// import LegalAgreement from "./LegalAgreementGate";

// // imported constants
// import { VICTIM_FIELDS } from "./helpers/form-keys";
// import { INCIDENT_KEYS } from "./helpers/form-keys";
// import { PERP_KEYS } from "./helpers/form-keys";
// import { CONTACT_PERSON_FIELDS } from "./helpers/form-keys";

// const REQUIRED_VICTIM_KEYS = ["vic_first_name", "vic_last_name", "vic_sex"];

// const hasAny = (state, keys) =>
//   keys.some(
//     (key) =>
//       state[key] !== undefined && state[key] !== "" && state[key] !== null
//   );

// export default function RegisterVictim() {
//   const [evidenceFiles, setEvidenceFiles] = useState([]);

//   const [legalAccepted, setLegalAccepted] = useState(false);

//   const navigate = useNavigate();

//   // helper: turn list of keys → { key: "" }
//   const makeInitialState = (keys) =>
//     keys.reduce((acc, key) => {
//       acc[key] = ""; // default empty string
//       return acc;
//     }, {});

//   const [formDataState, setFormDataState] = useState({
//     ...makeInitialState(VICTIM_FIELDS),
//     ...makeInitialState(INCIDENT_KEYS),
//     ...makeInitialState(PERP_KEYS),
//     ...makeInitialState(CONTACT_PERSON_FIELDS),
//     victimPhotos: [], // extra fields you want
//     evidences: [],

//     vic_sex: "Female",
//     address: {
//       // Initialize address with default empty values
//       province: "",
//       municipality: "",
//       barangay: "",
//     },
//   });

//   const victimPhotos = formDataState.victimPhotos || [];

//   const [openSections, setOpenSections] = useState({
//     facialCapture: false,
//     victimInfo: false,
//     familyComposition: false,
//     contactPerson: false,
//     incidentInfo: false,
//     perpInfo: false,
//     evidenceRecords: false,
//     barangayNote: false,
//     evidences: false,
//   });
//   const [statusMessage, setStatusMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [showSchedulePage, setShowSchedulePage] = useState(null);

//   const cancel = () => {
//     alert("Form cancelled!");
//     navigate("/social_worker/");
//   };

//   const toggleSection = (section) => {
//     setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

//   // const resolveSitioId = async (sitioName) => {
//   //   if (!sitioName) return null;
//   //   try {
//   //     const res = await api.post("/api/desk_officer/sitios/resolve/", { name: sitioName });
//   //     return res.data?.id || null;
//   //   } catch (err) {
//   //     console.error("Failed to resolve Sitio:", err);
//   //     return null;
//   //   }
//   // };

//   // const resolveStreetId = async (streetName, sitioId) => {
//   //   if (!streetName || !sitioId) return null;
//   //   try {
//   //     const res = await api.post("/api/desk_officer/streets/resolve/", {
//   //       name: streetName,
//   //       sitio: sitioId,
//   //     });
//   //     return res.data?.id || null;
//   //   } catch (err) {
//   //     console.error("Failed to resolve Street:", err);
//   //     return null;
//   //   }
//   // };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
//       setStatusMessage("⏳ Processing registration...");

//       // Required fields
//       for (const k of REQUIRED_VICTIM_KEYS) {
//         if (!formDataState[k]) {
//           setStatusMessage(` Missing required victim field: ${k}`);
//           setLoading(false);
//           return;
//         }
//       }
//       if (victimPhotos.length !== 3 || victimPhotos.some((p) => !p)) {
//         setStatusMessage(" Please capture exactly 3 victim photos.");
//         setLoading(false);
//         return;
//       }

//       // Victim payload
//       const victimPayload = {};
//       VICTIM_FIELDS.forEach((k) => {
//         const v = formDataState[k];
//         if (v !== undefined && v !== null && v !== "") {
//           victimPayload[k] = v;
//         }
//       });

//       // Add the address to the victim payload
//       victimPayload.address = formDataState.address; // Ensure address is included

//       if (formDataState.vic_current_address) {
//         victimPayload.vic_current_address = formDataState.vic_current_address;
//       }

//       const contactPersonPayload = hasAny(formDataState, CONTACT_PERSON_FIELDS)
//         ? Object.fromEntries(
//             CONTACT_PERSON_FIELDS.map((k) => [k, formDataState[k] ?? ""])
//           )
//         : null;

//       const incidentPayload = hasAny(formDataState, INCIDENT_KEYS)
//         ? Object.fromEntries(
//             INCIDENT_KEYS.map((k) => [
//               k,
//               typeof formDataState[k] === "boolean"
//                 ? !!formDataState[k]
//                 : formDataState[k] ?? "",
//             ])
//           )
//         : null;

//       if (incidentPayload) {
//         incidentPayload.province = formDataState.selectedProvince || null;
//         incidentPayload.municipality =
//           formDataState.selectedMunicipality || null;
//         incidentPayload.barangay = formDataState.selectedBarangay || null;

//         // Optional: resolve Sitio and Street IDs if needed
//         // const sitioId = await resolveSitioId(formDataState.sitio);
//         // const streetId = await resolveStreetId(formDataState.street, sitioId);

//         // incidentPayload.sitio = sitioId || null;
//         // incidentPayload.street = streetId || null;
//       }

//       const perpetratorPayload = hasAny(formDataState, PERP_KEYS)
//         ? Object.fromEntries(PERP_KEYS.map((k) => [k, formDataState[k] ?? ""]))
//         : null;

//       // const informantPayload = hasAny(formDataState, INFORMANT_FIELDS)
//       //   ? Object.fromEntries(
//       //     INFORMANT_FIELDS.map((k) => [k, formDataState[k] ?? ""])
//       //   )
//       //   : null;

//       // Build form-data
//       const fd = new FormData();
//       fd.append("victim", JSON.stringify(victimPayload));
//       if (incidentPayload)
//         fd.append("incident", JSON.stringify(incidentPayload));
//       if (perpetratorPayload)
//         fd.append("perpetrator", JSON.stringify(perpetratorPayload));
//       if (contactPersonPayload)
//         fd.append("contact_person", JSON.stringify(contactPersonPayload));

//       victimPhotos.forEach((file) => fd.append("photos", file));
//       evidenceFiles.forEach((f) => fd.append("evidences", f.file));

//       // ✅ axios request
//       const res = await api.post("/api/social_worker/register-victim/", fd);

//       console.log(res.data);

//       // * this is for getting pk of incident information which will be used for bpo application
//       const victimData = res.data?.victim;
//       const incidentData = res.data?.incident;

//       localStorage.setItem("victimData", JSON.stringify(victimData));
//       localStorage.setItem("incidentData", JSON.stringify(incidentData));

//       console.log(victimData);
//       console.log(incidentData);

//       if (!res.data || res.data.success === false) {
//         const errors = res.data?.errors;
//         let msg = res.data?.error || "❌ Registration failed.";

//         if (errors && typeof errors === "object") {
//           const lines = Object.entries(errors).map(
//             ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
//           );
//           msg = ` Registration failed:\n${lines.join("\n")}`;
//         }

//         console.error("Register error payload:", res.data);
//         setStatusMessage(msg);
//         setLoading(false);
//         return;
//       }

//       // after successful registration
//       setStatusMessage("✅ Victim registered successfully!");
//       setLoading(false);

//       // Pass victim + incident to SchedulePage
//       setShowSchedulePage({
//         victim: res.data.victim,
//         incident: res.data.incident,
//       });
//     } catch (err) {
//       console.error("Register victim exception:", err);
//       setStatusMessage(" Something went wrong.");
//       setLoading(false);
//     }
//   };

//   const isAnySectionOpen = Object.values(openSections).some((v) => v);


//   return (
//     <>
//       {!legalAccepted && <LegalAgreement setLegalAccepted={setLegalAccepted} />}

//       {legalAccepted && (
//         <div className="h-[85vh] overflow-y-auto w-full p-6">
//           <div className="border-2 border-blue-600 rounded-lg p-6 bg-white max-w-5xl mx-auto shadow">
//             <h2 className="text-xl font-bold text-blue-800 mb-4">
//               Victim Registration
//             </h2>
//             <div className="bg-gray-100 border rounded p-3 mb-4 text-sm">
//               <strong>
//                 NATIONAL VIOLENCE AGAINST WOMEN (NVAW) DOCUMENTATION SYSTEM
//               </strong>{" "}
//               (Intake Form)
//             </div>

//             {/* Capture Victim Facial */}
//             <div className="mb-4">
//               <button
//                 onClick={() => toggleSection("facialCapture")}
//                 className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//               >
//                 {openSections.facialCapture ? "▼" : "▶"} Capture Victim Facial
//               </button>
//               {openSections.facialCapture && (
//                 <div className="mt-4 border-l-4 border-blue-500 pl-4">
//                   <CaptureVictimFacial
//                     victimPhotos={victimPhotos}
//                     setFormDataState={setFormDataState}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Victim Info */}
//             <div className="mb-4">
//               <button
//                 onClick={() => toggleSection("victimInfo")}
//                 className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//               >
//                 {openSections.victimInfo ? "▼" : "▶"} Victim-Survivor
//                 Information
//               </button>
//               {openSections.victimInfo && (
//                 <div className="mt-4 border-l-4 border-blue-500 pl-4">
//                   <VictimInfo
//                     formDataState={formDataState}
//                     setFormDataState={setFormDataState}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* family composition */}
//             <div className="mb-4">
//               <button
//                 onClick={() => toggleSection("familyComposition")}
//                 className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//               >
//                 {openSections.familyComposition ? "▼" : "▶"} Family Composition
//               </button>
//               {openSections.familyComposition && (
//                 <div className="mt-4 border-l-4 border-blue-500 pl-4 ">
//                   <FamilyComposition
//                     formDataState={formDataState}
//                     setFormDataState={setFormDataState}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Contact Person */}
//             <div className="mb-4">
//               <button
//                 onClick={() => toggleSection("contactPerson")}
//                 className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//               >
//                 {openSections.contactPerson ? "▼" : "▶"} Contact Person
//                 Information
//               </button>
//               {openSections.contactPerson && (
//                 <div className="mt-4 border-l-4 border-blue-500 pl-4">
//                   <ContactPerson
//                     formDataState={formDataState}
//                     setFormDataState={setFormDataState}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Perp Info */}
//             <div className="mb-4">
//               <button
//                 onClick={() => toggleSection("perpInfo")}
//                 className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//               >
//                 {openSections.perpInfo ? "▼" : "▶"} Alleged Perpetrator
//                 Information
//               </button>
//               {openSections.perpInfo && (
//                 <div className="mt-4 border-l-4 border-blue-500 pl-4">
//                   <PerpetratorInfo
//                     formDataState={formDataState}
//                     setFormDataState={setFormDataState}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Incident Info */}
//             <div className="mb-4">
//               <button
//                 onClick={() => toggleSection("incidentInfo")}
//                 className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//               >
//                 {openSections.incidentInfo ? "▼" : "▶"} Incident Report
//               </button>
//               {openSections.incidentInfo && (
//                 <div className="mt-4 border-l-4 border-blue-500 pl-4">
//                   <IncidentInfo
//                     formDataState={formDataState}
//                     setFormDataState={setFormDataState}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Evidences */}
//             <div className="mb-4">
//               <button
//                 onClick={() => toggleSection("evidences")}
//                 className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//               >
//                 {openSections.evidences ? "▼" : "▶"} Evidences
//               </button>
//               {openSections.evidences && (
//                 <div className="mt-4 border-l-4 border-blue-500 pl-4">
//                   <Evidences
//                     files={evidenceFiles}
//                     setFiles={setEvidenceFiles}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Status banner */}
//             {statusMessage && (
//               <div
//                 className={`mt-4 p-3 rounded text-sm ${
//                   statusMessage.startsWith("✅")
//                     ? "bg-green-100 text-green-800"
//                     : statusMessage.startsWith("⏳")
//                     ? "bg-yellow-100 text-yellow-800"
//                     : "bg-red-100 text-red-800"
//                 }`}
//               >
//                 {statusMessage}
//               </div>
//             )}

//             {/* Buttons only if section open */}
//             {isAnySectionOpen && (
//               <div className="flex justify-end gap-4 mt-8">
//                 <button
//                   onClick={cancel}
//                   className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition-all"
//                 >
//                   <XCircleIcon className="h-5 w-5 text-white" />
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold shadow transition-all ${
//                     loading
//                       ? "bg-gray-400 cursor-not-allowed text-white"
//                       : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
//                   }`}
//                 >
//                   <CheckCircleIcon className="h-5 w-5 text-white" />
//                   {loading ? "Registering..." : "Register"}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Show schedule page after success */}
//           {showSchedulePage && (
//             <SchedulePage
//               embedded={true}
//               victim={showSchedulePage.victim}
//               incident={showSchedulePage.incident}
//             />
//           )}
//         </div>
//       )}
//     </>
//   );
// }