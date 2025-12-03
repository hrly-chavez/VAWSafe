// src/components/PerpetratorInfo.js
import { useEffect } from "react";
import { NATIONALITIES } from "./helpers/Nationalities";
import { formatPHNumber } from "./helpers/input-validators";

export default function PerpetratorInfo({
  formDataState,
  setFormDataState,
  isLocked,
}) {
  const handleChange = (field, value) =>
    setFormDataState((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Alleged Perpetrator Information
      </h2>

      {/* Name */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* First Name */}
          <div className="flex flex-col">
            <input
              readOnly={isLocked}
              disabled={isLocked}
              className="input"
              type="text"
              placeholder="First Name"
              value={formDataState.per_first_name || ""}
              onChange={(e) => handleChange("per_first_name", e.target.value)}
              required
            />
            {!formDataState.per_first_name && (
              <span className="text-xs text-red-500 mt-1">Required</span>
            )}
          </div>

          {/* Middle Name */}
          <div className="flex flex-col">
            <input
              readOnly={isLocked}
              disabled={isLocked}
              className="input"
              type="text"
              placeholder="Middle Name"
              value={formDataState.per_middle_name || ""}
              onChange={(e) => handleChange("per_middle_name", e.target.value)}
              required
            />
            {!formDataState.per_middle_name && (
              <span className="text-xs text-red-500 mt-1">Required</span>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <input
              readOnly={isLocked}
              disabled={isLocked}
              className="input"
              type="text"
              placeholder="Last Name"
              value={formDataState.per_last_name || ""}
              onChange={(e) => handleChange("per_last_name", e.target.value)}
              required
            />
            {!formDataState.per_last_name && (
              <span className="text-xs text-red-500 mt-1">Required</span>
            )}
          </div>

          {/* Extension (optional, no Required text) */}
          <div className="flex flex-col">
            <select
              readOnly={isLocked}
              disabled={isLocked}
              className="input"
              value={formDataState.per_extension || ""}
              onChange={(e) => handleChange("per_extension", e.target.value)}
            >
              <option value="">Select Extension</option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
              <option value="">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nickname/Alias */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nickname/Alias
        </label>
        <div>
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            placeholder="Nickname/Alias"
            value={formDataState.per_alias || ""}
            onChange={(e) => handleChange("per_alias", e.target.value)}
          />
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
              value={formDataState.per_birth_date || ""}
              onChange={(e) => handleChange("per_birth_date", e.target.value)}
            />
            {!formDataState.per_birth_date && (
              <span className="text-xs text-red-500 mt-1">Required</span>
            )}
          </div>

          <div className="flex flex-col">
            <input
              readOnly={isLocked}
              disabled={isLocked}
              className="input"
              type="text"
              placeholder="Birth Place"
              value={formDataState.per_birth_place || ""}
              onChange={(e) => handleChange("per_birth_place", e.target.value)}
            />
            {!formDataState.per_birth_place && (
              <span className="text-xs text-red-500 mt-1">Required</span>
            )}
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
          value={formDataState.per_sex || ""}
          onChange={(e) => handleChange("per_sex", e.target.value)}
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      {/* Religion */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Religion
        </label>
        <select
          readOnly={isLocked}
          disabled={isLocked}
          className="input w-full"
          value={formDataState.per_religion || ""}
          onChange={(e) => handleChange("per_religion", e.target.value)}
        >
          <option value="">Select Religion</option>
          <option value="Roman Catholic">Roman Catholic</option>
          <option value="Islam">Islam</option>
          <option value="Evangelicals">Evangelicals</option>
          <option value="Protestant">Protestant</option>
          <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {/* relationship to victim */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relationship to Victim
        </label>
        <div>
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            placeholder="e.g. Siblings"
            value={formDataState.per_victim_relationship || ""}
            onChange={(e) =>
              handleChange("per_victim_relationship", e.target.value)
            }
          />
        </div>
      </div>

      {/* Educational Status */}
      <div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Educational Attainment
          </label>
          <select
            readOnly={isLocked}
            disabled={isLocked}
            className="input w-full"
            value={formDataState.per_educational_attainment || ""}
            onChange={(e) =>
              handleChange("per_educational_attainment", e.target.value)
            }
          >
            <option value="No Formal Education">
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

      {/* Known Address */}
      <div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Known Address
          </label>
          <input
            readOnly={isLocked}
            disabled={isLocked}
            className="input"
            type="text"
            value={formDataState.per_known_address || ""}
            onChange={(e) => handleChange("per_known_address", e.target.value)}
          />
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
            value={formDataState.per_contact_number || ""}
            onChange={(e) =>
              handleChange("per_contact_number", formatPHNumber(e.target.value))
            }
          />
        </div>
      </div>

      {/* Occupation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Main Occupation
        </label>
        <input
          readOnly={isLocked}
          disabled={isLocked}
          className="input w-full"
          type="text"
          placeholder="Main Occupation"
          value={formDataState.per_occupation || ""}
          onChange={(e) => handleChange("per_occupation", e.target.value)}
        />
      </div>
    </div>
  );
}
