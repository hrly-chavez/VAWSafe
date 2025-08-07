import { useState } from "react";

const AdministrativeInfo = () => {
  const [reportType, setReportType] = useState("");

  return (
    <div className="p-6 bg-white shadow-md rounded-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
        Administrative Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Handling Organization
          </label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
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
            placeholder="e.g. Quezon City, Metro Manila"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Select report type</option>
            <option value="Reported by the victim-survivor">
              Reported by the victim-survivor
            </option>
            <option value="Reported by victim-survivor's companion and victim-survivor is present">
              Reported by victim-survivor's companion and victim-survivor is
              present
            </option>
            <option value="Reported by informant and victim-survivor is not present at reporting">
              Reported by informant and victim-survivor is not present at
              reporting
            </option>
          </select>
        </div>
      </div>

      {reportType !== "Reported by the victim-survivor" &&
        reportType !== "" && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Informant Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name of Informant
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship to Victim
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="e.g. Friend, Relative"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Information
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="e.g. 0917 123 4567"
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdministrativeInfo;
