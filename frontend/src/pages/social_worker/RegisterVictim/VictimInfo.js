//VictimInfo.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function VictimInfo({ formDataState, setFormDataState }) {
  // Utility to calculate if victim is minor
  function isMinor(birthDate) {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    const age =
      today.getFullYear() -
      birth.getFullYear() -
      (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
        ? 1
        : 0);
    return age < 18;
  }

  // Auto-update is_minor when birth date changes
  useEffect(() => {
    const minor = isMinor(formDataState.vic_birth_date);
    setShowGuardian(minor); // show guardian section if minor
  }, [formDataState.vic_birth_date]);

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
  const [showMunicipalityDropdown, setShowMunicipalityDropdown] =
    useState(false);

  const [barangayQuery, setBarangayQuery] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);

  const [sitio, setSitio] = useState("");
  const [street, setStreet] = useState("");

  // Fetch provinces
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/desk_officer/provinces/")
      .then((res) => setProvinces(res.data)) // <-- store provinces
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Fetch municipalities based on selected province
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(
          `http://localhost:8000/api/desk_officer/provinces/${selectedProvince}/municipalities/`
        )
        .then((res) => setMunicipalities(res.data))
        .catch((err) => console.error("Failed to load municipalities:", err));
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [selectedProvince]);

  // Fetch barangays based on selected municipality
  useEffect(() => {
    if (selectedMunicipality) {
      axios
        .get(
          `http://localhost:8000/api/desk_officer/municipalities/${selectedMunicipality}/barangays/`
        )
        .then((res) => setBarangays(res.data))
        .catch((err) => console.error("Failed to load barangays:", err));
    } else {
      setBarangays([]);
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    const provinceName = provinces.find(
      (c) => c.id === parseInt(selectedProvince)
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
    handleChange("vic_current_address", fullAddress);
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

  const [showGuardian, setShowGuardian] = useState(false);

  const inputStyle =
    "px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Victim-Survivor Information
      </h2>

      {/* Name */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="input"
            type="text"
            placeholder="First Name"
            onChange={(e) => handleChange("vic_first_name", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Middle Name"
            onChange={(e) => handleChange("vic_middle_name", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Last Name"
            onChange={(e) => handleChange("vic_last_name", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Extension (e.g. Jr., III)"
            onChange={(e) => handleChange("vic_extension", e.target.value)}
          />
        </div>
      </div>

      {/* Sex + SOGIE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SOGIE
          </label>
          <select
            className="input w-full"
            onChange={(e) => handleChange("vic_is_SOGIE", e.target.value)}
          >
            <option value="" disabled>
              Select SOGIE
            </option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Does not want to identify">
              Does not want to identify
            </option>
          </select>
        </div>

        {formDataState.vic_is_SOGIE === "Yes" && (
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specify SOGIE Identity
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Transgender Woman, Gay, Lesbian, Bisexual"
              onChange={(e) =>
                handleChange("vic_specific_sogie", e.target.value)
              }
            />
          </div>
        )}
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Number
        </label>
        <input
          className="input w-full"
          type="text"
          placeholder="Contact Number"
          value={formDataState.vic_contact_number || ""}
          onChange={(e) => handleChange("vic_contact_number", e.target.value)}
        />
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col mb-6 relative">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Province
          </label>
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
                      handleChange("selectedProvince", p.id.toString());
                    }}
                  >
                    {p.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col mb-6 relative">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Municipality
          </label>
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
            onBlur={() =>
              setTimeout(() => setShowMunicipalityDropdown(false), 150)
            }
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
                      handleChange("selectedMunicipality", m.id.toString());
                    }}
                  >
                    {m.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col mb-6 relative">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Barangay
          </label>
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
                      handleChange("selectedBarangay", b.id.toString());
                    }}
                  >
                    {b.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* Sitio (optional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Sitio
          </label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Sitio (optional)"
            value={sitio}
            onChange={(e) => {
              setSitio(e.target.value);
              handleChange("sitio", e.target.value);
            }}
          />
        </div>

        {/* Street (optional) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Street (optional)"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              handleChange("street", e.target.value);
            }}
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Victim-Survivor Full Address
          </label>
          <input
            type="text"
            value={formDataState.vic_current_address || ""}
            readOnly
            placeholder="Auto-generated based on selected location"
            className={`${inputStyle} bg-gray-100 text-gray-700`}
          />
        </div>
      </div>

      {/* Birth Details */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Birth Details
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="input"
            type="date"
            value={formDataState.vic_birth_date || ""}
            onChange={(e) => handleChange("vic_birth_date", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Birth Place"
            value={formDataState.vic_birth_place || ""}
            onChange={(e) => handleChange("vic_birth_place", e.target.value)}
          />
        </div>
      </div>

      {/* Guardian details if minor */}
      {showGuardian && (
        <div className="flex flex-col mb-6">
          <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide mb-6">
            Guardian Information
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Guardian Full Name
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                  className="input w-full"
                  type="text"
                  placeholder="First Name"
                  onChange={(e) =>
                    handleChange("vic_guardian_fname", e.target.value)
                  }
                />
                <input
                  className="input w-full"
                  type="text"
                  placeholder="Middle Name"
                  onChange={(e) =>
                    handleChange("vic_guardian_mname", e.target.value)
                  }
                />
                <input
                  className="input w-full"
                  type="text"
                  placeholder="Last Name"
                  onChange={(e) =>
                    handleChange("vic_guardian_lname", e.target.value)
                  }
                />
                <input
                  className="input w-full"
                  type="text"
                  placeholder="Contact Number"
                  maxLength={11}
                  onChange={(e) =>
                    handleChange("vic_guardian_contact", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Child Classification */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                If applicable, indicate if the child is:
              </label>
              <select
                className="input w-full"
                value={formDataState.vic_child_class || ""}
                onChange={(e) =>
                  handleChange("vic_child_class", e.target.value)
                }
              >
                <option value="" disabled>
                  Select classification
                </option>
                <option value="Orphan">Orphan</option>
                <option value="Unaccompanied">Unaccompanied</option>
                <option value="Separated">Separated</option>
                <option value="Vulnerable">Vulnerable</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Nationality + Ethnicity + Religion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Nationality
          </label>
          <select
            className="input"
            value={formDataState.vic_nationality || ""}
            onChange={(e) => handleChange("vic_nationality", e.target.value)}
          >
            <option value="" disabled>
              Select Nationality
            </option>
            <option value="Filipino">Filipino</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Religion
          </label>
          <select
            className="input"
            value={formDataState.vic_religion || ""}
            onChange={(e) => handleChange("vic_religion", e.target.value)}
          >
            <option value="" disabled>
              Select Religion
            </option>
            <option value="Roman Catholic">Roman Catholic</option>
            <option value="Protestant">Protestant</option>
            <option value="Evangelical">Evangelical</option>
            <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
            <option value="Islam">Islam</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Ethnicity
          </label>
          <select
            className="input"
            value={formDataState.vic_ethnicity || ""}
            onChange={(e) => handleChange("vic_ethnicity", e.target.value)}
          >
            <option value="" disabled>
              Select Ethnicity
            </option>
            <option value="Cebuano">Cebuano</option>
            <option value="Boholano">Boholano</option>
            <option value="Tagalog">Tagalog</option>
            <option value="Hiligaynon/Ilonggo">Hiligaynon/Ilonggo</option>
            <option value="Waray">Waray</option>
            <option value="Chinese Filipino">Chinese Filipino</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>

      {/* Civil status, education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Civil Status
          </label>
          <select
            className="input w-full"
            value={formDataState.vic_civil_status || ""}
            onChange={(e) => handleChange("vic_civil_status", e.target.value)}
          >
            <option value="" disabled>
              Select Civil Status
            </option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="WIDOWED">Widowed</option>
            <option value="SEPARATED">Separated</option>
            <option value="DIVORCED">Divorced</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Migratory Status
          </label>
          <select
            className="input"
            value={formDataState.vic_migratory_status || ""}
            onChange={(e) =>
              handleChange("vic_migratory_status", e.target.value)
            }
          >
            <option value="" disabled>
              Select Migratory Status
            </option>
            <option value="Current OFW">Current OFW</option>
            <option value="Former/Returning OFW">Former/Returning OFW</option>
            <option value="Seeking employment abroad">
              Seeking employment abroad
            </option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>
      </div>

      {/* Employment Status + Educational Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Employment Status
          </label>
          <select
            className="input"
            value={formDataState.vic_employment_status || ""}
            onChange={(e) =>
              handleChange("vic_employment_status", e.target.value)
            }
          >
            <option value="" disabled>
              Select Employment Status
            </option>
            <option value="Employed">Employed</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Informal Sector">Informal Sector</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Educational Attainment
          </label>
          <select
            className="input w-full"
            value={formDataState.vic_educational_attainment || ""}
            onChange={(e) =>
              handleChange("vic_educational_attainment", e.target.value)
            }
          >
            <option value="" disabled>
              Select Educational Level
            </option>
            <option value="No Formal Education">No Formal Education</option>
            <option value="Elementary Level/Graduate">
              Elementary Level/Graduate
            </option>
            <option value="Junior High School Level/Graduate">
              Junior High School Level/Graduate
            </option>
            <option value="Senior High School Level/Graduate">
              Senior High School Level/Graduate
            </option>
            <option value="Technical/Vocational">Technical/Vocational</option>
            <option value="College Level/Graduate">
              College Level/Graduate
            </option>
            <option value="Post graduate">Post graduate</option>
          </select>
        </div>
      </div>

      {/* Displacement + PWD Type (conditional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left: Checkbox + Label + Instruction */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={!!formDataState.vic_is_displaced}
              onChange={(e) =>
                handleChange("vic_is_displaced", e.target.checked)
              }
            />
            <label className="text-sm font-medium text-gray-700">
              Is the client internally displaced?
            </label>
          </div>
          <p className="text-sm text-gray-500 italic">
            Check the box if{" "}
            <span className="font-medium text-green-700">Yes</span>, uncheck if{" "}
            <span className="font-medium text-red-700">No</span>.
          </p>
        </div>

        {/* Right: PWD Type Dropdown (conditional) */}
        {formDataState.vic_is_displaced ? (
          <div className="flex flex-col justify-center">
            <label className="text-sm font-medium text-gray-700 mb-2">
              PWD Type
            </label>
            <select
              className="input w-full"
              value={formDataState.vic_PWD_type || ""}
              onChange={(e) => handleChange("vic_PWD_type", e.target.value)}
            >
              <option value="" disabled>
                Select PWD Type
              </option>
              <option value="None">None</option>
              <option value="Deaf or Hard of Hearing">
                Deaf or Hard of Hearing
              </option>
              <option value="Intellectual Disability">
                Intellectual Disability
              </option>
              <option value="Learning Disability">Learning Disability</option>
              <option value="Mental Disability">Mental Disability</option>
              <option value="Orthopedic Disability">
                Orthopedic Disability
              </option>
              <option value="Physical Disability">Physical Disability</option>
              <option value="Psychological Disability">
                Psychological Disability
              </option>
              <option value="Speech and Language Disability">
                Speech and Language Disability
              </option>
              <option value="Visual Disability">Visual Disability</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-col justify-center text-sm text-gray-400 italic">
            PWD Type will appear once displacement is checked.
          </div>
        )}
      </div>
    </div>
  );
}
