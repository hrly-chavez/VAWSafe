// AdministrativeInfo.js
// // src/pages/desk_officer/RegisterVictim/AdministrativeInfo.js
// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function AdministrativeInfo({
//   formDataState,
//   setFormDataState,
// }) {
//   const handleChange = (field, value) => {
//     setFormDataState((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const [cities, setCities] = useState([]);
//   const [municipalities, setMunicipalities] = useState([]);
//   const [barangays, setBarangays] = useState([]);

//   const [selectedCity, setSelectedCity] = useState("");
//   const [selectedMunicipality, setSelectedMunicipality] = useState("");
//   const [selectedBarangay, setSelectedBarangay] = useState("");

//   const [street, setStreet] = useState("");
//   const [sitio, setSitio] = useState("");

//   useEffect(() => {
//     axios
//       .get("http://localhost:8000/api/desk_officer/cities/")
//       .then((res) => setCities(res.data))
//       .catch((err) => console.error("Failed to load cities:", err));
//   }, []);

//   useEffect(() => {
//     if (selectedCity) {
//       axios
//         .get(
//           `http://localhost:8000/api/desk_officer/cities/${selectedCity}/municipalities/`
//         )
//         .then((res) => setMunicipalities(res.data))
//         .catch((err) => console.error("Failed to load municipalities:", err));
//     } else {
//       setMunicipalities([]);
//       setBarangays([]);
//     }
//   }, [selectedCity]);

//   useEffect(() => {
//     if (selectedMunicipality) {
//       axios
//         .get(
//           `http://localhost:8000/api/desk_officer/municipalities/${selectedMunicipality}/barangays/`
//         )
//         .then((res) => setBarangays(res.data))
//         .catch((err) => console.error("Failed to load barangays:", err));
//     } else {
//       setBarangays([]);
//     }
//   }, [selectedMunicipality]);

//   useEffect(() => {
//     const cityName = cities.find((c) => c.id === parseInt(selectedCity))?.name;
//     const municipalityName = municipalities.find(
//       (m) => m.id === parseInt(selectedMunicipality)
//     )?.name;
//     const barangayName = barangays.find(
//       (b) => b.id === parseInt(selectedBarangay)
//     )?.name;

//     const parts = [
//       street.trim(),
//       sitio.trim(),
//       barangayName,
//       municipalityName,
//       cityName,
//     ].filter(Boolean);

//     const fullAddress = parts.join(", ");
//     handleChange("handling_org_full_address", fullAddress);
//   }, [
//     selectedCity,
//     selectedMunicipality,
//     selectedBarangay,
//     sitio,
//     street,
//     cities,
//     municipalities,
//     barangays,
//   ]);

//   const handleReportType = (value) => {
//     // If the victim is the reporter, clear informant fields
//     if (value === "Reported by the victim-survivor") {
//       setFormDataState((prev) => ({
//         ...prev,
//         report_type: value,
//         informant_name: "",
//         informant_relationship: "",
//         informant_contact: "",
//       }));
//     } else {
//       handleChange("report_type", value);
//     }
//   };

//   const inputStyle =
//     "px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400";

//   const onTrimmed = (field) => (e) =>
//     handleChange(field, e.target.value.trimStart());

//   const showInformant =
//     formDataState.report_type &&
//     formDataState.report_type !== "Reported by the victim-survivor";

//   return (
//     <div>
//       <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
//         Administrative Information
//       </h2>

//       {/* Handling Organization / Office Address */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Handling Organization
//           </label>
//           <select
//             className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={formDataState.handling_org || ""}
//             onChange={(e) => handleChange("handling_org", e.target.value)}
//           >
//             <option value="" disabled>
//               Select organization
//             </option>
//             <option value="DSWD">
//               Department of Social Welfare and Development (DSWD)
//             </option>
//             <option value="VAWDesk">Barangay VAW Desk</option>
//           </select>
//         </div>

