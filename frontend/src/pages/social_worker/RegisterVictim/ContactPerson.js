export default function ContactPerson({ formDataState, setFormDataState }) {
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
            className="input"
            type="text"
            placeholder="First Name"
            onChange={(e) => handleChange("cont_fname", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Middle Name"
            onChange={(e) => handleChange("cont_mname", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Last Name"
            onChange={(e) => handleChange("cont_lname", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Extension (e.g. Jr., III)"
            onChange={(e) => handleChange("cont_ext", e.target.value)}
          />
        </div>
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
            onChange={(e) => handleChange("cont_birth_date", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Birth Place"
            onChange={(e) => handleChange("cont_birth_place", e.target.value)}
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
            className="input w-full"
            onChange={(e) => handleChange("cont_civil_status", e.target.value)}
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

      {/* relationship to victim */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relationship to Victim
        </label>
        <div>
          <input
            className="input"
            type="text"
            placeholder="e.g. Siblings"
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
            className="input"
            type="text"
            placeholder="e.g. 09123456789"
            onChange={(e) =>
              handleChange("cont_contact_number", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
}
