// src/pages/desk_officer/RegisterVictim/AdministrativeInfo.js
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
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Administrative Information
      </h2>

      {/* Handling Organization / Office Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Handling Organization
          </label>
          <input
            type="text"
            placeholder="e.g. DSWD"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.handling_org || ""}
            onChange={onTrimmed("handling_org")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office Address
          </label>
          <input
            type="text"
            placeholder="e.g. Quezon City, Metro Manila"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.office_address || ""}
            onChange={onTrimmed("office_address")}
          />
        </div>

        {/* Report Type */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white"
            value={formDataState.report_type || ""}
            onChange={(e) => handleReportType(e.target.value)}
          >
            <option value="">Select report type</option>
            <option value="Reported by the victim-survivor">
              Reported by the victim-survivor
            </option>
            <option value="Reported by victim-survivor's companion and victim-survivor is present">
              Reported by victim-survivor's companion and victim-survivor is present
            </option>
            <option value="Reported by informant and victim-survivor is not present at reporting">
              Reported by informant and victim-survivor is not present at reporting
            </option>
          </select>
        </div>
      </div>

      {/* Informant details (only when applicable) */}
      {showInformant && (
        <div className="mt-6 border-t pt-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 tracking-wide">
            Informant Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name of Informant
              </label>
              <input
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                value={formDataState.informant_name || ""}
                onChange={onTrimmed("informant_name")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship to Victim
              </label>
              <input
                type="text"
                placeholder="e.g. Friend, Relative"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                value={formDataState.informant_relationship || ""}
                onChange={onTrimmed("informant_relationship")}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Information
              </label>
              <input
                type="text"
                placeholder="e.g. 0917 123 4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                value={formDataState.informant_contact || ""}
                onChange={onTrimmed("informant_contact")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
