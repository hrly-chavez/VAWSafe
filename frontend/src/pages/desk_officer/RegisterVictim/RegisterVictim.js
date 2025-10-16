// // frontend/src/pages/desk_officer/RegisterVictim/RegisterVictim.js
// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
// import api from "../../../api/axios";

// // imported pages
// import AdministrativeInfo from "./AdministrativeInfo";
// import VictimInfo from "./VictimInfo";
// import IncidentInfo from "./IncidentInfo";
// import PerpetratorInfo from "./PerpetratorInfo";
// import CaptureVictimFacial from "./VictimFacial";
// import SchedulePage from "../Session/Schedule";
// import Evidences from "./Evidences";

// // imported constants
// import { INFORMANT_FIELDS } from "./helpers/form-keys";
// import { VICTIM_FIELDS } from "./helpers/form-keys";
// import { INCIDENT_KEYS } from "./helpers/form-keys";
// import { PERP_KEYS } from "./helpers/form-keys";

// const REQUIRED_VICTIM_KEYS = ["vic_first_name", "vic_last_name", "vic_sex"];

// const CASE_REPORT_KEYS = [
//   "handling_org",
//   "office_address",
//   "report_type",
//   "informant_name",
//   "informant_relationship",
//   "informant_contact",
// ];

// const hasAny = (state, keys) =>
//   keys.some(
//     (key) =>
//       state[key] !== undefined && state[key] !== "" && state[key] !== null
//   );

// export default function RegisterVictim() {
//   const [evidenceFiles, setEvidenceFiles] = useState([]);

//   const navigate = useNavigate();

//   // helper: turn list of keys → { key: "" }
//   const makeInitialState = (keys) =>
//     keys.reduce((acc, key) => {
//       acc[key] = ""; // default empty string
//       return acc;
//     }, {});

//   const [formDataState, setFormDataState] = useState({
//     ...makeInitialState(INFORMANT_FIELDS),
//     ...makeInitialState(VICTIM_FIELDS),
//     ...makeInitialState(INCIDENT_KEYS),
//     ...makeInitialState(PERP_KEYS),
//     victimPhotos: [], // extra fields you want
//     evidences: [],
//   });

//   const victimPhotos = formDataState.victimPhotos || [];

//   const [openSections, setOpenSections] = useState({
//     facialCapture: false,
//     adminInfo: false,
//     victimInfo: false,
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
//     navigate("/desk_officer/");
//   };

//   const toggleSection = (section) => {
//     setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

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
//       const informantPayload = {};
//       INFORMANT_FIELDS.forEach((k) => {
//         const v = formDataState[k];
//         if (v !== undefined && v !== null && v !== "") {
//           informantPayload[k] = v;
//         }
//       });

//       // Victim payload
//       const victimPayload = {};
//       VICTIM_FIELDS.forEach((k) => {
//         const v = formDataState[k];
//         if (v !== undefined && v !== null && v !== "") {
//           victimPayload[k] = v;
//         }
//       });

//       const caseReportPayload = hasAny(formDataState, CASE_REPORT_KEYS)
//         ? Object.fromEntries(
//             CASE_REPORT_KEYS.map((k) => [k, formDataState[k] ?? ""])
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

//       const perpetratorPayload = hasAny(formDataState, PERP_KEYS)
//         ? Object.fromEntries(PERP_KEYS.map((k) => [k, formDataState[k] ?? ""]))
//         : null;

//       // Build form-data
//       const fd = new FormData();
//       fd.append("informant", JSON.stringify(informantPayload));
//       fd.append("victim", JSON.stringify(victimPayload));
//       if (caseReportPayload)
//         fd.append("case_report", JSON.stringify(caseReportPayload));
//       if (incidentPayload)
//         fd.append("incident", JSON.stringify(incidentPayload));
//       if (perpetratorPayload)
//         fd.append("perpetrator", JSON.stringify(perpetratorPayload));

//       victimPhotos.forEach((file) => fd.append("photos", file));
//       evidenceFiles.forEach((f) => fd.append("evidences", f.file));

//       // ✅ axios request
//       const res = await api.post("/api/desk_officer/victims/register/", fd);

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
//     <div className="h-[85vh] overflow-y-auto w-full p-6">
//       <div className="border-2 border-blue-600 rounded-lg p-6 bg-white max-w-5xl mx-auto shadow">
//         <h2 className="text-xl font-bold text-blue-800 mb-4">
//           Victim Registration
//         </h2>
//         <div className="bg-gray-100 border rounded p-3 mb-4 text-sm">
//           <strong>
//             NATIONAL VIOLENCE AGAINST WOMEN (NVAW) DOCUMENTATION SYSTEM
//           </strong>{" "}
//           (Intake Form)
//         </div>

//         {/* Capture Victim Facial */}
//         <div className="mb-4">
//           <button
//             onClick={() => toggleSection("facialCapture")}
//             className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//           >
//             {openSections.facialCapture ? "▼" : "▶"} Capture Victim Facial
//           </button>
//           {openSections.facialCapture && (
//             <div className="mt-4 border-l-4 border-blue-500 pl-4">
//               <CaptureVictimFacial
//                 victimPhotos={victimPhotos}
//                 setFormDataState={setFormDataState}
//               />
//             </div>
//           )}
//         </div>