//         {/* Address */}
//         <div className="flex flex-col">
//           <label className="font-medium text-sm mb-1">Province</label>
//           <select
//             value={selectedCity}
//             onChange={(e) => setSelectedCity(e.target.value)}
//             className={inputStyle}
//           >
//             <option value="" disabled hidden>
//               Select Province
//             </option>
//             {cities.map((city) => (
//               <option key={city.id} value={city.id}>
//                 {city.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col">
//           <label className="font-medium text-sm mb-1">Municipality</label>
//           <select
//             value={selectedMunicipality}
//             onChange={(e) => setSelectedMunicipality(e.target.value)}
//             className={inputStyle}
//             disabled={!selectedCity}
//           >
//             <option value="" disabled hidden>
//               Select Municipality
//             </option>
//             {municipalities.map((m) => (
//               <option key={m.id} value={m.id}>
//                 {m.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col">
//           <label className="font-medium text-sm mb-1">Barangay</label>
//           <select
//             value={selectedBarangay}
//             onChange={(e) => setSelectedBarangay(e.target.value)}
//             className={inputStyle}
//             disabled={!selectedMunicipality}
//           >
//             <option value="" disabled hidden>
//               Select Barangay
//             </option>
//             {barangays.map((b) => (
//               <option key={b.id} value={b.id}>
//                 {b.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col">
//           <label className="font-medium text-sm mb-1">Sitio</label>
//           <input
//             type="text"
//             placeholder="Sitio Example"
//             className={inputStyle}
//           />
//         </div>

//         <div className="flex flex-col">
//           <label className="font-medium text-sm mb-1">Street</label>
//           <input
//             type="text"
//             placeholder="Example Street Name"
//             className={inputStyle}
//             value={street}
//             onChange={(e) => setStreet(e.target.value)}
//           />
//         </div>

//         <div className="md:col-span-2">
//           <div className="flex flex-col md:col-span-2">
//             <label className="font-medium text-sm mb-1">
//               Handling Organization Full Address
//             </label>
//             <input
//               type="text"
//               value={formDataState.handling_org_full_address || ""}
//               readOnly
//               placeholder="Auto-generated based on selected location"
//               className={`${inputStyle} bg-gray-100 text-gray-700`}
//             />
//           </div>
//         </div>

//         {/* Report Type */}
//         <div className="md:col-span-2">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Report Type
//           </label>
//           <select
//             className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={formDataState.report_type || ""}
//             onChange={(e) => handleReportType(e.target.value)}
//           >
//             <option>Select report type</option>
//             <option value="victim-survivor">
//               Reported by the victim-survivor
//             </option>
//             <option value="companion with victim-survivor">
//               Reported by victim-survivor's companion and victim-survivor is
//               present
//             </option>
//             <option value="informant only">
//               Reported by informant and victim-survivor is not present at
//               reporting
//             </option>
//           </select>
//         </div>
//       </div>

//       {/* popup depends on report type */}
//       {formDataState.report_type !== "victim-survivor" &&
//         formDataState.report_type !== "" && (
//           <div className="">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Name of Informant
//             </label>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <input
//                 className="input"
//                 type="text"
//                 placeholder="First Name"
//                 onChange={(e) => handleChange("inf_fname", e.target.value)}
//               />
//               <input
//                 className="input"
//                 type="text"
//                 placeholder="Middle Name"
//                 onChange={(e) => handleChange("inf_mname", e.target.value)}
//               />
//               <input
//                 className="input"
//                 type="text"
//                 placeholder="Last Name"
//                 onChange={(e) => handleChange("inf_lname", e.target.value)}
//               />
//               <input
//                 className="input"
//                 type="text"
//                 placeholder="Extension (e.g. Jr., III)"
//                 onChange={(e) => handleChange("inf_extension", e.target.value)}
//               />
//             </div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Relationship to victim-survivor
//             </label>
//             <div>
//               <input
//                 className="input"
//                 type="text"
//                 onChange={(e) =>
//                   handleChange("inf_relationship_to_victim", e.target.value)
//                 }
//               />
//             </div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Contact Information
//             </label>
//             <div>
//               <input
//                 className="input"
//                 type="number"
//                 placeholder="09XX-XXX-XXXX"
//                 onChange={(e) => handleChange("inf_contact", e.target.value)}
//               />
//             </div>
//           </div>
//         )}
//     </div>
//   );
// }

// src/pages/desk_officer/RegisterVictim/AdministrativeInfo.js
import { useState, useEffect } from "react";
import api from "../../../api/axios";

