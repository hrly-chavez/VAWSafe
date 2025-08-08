export default function IncidentInfo() {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
        Incident Information
      </h2>

      {/* Incident Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Details of the Incident
          </label>
          <input
            type="text"
            placeholder="e.g. Physical altercation at workplace"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of the Incident
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geographic Location of the Incident
          </label>
          <input
            type="text"
            placeholder="e.g. Davao City"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type of Place of Incident
          </label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="">Select a place type</option>
            <option value="Conjugal Home">Conjugal Home</option>
            <option value="Victim's Home">Victim's Home</option>
            <option value="Perpetrator's Home">Perpetrator's Home</option>
            <option value="Malls/Hotels">Malls/Hotels</option>
            <option value="School">School</option>
            <option value="Workplace">Workplace</option>
            <option value="Public Utility Vehicle (PUV)">
              Public Utility Vehicle (PUV)
            </option>
            <option value="Evacuation area">Evacuation area</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Conditionally shown when "Others" is selected */}
        <input
          type="text"
          placeholder="Specify other place"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Checkbox Sections */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">
            Was the incident perpetuated via electronic means?
          </label>
          <input type="checkbox" className="w-4 h-4" />
        </div>

        {/* Shown when "No" is selected (to be implemented) */}
        <input
          type="text"
          placeholder="Specify electronic means"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">
            Was the incident a result of a harmful traditional practice?
          </label>
          <input type="checkbox" className="w-4 h-4" />
        </div>

        {/* Shown when "Yes" (or No) is selected (to be implemented) */}
        <input
          type="text"
          placeholder="Specify the practice"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Conflict Area Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">
            Did the incident happen in a conflict area?
          </label>
          <input type="checkbox" className="w-4 h-4" />
        </div>

        {/* Shown if conflict area is true */}
        <div className="space-y-2">
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="">Select type of conflict</option>
            <option value="Insurgency">Insurgency</option>
            <option value="Violent extremism">Violent extremism</option>
            <option value="Tribal Violence">Tribal Violence</option>
            <option value="Political Violence">Political Violence</option>
            <option value="Rido">Rido</option>
            <option value="Others">Others</option>
          </select>

          {/* Shown if "Others" is selected */}
          <input
            type="text"
            placeholder="Specify other conflict type"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Calamity Area Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">
            Did the incident happen in a calamity area?
          </label>
          <input type="checkbox" className="w-4 h-4" />
        </div>

        {/* Shown if calamity area is true */}
        <div className="space-y-2">
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="">Select disaster type</option>
            <option value="Human-induced disaster">
              Human-induced disaster
            </option>
            <option value="Natural Hazard">Natural Hazard</option>
          </select>

          {/* Always shown if applicable */}
          <input
            type="text"
            placeholder="Specify details"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
