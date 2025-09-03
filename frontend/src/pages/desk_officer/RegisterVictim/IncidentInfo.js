export default function IncidentInfo({
  formDataState,
  setFormDataState,
}) {
  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle helpers: clear dependent fields when flag is false
  const toggleElectronic = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_via_electronic_means: checked,
      electronic_means: checked ? prev.electronic_means || "" : "",
    }));
  };

  const toggleConflict = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_conflict_area: checked,
      conflict_area: checked ? prev.conflict_area || "" : "",
    }));
  };

  const toggleCalamity = (checked) => {
    setFormDataState((prev) => ({
      ...prev,
      is_calamity_area: checked,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Incident Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incident Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Details of the Incident
          </label>
          <input
            type="text"
            placeholder="e.g. Physical altercation at workplace"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.incident_description || ""}
            onChange={(e) => handleChange("incident_description", e.target.value)}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of the Incident
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.incident_date || ""}
            onChange={(e) => handleChange("incident_date", e.target.value)}
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time of the Incident
          </label>
          <input
            type="time"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.incident_time || ""}
            onChange={(e) => handleChange("incident_time", e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geographic Location
          </label>
          <input
            type="text"
            placeholder="e.g. Davao City"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.incident_location || ""}
            onChange={(e) => handleChange("incident_location", e.target.value)}
          />
        </div>

        {/* Type of Place */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type of Place
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.type_of_place || ""}
            onChange={(e) => handleChange("type_of_place", e.target.value)}
          >
            <option value="">Select a place type</option>
            <option value="Conjugal Home">Conjugal Home</option>
            <option value="Victim's Home">Victim's Home</option>
            <option value="Perpetrator's Home">Perpetrator's Home</option>
            <option value="Malls/Hotels">Malls/Hotels</option>
            <option value="Workplace">Workplace</option>
            <option value="Public Utility Vehicle">Public Utility Vehicle</option>
            <option value="Evacuation Area">Evacuation Area</option>
          </select>
        </div>
      </div>

      {/* Electronic Means */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={!!formDataState.is_via_electronic_means}
            onChange={(e) => toggleElectronic(e.target.checked)}
            className="accent-blue-600"
          />
          Was it perpetrated via electronic means?
        </label>
        {formDataState.is_via_electronic_means && (
          <input
            type="text"
            placeholder="Specify electronic means"
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.electronic_means || ""}
            onChange={(e) => handleChange("electronic_means", e.target.value)}
          />
        )}
      </div>

      {/* Conflict Area */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={!!formDataState.is_conflict_area}
            onChange={(e) => toggleConflict(e.target.checked)}
            className="accent-blue-600"
          />
          Did it happen in a conflict area?
        </label>
        {formDataState.is_conflict_area && (
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
            value={formDataState.conflict_area || ""}
            onChange={(e) => handleChange("conflict_area", e.target.value)}
          >
            <option value="">Select type of conflict</option>
            <option value="Insurgency">Insurgency</option>
            <option value="Violent Extremism">Violent Extremism</option>
            <option value="Tribal Violence">Tribal Violence</option>
            <option value="Political Violence">Political Violence</option>
            <option value="Rido">Rido</option>
            <option value="Others">Others</option>
          </select>
        )}
      </div>

      {/* Calamity Area */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={!!formDataState.is_calamity_area}
            onChange={(e) => toggleCalamity(e.target.checked)}
            className="accent-blue-600"
          />
          Did it happen in a calamity area?
        </label>
      </div>
    </div>
  );
}
