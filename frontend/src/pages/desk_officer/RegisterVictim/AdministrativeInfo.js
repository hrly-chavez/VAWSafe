// src/pages/desk_officer/RegisterVictim/AdministrativeInfo.js
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdministrativeInfo({
  formDataState,
  setFormDataState,
}) {
  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [cities, setCities] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  const [sitio, setSitio] = useState("");
  const [street, setStreet] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/api/desk_officer/cities/")
      .then((res) => setCities(res.data))
      .catch((err) => console.error("Failed to load cities:", err));
  }, []);

  useEffect(() => {
    if (selectedCity) {
      axios.get(`http://localhost:8000/api/desk_officer/cities/${selectedCity}/municipalities/`)
        .then((res) => setMunicipalities(res.data))
        .catch((err) => console.error("Failed to load municipalities:", err));
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedMunicipality) {
      axios.get(`http://localhost:8000/api/desk_officer/municipalities/${selectedMunicipality}/barangays/`)
        .then((res) => setBarangays(res.data))
        .catch((err) => console.error("Failed to load barangays:", err));
    } else {
      setBarangays([]);
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    const cityName = cities.find(c => c.id === parseInt(selectedCity))?.name;
    const municipalityName = municipalities.find(m => m.id === parseInt(selectedMunicipality))?.name;
    const barangayName = barangays.find(b => b.id === parseInt(selectedBarangay))?.name;

    const parts = [
      street.trim(),
      sitio.trim(),
      barangayName,
      municipalityName,
      cityName
    ].filter(Boolean);

    const fullAddress = parts.join(", ");
    handleChange("handling_org_full_address", fullAddress);
  }, [selectedCity, selectedMunicipality, selectedBarangay, sitio, street, cities, municipalities, barangays]);

  const handleReportType = (value) => {
    // If the victim is the reporter, clear informant fields
    if (value === "Reported by the victim-survivor") {
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

  const inputStyle = "px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400";

  const onTrimmed = (field) => (e) =>
    handleChange(field, e.target.value.trimStart());

  const showInformant =
    formDataState.report_type &&
    formDataState.report_type !== "Reported by the victim-survivor";

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
        Administrative Information
      </h2>

      {/* Handling Organization / Office Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Handling Organization
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formDataState.handling_org || ""}
            onChange={(e) => handleChange("handling_org", e.target.value)}
          >
            <option value="" disabled>Select organization</option>
            <option value="DSWD">Department of Social Welfare and Development (DSWD)</option>
            <option value="VAWDesk">Barangay VAW Desk</option>
          </select>
        </div>

        {/* Address */}
        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Province</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className={inputStyle}
          >
            <option value="" disabled hidden>Select Province</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Municipality</label>
          <select
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
            className={inputStyle}
            disabled={!selectedCity}
          >
            <option value="" disabled hidden>Select Municipality</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Barangay</label>
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className={inputStyle}
            disabled={!selectedMunicipality}
          >
            <option value="" disabled hidden>Select Barangay</option>
            {barangays.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Sitio</label>
          <input
            type="text"
            placeholder="Sitio Example"
            className={inputStyle}
            value={sitio}
            onChange={(e) => setSitio(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-sm mb-1">Street</label>
          <input
            type="text"
            placeholder="Example Street Name"
            className={inputStyle}
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-col md:col-span-2">
            <label className="font-medium text-sm mb-1">Handling Organization Full Address</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formDataState.report_type || ""}
            onChange={(e) => handleReportType(e.target.value)}
          >
            <option value="">Select report type</option>
            <option value="victim-survivor">
              Reported by the victim-survivor
            </option>
            <option value="companion with victim-survivor">
              Reported by victim-survivor's companion and victim-survivor is
              present
            </option>
            <option value="informant only">
              Reported by informant and victim-survivor is not present at
              reporting
            </option>
          </select>
        </div>
      </div>
      {/* popup depends on report type */}
      {formDataState.report_type !== "victim-survivor" &&
        formDataState.report_type !== "" && (
          <div className="">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of Informant
            </label>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                className="input"
                type="text"
                placeholder="First Name"
              // value={formDataState.vic_first_name || ""}
              // onChange={(e) => handleChange("vic_first_name", e.target.value)}
              />
              <input
                className="input"
                type="text"
                placeholder="Middle Name"
              // value={formDataState.vic_middle_name || ""}
              // onChange={(e) =>
              //   handleChange("vic_middle_name", e.target.value)
              // }
              />
              <input
                className="input"
                type="text"
                placeholder="Last Name"
              // value={formDataState.vic_last_name || ""}
              // onChange={(e) => handleChange("vic_last_name", e.target.value)}
              />
              <input
                className="input"
                type="text"
                placeholder="Extension (e.g. Jr., III)"
              // value={formDataState.vic_extension || ""}
              // onChange={(e) => handleChange("vic_extension", e.target.value)}
              />
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship to victim-survivor
            </label>
            <div>
              <input
                className="input"
                type="text"
                placeholder="Extension (e.g. Jr., III)"
              // value={formDataState.vic_extension || ""}
              // onChange={(e) => handleChange("vic_extension", e.target.value)}
              />
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Information
            </label>
            <div>
              <input
                className="input"
                type="number"
                placeholder="Extension (e.g. Jr., III)"
              // value={formDataState.vic_extension || ""}
              // onChange={(e) => handleChange("vic_extension", e.target.value)}
              />
            </div>
          </div>
        )}
    </div>
  );
}
