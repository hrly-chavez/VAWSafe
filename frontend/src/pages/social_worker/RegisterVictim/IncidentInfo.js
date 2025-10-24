//src/pages/desk_officer/RegisterVictim/IncidentInfo.js
import { useState, useEffect } from "react";
import axios from "axios";

export default function IncidentInfo({ formDataState, setFormDataState }) {
  const VIOLENCE_OPTIONS = {
    Physical: [
    ],
    Sexual: [
      "Rape",
      "Acts of lasciviousness",
      "Incest",
    ],
    Psychological: [
    ],
    Economic: [
    ],
  };

  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProvinceChange = (value) => {
  setSelectedProvince(value);
  handleChange("selectedProvince", value);
};

const handleMunicipalityChange = (value) => {
  setSelectedMunicipality(value);
  handleChange("selectedMunicipality", value);
};

const handleBarangayChange = (value) => {
  setSelectedBarangay(value);
  handleChange("selectedBarangay", value);
};

const handleSitioChange = (value) => {
  setSitio(value);
  handleChange("sitio", value);
};

const handleStreetChange = (value) => {
  setStreet(value);
  handleChange("street", value);
};

  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  const [sitio, setSitio] = useState("");
  const [street, setStreet] = useState("");

  // Fetch provinces
  useEffect(() => {
    axios.get("http://localhost:8000/api/desk_officer/provinces/")
      .then((res) => setProvinces(res.data))   // <-- store provinces
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Fetch municipalities based on selected province
  useEffect(() => {
    if (selectedProvince) {
      axios.get(`http://localhost:8000/api/desk_officer/provinces/${selectedProvince}/municipalities/`)
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
      axios.get(`http://localhost:8000/api/desk_officer/municipalities/${selectedMunicipality}/barangays/`)
        .then((res) => setBarangays(res.data))
        .catch((err) => console.error("Failed to load barangays:", err));
    } else {
      setBarangays([]);
    }
  }, [selectedMunicipality]);

  // Toggle helpers: clear dependent fields when flag is false
  const toggleElectronic = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_via_electronic_means: checked,
      electronic_means: checked ? prev.electronic_means || "" : "",
    }));
  };

  const toggleConflict = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_conflict_area: checked,
      conflict_area: checked ? prev.conflict_area || "" : "",
    }));
  };

  const toggleCalamity = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_calamity_area: checked,
      calamity_type: checked ? prev.calamity_type || "" : "",
    }));
  };

  const inputStyle =
    "px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Incident Information
      </h2>

      {/* Violence Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type Of Violence
        </label>
        <select
          className="input"
          value={formDataState.violence_type || ""}
          onChange={(e) => handleChange("violence_type", e.target.value)}
        >
          <option value="">Select</option>
          {Object.keys(VIOLENCE_OPTIONS).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Violence Subtype */}
      {formDataState.violence_type &&
        VIOLENCE_OPTIONS[formDataState.violence_type]?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Violence Subtype
            </label>
            <select
              className="input"
              value={formDataState.violence_subtype || ""}
              onChange={(e) => handleChange("violence_subtype", e.target.value)}
            >
              <option value="">Select</option>
              {VIOLENCE_OPTIONS[formDataState.violence_type].map((subtype) => (
                <option key={subtype} value={subtype}>
                  {subtype}
                </option>
              ))}
            </select>
          </div>
        )}

      {/* details of the incident */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Details of the Incident
        </label>
        <textarea
          type="text"
          placeholder="e.g. Physical altercation at workplace"
          rows={3}
          className="input w-full"
          onChange={(e) => handleChange("incident_description", e.target.value)}
        ></textarea>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of the Incident
          </label>
          <input
            type="date"
            className="input w-full"
            value={formDataState.incident_date || ""}
            onChange={(e) => handleChange("incident_date", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time of the Incident
          </label>
          <input
            type="time"
            className="input w-full"
            value={formDataState.incident_time || ""}
            onChange={(e) => handleChange("incident_time", e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide mb-6">
          Full Incident Address
        </h2>

        <div className="flex flex-col mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedProvince}
            onChange={(e) =>  handleProvinceChange(e.target.value)}
          >
            <option value="" disabled>Select Province</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Municipality
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMunicipality}
            onChange={(e) => handleMunicipalityChange(e.target.value)}
            disabled={!selectedProvince}
          >
            <option value="" disabled>Select Municipality</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Barangay
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedBarangay}
            onChange={(e) => handleBarangayChange(e.target.value)}
            disabled={!selectedMunicipality}
          >
            <option value="" disabled>Select Barangay</option>
            {barangays.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
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
            onChange={(e) => handleSitioChange(e.target.value)}
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
            onChange={(e) => handleStreetChange(e.target.value)}
          />
        </div>
      </div>

      {/* Landmark */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Specific Landmark</label>
        <input
          className="input"
          type="text"
          placeholder="e.g. Near Jollibee"
          value={formDataState.incident_location || ""}
          onChange={(e) => handleChange("incident_location", e.target.value)}
        />
      </div>

      {/* Type of Place */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Type of Place</label>
        <select
          className="input"
          value={formDataState.type_of_place || ""}
          onChange={(e) => handleChange("type_of_place", e.target.value)}
        >
          <option value="" disabled>Select type</option>
          <option value="Conjugal Home">Conjugal Home</option>
          <option value="Evacutaion Area">Evacutaion Area</option>
          <option value="Malls/Hotels">Malls/Hotels</option>
          <option value="Perpetrator's Home">Perpetrator's Home</option>
          <option value="Public Utility Vehicle">Public Utility Vehicle</option>
          <option value="Victim's Home">Victim's Home</option>
          <option value="Workplace">Workplace</option>
        </select>
      </div>

      {/* Electronic Means */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={!!formDataState.is_via_electronic_means}
              onChange={(e) => toggleElectronic(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              Was it perpetrated via electronic means?
            </label>
          </div>
          <p className="text-sm text-gray-500 italic">
            Check the box if <span className="font-medium text-green-700">Yes</span>, uncheck if <span className="font-medium text-red-700">No</span>.
          </p>
        </div>

        {formDataState.is_via_electronic_means ? (
          <div className="flex flex-col justify-center">
            <label className="text-sm font-medium text-gray-700 mb-2">Type of Electronic Means</label>
            <select
              className="input w-full"
              value={formDataState.electronic_means || ""}
              onChange={(e) => handleChange("electronic_means", e.target.value)}
            >
              <option value="" disabled>Select type</option>
              <option value="Social Media">Social Media</option>
              <option value="Messaging App">Messaging App</option>
              <option value="Email">Email</option>
              <option value="Online Platform">Online Platform</option>
              <option value="Others">Others</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-col justify-center text-sm text-gray-400 italic">
            Dropdown will appear once checked.
          </div>
        )}
      </div>

      {/* Conflict Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={!!formDataState.is_conflict_area}
              onChange={(e) => toggleConflict(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              Did it happen in a conflict area?
            </label>
          </div>
          <p className="text-sm text-gray-500 italic">
            Check the box if <span className="font-medium text-green-700">Yes</span>, uncheck if <span className="font-medium text-red-700">No</span>.
          </p>
        </div>

        {formDataState.is_conflict_area ? (
          <div className="flex flex-col justify-center">
            <label className="text-sm font-medium text-gray-700 mb-2">Type of Conflict</label>
            <select
              className="input w-full"
              value={formDataState.conflict_area || ""}
              onChange={(e) => handleChange("conflict_area", e.target.value)}
            >
              <option value="" disabled>Select type</option>
              <option value="Insurgency">Insurgency</option>
              <option value="Violent Extremism">Violent Extremism</option>
              <option value="Tribal Violence">Tribal Violence</option>
              <option value="Political Violence">Political Violence</option>
              <option value="Rido">Rido</option>
              <option value="Others">Others</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-col justify-center text-sm text-gray-400 italic">
            Dropdown will appear once checked.
          </div>
        )}
      </div>

      {/* Calamity Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={!!formDataState.is_calamity_area}
              onChange={(e) => toggleCalamity(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              Did it happen in a calamity area?
            </label>
          </div>
          <p className="text-sm text-gray-500 italic">
            Check the box if <span className="font-medium text-green-700">Yes</span>, uncheck if <span className="font-medium text-red-700">No</span>.
          </p>
        </div>

        {formDataState.is_calamity_area ? (
          <div className="flex flex-col justify-center">
            <label className="text-sm font-medium text-gray-700 mb-2">Type of Calamity</label>
            <select
              className="input w-full"
              value={formDataState.calamity_type || ""}
              onChange={(e) => handleChange("calamity_type", e.target.value)}
            >
              <option value="" disabled>Select type</option>
              <option value="Typhoon">Typhoon</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Flood">Flood</option>
              <option value="Volcanic Eruption">Volcanic Eruption</option>
              <option value="Fire">Fire</option>
              <option value="Pandemic">Pandemic</option>
              <option value="Others">Others</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-col justify-center text-sm text-gray-400 italic">
            Dropdown will appear once checked.
          </div>
        )}
      </div>
    </div>
  );
}