//         {/* Other Sections */}
//         {/* Admin Info */}
//         <div className="mb-4">
//           <button
//             onClick={() => toggleSection("adminInfo")}
//             className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//           >
//             {openSections.adminInfo ? "▼" : "▶"} Barangay Client Card
//           </button>
//           {openSections.adminInfo && (
//             <div className="mt-4 border-l-4 border-blue-500 pl-4">
//               <AdministrativeInfo
//                 formDataState={formDataState}
//                 setFormDataState={setFormDataState}
//               />
//             </div>
//           )}
//         </div>

//         {/* Victim Info */}
//         <div className="mb-4">
//           <button
//             onClick={() => toggleSection("victimInfo")}
//             className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//           >
//             {openSections.victimInfo ? "▼" : "▶"} Victim-Survivor Information
//           </button>
//           {openSections.victimInfo && (
//             <div className="mt-4 border-l-4 border-blue-500 pl-4">
//               <VictimInfo
//                 formDataState={formDataState}
//                 setFormDataState={setFormDataState}
//               />
//             </div>
//           )}
//         </div>

//         {/* Incident Info */}
//         <div className="mb-4">
//           <button
//             onClick={() => toggleSection("incidentInfo")}
//             className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//           >
//             {openSections.incidentInfo ? "▼" : "▶"} Incident Report
//           </button>
//           {openSections.incidentInfo && (
//             <div className="mt-4 border-l-4 border-blue-500 pl-4">
//               <IncidentInfo
//                 formDataState={formDataState}
//                 setFormDataState={setFormDataState}
//               />
//             </div>
//           )}
//         </div>

//         {/* Perp Info */}
//         <div className="mb-4">
//           <button
//             onClick={() => toggleSection("perpInfo")}
//             className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//           >
//             {openSections.perpInfo ? "▼" : "▶"} Alleged Perpetrator Information
//           </button>
//           {openSections.perpInfo && (
//             <div className="mt-4 border-l-4 border-blue-500 pl-4">
//               <PerpetratorInfo
//                 formDataState={formDataState}
//                 setFormDataState={setFormDataState}
//               />
//             </div>
//           )}
//         </div>

//         {/* Evidences */}
//         <div className="mb-4">
//           <button
//             onClick={() => toggleSection("evidences")}
//             className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
//           >
//             {openSections.evidences ? "▼" : "▶"} Evidences
//           </button>
//           {openSections.evidences && (
//             <div className="mt-4 border-l-4 border-blue-500 pl-4">
//               <Evidences files={evidenceFiles} setFiles={setEvidenceFiles} />
//             </div>
//           )}
//         </div>

//         {/* Status banner */}
//         {statusMessage && (
//           <div
//             className={`mt-4 p-3 rounded text-sm ${
//               statusMessage.startsWith("✅")
//                 ? "bg-green-100 text-green-800"
//                 : statusMessage.startsWith("⏳")
//                 ? "bg-yellow-100 text-yellow-800"
//                 : "bg-red-100 text-red-800"
//             }`}
//           >
//             {statusMessage}
//           </div>
//         )}

//         {/* Buttons only if section open */}
//         {isAnySectionOpen && (
//           <div className="flex justify-end gap-4 mt-8">
//             <button
//               onClick={cancel}
//               className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition-all"
//             >
//               <XCircleIcon className="h-5 w-5 text-white" />
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className={`flex items-center gap-2 px-6 py-2 rounded-md font-semibold shadow transition-all ${
//                 loading
//                   ? "bg-gray-400 cursor-not-allowed text-white"
//                   : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
//               }`}
//             >
//               <CheckCircleIcon className="h-5 w-5 text-white" />
//               {loading ? "Registering..." : "Register"}
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Show schedule page after success */}
//       {showSchedulePage && (
//         <SchedulePage
//           embedded={true}
//           victim={showSchedulePage.victim}
//           incident={showSchedulePage.incident}
//         />
//       )}
//     </div>
//   );
// }

// RegisterVictim.js
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";

// imported pages
import AdministrativeInfo from "./AdministrativeInfo";
import VictimInfo from "./VictimInfo";
import IncidentInfo from "./IncidentInfo";
import PerpetratorInfo from "./PerpetratorInfo";
import CaptureVictimFacial from "./VictimFacial";

// ! gibalhin nako ug lain page -> bpoapplication.js
// import SchedulePage from "../Session/Schedule";

import Evidences from "./Evidences";

// imported constants
import { INFORMANT_FIELDS } from "./helpers/form-keys";
import { VICTIM_FIELDS } from "./helpers/form-keys";
import { INCIDENT_KEYS } from "./helpers/form-keys";
import { PERP_KEYS } from "./helpers/form-keys";

const REQUIRED_VICTIM_KEYS = ["vic_first_name", "vic_last_name", "vic_sex"];

const CASE_REPORT_KEYS = [
  "handling_org",
  "office_address",
  "report_type",
  "informant_name",
  "informant_relationship",
  "informant_contact",
];