export default function AdministrativeInfo({ formDataState, setFormDataState }) {
  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [provinceQuery, setProvinceQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  const [municipalityQuery, setMunicipalityQuery] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [showMunicipalityDropdown, setShowMunicipalityDropdown] = useState(false);

  const [barangayQuery, setBarangayQuery] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);

  const [sitio, setSitio] = useState("");
  const [street, setStreet] = useState("");

  // Load provinces
  useEffect(() => {
    api
      .get("/api/dswd/provinces/")
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Fetch municipalities when province changes
  useEffect(() => {
    if (selectedProvince) {
      api
        .get(`/api/dswd/municipalities/?province=${selectedProvince}`)
        .then((res) => setMunicipalities(res.data))
        .catch((err) => console.error("Failed to load municipalities:", err));
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [selectedProvince]);

  // Fetch barangays when municipality changes
  useEffect(() => {
    if (selectedMunicipality) {
      api
        .get(`/api/dswd/barangays/?municipality=${selectedMunicipality}`)
        .then((res) => setBarangays(res.data))
        .catch((err) => console.error("Failed to load barangays:", err));
    } else {
      setBarangays([]);
    }
  }, [selectedMunicipality]);

  // Build full address string
  useEffect(() => {
    const provinceName = provinces.find(
      (p) => p.id === parseInt(selectedProvince)
    )?.name;
    const municipalityName = municipalities.find(
      (m) => m.id === parseInt(selectedMunicipality)
    )?.name;
    const barangayName = barangays.find(
      (b) => b.id === parseInt(selectedBarangay)
    )?.name;

    const parts = [
      street.trim(), // optional manual input
      sitio.trim(), // optional manual input
      barangayName,
      municipalityName,
      provinceName,
    ].filter(Boolean);

    const fullAddress = parts.join(", ");
    handleChange("handling_org_full_address", fullAddress);
  }, [
    selectedProvince,
    selectedMunicipality,
    selectedBarangay,
    sitio,
    street,
    provinces,
    municipalities,
    barangays,
  ]);

  const handleReportType = (value) => {
    if (value === "victim-survivor") {
      setFormDataState((prev) => ({
        ...prev,
        report_type: value,
        informant_name: "",
        informant_relationship: "",
        informant_contact: "",
      }));
    } else {
      handleChange("report_type", value);
    }
  };

  const inputStyle =
    "px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide mb-6">
        Administrative Information
      </h2>

      {/* Handling Organization / Office Address */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Handling Organization
        </label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formDataState.handling_org || ""}
          onChange={(e) => handleChange("handling_org", e.target.value)}
        >
          <option value="" disabled>
            Select organization
          </option>
          <option value="DSWD">
            Department of Social Welfare and Development (DSWD)
          </option>
          <option value="VAWDesk">Barangay VAW Desk</option>
        </select>
      </div>

      {/* Address */}
      <div className="flex flex-col mb-6 relative">
        <label className="text-sm font-medium text-gray-700 mb-2">Province</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type to search province"
          value={provinceQuery}
          onChange={(e) => {
            setProvinceQuery(e.target.value);
            setShowProvinceDropdown(true);
            setSelectedProvince(""); // clear selection
          }}
          onFocus={() => setShowProvinceDropdown(true)}
          onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 150)} // delay for click
        />

        {showProvinceDropdown && provinceQuery && (
          <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg z-10">
            {provinces
              .filter((p) =>
                p.name.toLowerCase().includes(provinceQuery.toLowerCase())
              )
              .map((p) => (
                <li
                  key={p.id}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setSelectedProvince(p.id.toString());
                    setProvinceQuery(p.name);
                    setShowProvinceDropdown(false);
                  }}
                >
                  {p.name}
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col mb-6 relative">
        <label className="text-sm font-medium text-gray-700 mb-2">Municipality</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type to search municipality"
          value={municipalityQuery}
          onChange={(e) => {
            setMunicipalityQuery(e.target.value);
            setShowMunicipalityDropdown(true);
            setSelectedMunicipality("");
          }}
          onFocus={() => setShowMunicipalityDropdown(true)}
          onBlur={() => setTimeout(() => setShowMunicipalityDropdown(false), 150)}
          disabled={!selectedProvince}
        />

        {showMunicipalityDropdown && municipalityQuery && (
          <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg z-10">
            {municipalities
              .filter((m) =>
                m.name.toLowerCase().includes(municipalityQuery.toLowerCase())
              )
              .map((m) => (
                <li
                  key={m.id}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setSelectedMunicipality(m.id.toString());
                    setMunicipalityQuery(m.name);
                    setShowMunicipalityDropdown(false);
                  }}
                >
                  {m.name}
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col mb-6 relative">
        <label className="text-sm font-medium text-gray-700 mb-2">Barangay</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type to search barangay"
          value={barangayQuery}
          onChange={(e) => {
            setBarangayQuery(e.target.value);
            setShowBarangayDropdown(true);
            setSelectedBarangay("");
          }}
          onFocus={() => setShowBarangayDropdown(true)}
          onBlur={() => setTimeout(() => setShowBarangayDropdown(false), 150)}
          disabled={!selectedMunicipality}
        />

        {showBarangayDropdown && barangayQuery && (
          <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg z-10">
            {barangays
              .filter((b) =>
                b.name.toLowerCase().includes(barangayQuery.toLowerCase())
              )
              .map((b) => (
                <li
                  key={b.id}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setSelectedBarangay(b.id.toString());
                    setBarangayQuery(b.name);
                    setShowBarangayDropdown(false);
                  }}
                >
                  {b.name}
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Sitio (optional) */}
      <div className="flex flex-col mb-4">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Sitio
        </label>
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Sitio (optional)"
          value={sitio}
          onChange={(e) => setSitio(e.target.value)}
        />
      </div>

      {/* Street (optional) */}
      <div className="flex flex-col mb-4">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Street
        </label>
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Street (optional)"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Handling Organization Full Address
          </label>
          <input
            type="text"
            value={formDataState.handling_org_full_address || ""}
            readOnly
            placeholder="Auto-generated based on selected location"
            className={`${inputStyle} bg-gray-100 text-gray-700`}
          />
        </div>
      </div>

      {/* Report Type */}
      <div className="md:col-span-2">
        <div className="flex flex-col mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            className="input w-full"
            value={formDataState.reporter_identity || ""}
            onChange={(e) => handleChange("reporter_identity", e.target.value)}
          >
            <option value="" disabled>Select who is reporting</option>
            <option value="victim">Victim-Survivor</option>
            <option value="companion">Companion (victim present)</option>
            <option value="informant">Informant (victim not present)</option>
          </select>
        </div>
      </div>

      {/* popup depends on report type */}
      {(formDataState.reporter_identity === "companion" ||
        formDataState.reporter_identity === "informant") && (
          <div>
            <div className="flex flex-col mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name of Informant
              </label>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  className="input"
                  type="text"
                  placeholder="First Name"
                  onChange={(e) => handleChange("inf_fname", e.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Middle Name"
                  onChange={(e) => handleChange("inf_mname", e.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Last Name"
                  onChange={(e) => handleChange("inf_lname", e.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Extension (e.g. Jr., III)"
                  onChange={(e) => handleChange("inf_extension", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship to Victim-Survivor
              </label>
              <select
                className="input w-full"
                value={formDataState.inf_relationship_to_victim || ""}
                onChange={(e) => handleChange("inf_relationship_to_victim", e.target.value)}
              >
                <option value="" disabled>Select Relationship</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Relative">Relative</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Friend">Friend</option>
                <option value="Co-worker">Co-worker</option>
                <option value="Barangay Official">Barangay Official</option>
                <option value="Social Worker">Social Worker</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="flex flex-col mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Information
              </label>
              <div>
                <input
                  className="input"
                  type="text"
                  placeholder="09XX-XXX-XXXX"
                  onChange={(e) => handleChange("inf_contact", e.target.value)}
                />
              </div>
            </div>
            
            {/* Birth Date */}
            <div className="flex flex-col mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                className="input"
                type="date"
                onChange={(e) => handleChange("inf_birth_date", e.target.value)}
              />
            </div>

            {/* Occupation */}
            <div className="flex flex-col mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Farmer, Teacher"
                onChange={(e) => handleChange("inf_occupation", e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="flex flex-col mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Informant Address
              </label>
              <input
                className="input"
                type="text"
                placeholder="Street, Barangay, Municipality, Province"
                onChange={(e) => handleChange("inf_address", e.target.value)}
              />
            </div>
          </div>

        )}

    </div >
  );
}
