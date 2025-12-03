import { formatPHNumber } from "./helpers/input-validators";

export default function ContactPerson({
  formDataState,
  setFormDataState,
  isLocked,
}) {
  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
          <option value="Male">Male</option>
          <option value="Female">Female</option>
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
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="WIDOWED">Widowed</option>
            <option value="SEPARATED">Separated</option>
            <option value="DIVORCED">Divorced</option>
          </select>
        </div>
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
            value={formDataState.cont_victim_relationship || ""}
            onChange={(e) =>
              handleChange("cont_victim_relationship", e.target.value)
            }
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