const hasAny = (state, keys) =>
  keys.some(
    (key) =>
      state[key] !== undefined && state[key] !== "" && state[key] !== null
  );

export default function RegisterVictim() {
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const navigate = useNavigate();

  // helper: turn list of keys → { key: "" }
  const makeInitialState = (keys) =>
    keys.reduce((acc, key) => {
      acc[key] = ""; // default empty string
      return acc;
    }, {});

  const [formDataState, setFormDataState] = useState({
    ...makeInitialState(INFORMANT_FIELDS),
    ...makeInitialState(VICTIM_FIELDS),
    ...makeInitialState(INCIDENT_KEYS),
    ...makeInitialState(PERP_KEYS),
    victimPhotos: [], // extra fields you want
    evidences: [],
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
    evidences: false,
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ! gibalhin nako ug lain page -> bpoapplication.js
  // const [showSchedulePage, setShowSchedulePage] = useState(null);

  const cancel = () => {
    alert("Form cancelled!");
    navigate("/desk_officer/");
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

      // Victim payload
      const informantPayload = {};
      INFORMANT_FIELDS.forEach((k) => {
        const v = formDataState[k];
        if (v !== undefined && v !== null && v !== "") {
          informantPayload[k] = v;
        }
      });

      // Victim payload
      const victimPayload = {};
      VICTIM_FIELDS.forEach((k) => {
        const v = formDataState[k];
        if (v !== undefined && v !== null && v !== "") {
          victimPayload[k] = v;
        }
      });

      if (formDataState.vic_current_address) {
        victimPayload.vic_current_address = formDataState.vic_current_address;
      }

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

      if (incidentPayload) {
        incidentPayload.province = formDataState.selectedProvince || null;
        incidentPayload.municipality =
          formDataState.selectedMunicipality || null;
        incidentPayload.barangay = formDataState.selectedBarangay || null;

        // Optional: resolve Sitio and Street IDs if needed
        // const sitioId = await resolveSitioId(formDataState.sitio);
        // const streetId = await resolveStreetId(formDataState.street, sitioId);

        // incidentPayload.sitio = sitioId || null;
        // incidentPayload.street = streetId || null;
      }

      const perpetratorPayload = hasAny(formDataState, PERP_KEYS)
        ? Object.fromEntries(PERP_KEYS.map((k) => [k, formDataState[k] ?? ""]))
        : null;

      // Build form-data
      const fd = new FormData();
      fd.append("informant", JSON.stringify(informantPayload));
      fd.append("victim", JSON.stringify(victimPayload));
      if (caseReportPayload)
        fd.append("case_report", JSON.stringify(caseReportPayload));
      if (incidentPayload)
        fd.append("incident", JSON.stringify(incidentPayload));
      if (perpetratorPayload)
        fd.append("perpetrator", JSON.stringify(perpetratorPayload));

      victimPhotos.forEach((file) => fd.append("photos", file));
      evidenceFiles.forEach((f) => fd.append("evidences", f.file));

      // ✅ axios request
      const res = await api.post("/api/desk_officer/victims/register/", fd);

      console.log(res.data);

      // * this is for getting pk of incident information which will be used for bpo application
      const victimData = res.data?.victim;
      const incidentData = res.data?.incident;

      localStorage.setItem("victimData", JSON.stringify(victimData));
      localStorage.setItem("incidentData", JSON.stringify(incidentData));

      console.log(victimData);
      console.log(incidentData);

      if (!res.data || res.data.success === false) {
        const errors = res.data?.errors;
        let msg = res.data?.error || "❌ Registration failed.";

        if (errors && typeof errors === "object") {
          const lines = Object.entries(errors).map(
            ([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`
          );
          msg = ` Registration failed:\n${lines.join("\n")}`;
        }

        console.error("Register error payload:", res.data);
        setStatusMessage(msg);
        setLoading(false);
        return;
      }

      // after successful registration
      setStatusMessage("✅ Victim registered successfully!");
      setLoading(false);

      // ! gibalhin nako ug lain page -> bpoapplication.js
      // Pass victim + incident to SchedulePage
      // setShowSchedulePage({
      //   victim: res.data.victim,
      //   incident: res.data.incident,
      // });

      navigate("/desk_officer/bpo-application");
    } catch (err) {
      console.error("Register victim exception:", err);
      setStatusMessage(" Something went wrong.");
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

        {/* Evidences */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection("evidences")}
            className="w-full text-left bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 font-semibold text-blue-800"
          >
            {openSections.evidences ? "▼" : "▶"} Evidences
          </button>
          {openSections.evidences && (
            <div className="mt-4 border-l-4 border-blue-500 pl-4">
              <Evidences files={evidenceFiles} setFiles={setEvidenceFiles} />
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
              Cancel
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
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        )}
      </div>

      {/* // ! gibalhin nako ug lain page -> bpoapplication.js */}
      {/* Show schedule page after success */}
      {/* {showSchedulePage && (
        <SchedulePage
          embedded={true}
          victim={showSchedulePage.victim}
          incident={showSchedulePage.incident}
        />
      )} */}
    </div>
  );
}
