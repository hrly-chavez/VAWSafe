export default function Schedule() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Session Forms
      </h2>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location Address</label>
        <input
          type="text"
          placeholder="e.g. Barangay Hall, Cebu City"
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      {/* Region Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Region", "Province", "City/Municipality", "Barangay"].map((label) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
              <option value="">Select {label}</option>
            </select>
          </div>
        ))}
      </div>

      {/* Session Type & Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type of Session</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <option value="">Select Type</option>
            <option value="Counseling">Counseling</option>
            <option value="Legal Advice">Legal Advice</option>
            <option value="Medical">Medical</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attended?</label>
          <div className="flex items-center space-x-4 mt-1">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="radio" name="attended" />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="radio" name="attended" />
              <span>No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
