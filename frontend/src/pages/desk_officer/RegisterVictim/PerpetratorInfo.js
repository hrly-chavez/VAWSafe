// src/components/PerpetratorInfo.js
import { useEffect } from "react";

export default function PerpetratorInfo({
  formDataState,
  setFormDataState,
  back,
  submit,
  loading,
}) {
  const isMinor = (birthDate) => {
    if (!birthDate) return false;
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    return (
      age < 18 ||
      (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
    );
  };

  useEffect(() => {
    const minor = isMinor(formDataState.per_birth_date);
    setFormDataState((prev) => ({
      ...prev,
      is_per_minor: minor,
    }));
  }, [formDataState.per_birth_date, setFormDataState]);

  const handleChange = (field, value) =>
    setFormDataState((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Alleged Perpetrator Information
      </h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="input"
            type="text"
            placeholder="First Name"
            value={formDataState.per_first_name || ""}
            onChange={(e) => handleChange("per_first_name", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Middle Name"
            value={formDataState.per_middle_name || ""}
            onChange={(e) => handleChange("per_middle_name", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Last Name"
            value={formDataState.per_last_name || ""}
            onChange={(e) => handleChange("per_last_name", e.target.value)}
          />
        </div>
      </div>

      {/* Sex */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sex
        </label>
        <select
          className="input w-full"
          value={formDataState.per_sex || ""}
          onChange={(e) => handleChange("per_sex", e.target.value)}
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      {/* Birth Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Birth Details
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="input"
            type="date"
            value={formDataState.per_birth_date || ""}
            onChange={(e) => handleChange("per_birth_date", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Birth Place"
            value={formDataState.per_birth_place || ""}
            onChange={(e) => handleChange("per_birth_place", e.target.value)}
          />
        </div>
      </div>

      {/* Guardian details if perpetrator is minor */}
      {formDataState.is_per_minor && (
        <>
          <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md">
            This perpetrator is identified as a minor. Please ensure child
            protection protocols are followed.
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 tracking-wide">
            Guardian Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <input
              className="input"
              type="text"
              placeholder="Guardian First Name"
              value={formDataState.guardian_first_name || ""}
              onChange={(e) =>
                handleChange("guardian_first_name", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Middle Name"
              value={formDataState.guardian_middle_name || ""}
              onChange={(e) =>
                handleChange("guardian_middle_name", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Last Name"
              value={formDataState.guardian_last_name || ""}
              onChange={(e) =>
                handleChange("guardian_last_name", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Contact"
              value={formDataState.guardian_contact || ""}
              onChange={(e) => handleChange("guardian_contact", e.target.value)}
            />
          </div>
        </>
      )}

      {/* Occupation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Main Occupation
        </label>
        <input
          className="input w-full"
          type="text"
          placeholder="Main Occupation"
          value={formDataState.per_occupation || ""}
          onChange={(e) => handleChange("per_occupation", e.target.value)}
        />
      </div>

      {/* Religion */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Religion
        </label>
        <select
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

      {/* Actions (if needed) */}
      {back || submit ? (
        <div className="flex justify-between mt-6">
          {back && (
            <button
              type="button"
              onClick={back}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Back
            </button>
          )}
          {submit && (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
