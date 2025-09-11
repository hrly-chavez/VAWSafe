// src/pages/desk_officer/RegisterVictim/AdministrativeInfo.js
export default function AdministrativeInfo({
  formDataState,
  setFormDataState,
  cancel,
  next,
}) {
  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={formDataState.handling_org || ""}
            onChange={onTrimmed("handling_org")}
            placeholder="e.g. DSWD"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office Address
          </label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={formDataState.office_address || ""}
            onChange={onTrimmed("office_address")}
            placeholder="e.g. Quezon City, Metro Manila"
          />
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
