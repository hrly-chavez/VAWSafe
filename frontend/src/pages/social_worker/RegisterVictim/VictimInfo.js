//VictimInfo.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function VictimInfo({ formDataState, setFormDataState }) {
  const handleChange = (key, value) => {
    if (key.includes(".")) {
      const [outerKey, innerKey] = key.split(".");
      setFormDataState((prev) => ({
        ...prev,
        [outerKey]: {
          ...prev[outerKey],
          [innerKey]: value,
        },
      }));
    } else {
      setFormDataState((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // setup
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
    if (formDataState.address.province) {
      axios
        .get(
          `http://localhost:8000/api/desk_officer/provinces/${formDataState.address.province}/municipalities/`
        )
        .then((res) => setMunicipalities(res.data))
        .catch((err) => console.error("Failed to load municipalities:", err));
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [formDataState.address.province]);

  // Fetch barangays based on selected municipality
  useEffect(() => {
    if (formDataState.address.municipality) {
      axios
        .get(
          `http://localhost:8000/api/desk_officer/municipalities/${formDataState.address.municipality}/barangays/`
        )
        .then((res) => setBarangays(res.data))
        .catch((err) => console.error("Failed to load barangays:", err));
    } else {
      setBarangays([]);
    }
  }, [formDataState.address.municipality]);

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

      {/* Nickname/Alias */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nickname/Alias
        </label>
        <div>
          <input
            className="input"
            type="text"
            placeholder="Nickname/Alias"
            onChange={(e) => handleChange("vic_alias", e.target.value)}
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

      {/* Civil status */}
      <div>
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
      </div>

      {/* Religion */}
      <div>
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
      </div>

      {/* Educational Status */}
      <div className="space-y-4">
        {/* Educational Attainment */}
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
            <option value="Elementary Level/Graduate">Elementary Level/Graduate</option>
            <option value="Junior High School Level/Graduate">Junior High School Level/Graduate</option>
            <option value="Senior High School Level/Graduate">Senior High School Level/Graduate</option>
            <option value="Technical/Vocational">Technical/Vocational</option>
            <option value="College Level/Graduate">College Level/Graduate</option>
            <option value="Post graduate">Post graduate</option>
          </select>
        </div>

        {/* OS/OSY and School Years in a single row */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          {/* OS/OSY */}
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OS/OSY Status
            </label>
            <select
              className="input w-full"
              value={formDataState.vic_school_type || ""}
              onChange={(e) => handleChange("vic_school_type", e.target.value)}
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="SY">SY</option>
              <option value="OSY">OSY</option>
            </select>
          </div>

          {/* School Years */}
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Years
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Enter School Years"
              value={formDataState.vic_school_years || ""}
              onChange={(e) => handleChange("vic_school_years", e.target.value)}
            />
          </div>
        </div>
      </div>


      {/* last school name and address */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          School Last Attended and Address
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="input"
            type="text"
            placeholder="School Name"
            onChange={(e) =>
              handleChange("vic_last_school_attended", e.target.value)
            }
          />
          <input
            className="input"
            type="text"
            placeholder="School Address"
            onChange={(e) =>
              handleChange("vic_last_school_address", e.target.value)
            }
          />
        </div>
      </div>

      <hr></hr>
      {/* occupation, income, skills */}
      <div className="flex flex-col mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="input"
            type="text"
            placeholder="Occupation"
            onChange={(e) => handleChange("vic_occupation", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Income"
            onChange={(e) => handleChange("vic_income", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Skills"
            onChange={(e) => handleChange("vic_skills", e.target.value)}
          />
        </div>
      </div>

      {/* present Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col mb-6 relative">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Province
          </label>
          <select
            value={formDataState.address.province || ""}
            onChange={(e) => handleChange("address.province", e.target.value)}
            className={inputStyle}
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col mb-6 relative">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Municipality
          </label>
          <select
            value={formDataState.address.municipality || ""}
            onChange={(e) =>
              handleChange("address.municipality", e.target.value)
            }
            className={inputStyle}
            disabled={!formDataState.address.province}
          >
            <option value="">Select Municipality</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col mb-6 relative">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Barangay
          </label>
          <select
            value={formDataState.address.barangay || ""}
            onChange={(e) => handleChange("address.barangay", e.target.value)}
            className={inputStyle}
            disabled={!formDataState.address.municipality}
          >
            <option value="">Select Barangay</option>
            {barangays.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telephone/Cellphone No.
        </label>
        <input
          className="input w-full"
          type="text"
          placeholder="Contact Number"
          value={formDataState.vic_contact_number || ""}
          onChange={(e) => handleChange("vic_contact_number", e.target.value)}
        />
      </div>

      {/* provincial address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Provincial Address
        </label>
        <input
          className="input w-full"
          type="text"
          placeholder="Provincial Address"
          onChange={(e) =>
            handleChange("vic_provincial_address", e.target.value)
          }
        />
      </div>
    </div>
  );
}
