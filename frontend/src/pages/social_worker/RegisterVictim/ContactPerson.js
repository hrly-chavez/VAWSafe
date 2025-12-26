import { useState, useEffect } from "react";
import axios from "axios";
import { formatPHNumber } from "./helpers/input-validators";

export default function ContactPerson({
  formDataState,
  setFormDataState,
  isLocked,
}) {
  const handleChange = (field, value) => {
    // Strip out < and > characters
    const sanitizedValue = value.replace(/[<>]/g, "");

    setFormDataState((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));
  };

  // fetch choices
  const [civilStatusOptions, setCivilStatusOptions] = useState([]);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const [sexOptions, setSexOptions] = useState([]);
  const [relationshipOptions, setRelationshipOptions] = useState([]);

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const [civilRes, extensionRes, sexRes, relationshipRes] =
          await Promise.all([
            axios.get(
              "http://localhost:8000/api/social_worker/civil-status-choices/"
            ),
            axios.get(
              "http://localhost:8000/api/social_worker/extension-choices/"
            ),
            axios.get("http://localhost:8000/api/social_worker/sex-choices/"),
            axios.get(
              "http://localhost:8000/api/social_worker/relationship-choices/"
            ),
          ]);

        // logs to see if data is passed
        console.log("CIVIL STATUS:", civilRes.data);

        setCivilStatusOptions(civilRes.data);
        setExtensionOptions(extensionRes.data);
        setSexOptions(sexRes.data);
        setRelationshipOptions(relationshipRes.data);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    fetchChoices();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            placeholder="First Name"
            value={formDataState.cont_fname || ""}
            onChange={(e) => handleChange("cont_fname", e.target.value)}
          />
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            placeholder="Middle Name"
            value={formDataState.cont_mname || ""}
            onChange={(e) => handleChange("cont_mname", e.target.value)}
          />
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            placeholder="Last Name"
            value={formDataState.cont_lname || ""}
            onChange={(e) => handleChange("cont_lname", e.target.value)}
          />
          <select
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            placeholder="Extension (e.g. Jr., III)"
            value={formDataState.cont_ext || ""}
            onChange={(e) => handleChange("cont_ext", e.target.value)}
          >
            <option value="">Select Extension</option>
            {extensionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Birth Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Birth Details
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input
              readOnly={isLocked}
              disabled={isLocked}
              className="input"
              type="date"
              required // ✅ enforce required
              value={formDataState.cont_birth_date || ""}
              onChange={(e) => handleChange("cont_birth_date", e.target.value)}
            />
            {/* {!formDataState.cont_birth_date && (
              <span className="text-xs text-red-500 mt-1">Required</span>
            )} */}
          </div>

          <div className="flex flex-col">
            <input
              readOnly={isLocked}
              disabled={isLocked}
              className="input"
              type="text"
              placeholder="Birth Place"
              value={formDataState.cont_birth_place || ""}
              onChange={(e) => handleChange("cont_birth_place", e.target.value)}
            />
            {/* {!formDataState.cont_birth_place && (
              <span className="text-xs text-red-500 mt-1">Required</span>
            )} */}
          </div>
        </div>
      </div>

      {/* Sex */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sex
        </label>
        <select
          readOnly={isLocked}
          disabled={isLocked}
          className="input w-full"
          value={formDataState.cont_sex || ""}
          onChange={(e) => handleChange("cont_sex", e.target.value)}
        >
          <option value="">Select Sex</option>
          {sexOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Civil status */}
      <div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Civil Status
          </label>
          <select
            readOnly={isLocked}
            disabled={isLocked}
            className="input w-full"
            value={formDataState.cont_civil_status || ""}
            onChange={(e) => handleChange("cont_civil_status", e.target.value)}
          >
            <option>Select Civil Status</option>
            {civilStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* relationship to victim */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relationship to Victim
        </label>
        <div>
          <select
            readOnly={isLocked}
            disabled={isLocked}
            className="input w-full"
            value={formDataState.cont_victim_relationship || ""}
            onChange={(e) =>
              handleChange("cont_victim_relationship", e.target.value)
            }
          >
            <option>Select Relationship</option>
            {relationshipOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact */}
      <div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number
          </label>
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            placeholder="e.g. 09123456789"
            value={formDataState.cont_contact_number || ""}
            onChange={(e) =>
              handleChange(
                "cont_contact_number",
                formatPHNumber(e.target.value)
              )
            }
          />
        </div>
      </div>

      {/* provincial address */}
      <div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provincial Address
          </label>
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            placeholder="e.g. Samar Leyte"
            value={formDataState.cont_prov_address || ""}
            onChange={(e) => handleChange("cont_prov_address", e.target.value)}
          />
        </div>
      </div>

      {/* work address */}
      <div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Address
          </label>
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            placeholder="e.g. IT Park"
            value={formDataState.cont_work_address || ""}
            onChange={(e) => handleChange("cont_work_address", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
