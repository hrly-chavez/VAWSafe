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
      calamity_type: checked ? prev.calamity_type || "" : "",
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Incident Information
      </h2>

      {/* Incident Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Details of the Incident
        </label>
        <input
          type="text"
          placeholder="e.g. Physical altercation at workplace"
          className="input w-full"
          value={formDataState.incident_description || ""}
          onChange={(e) => handleChange("incident_description", e.target.value)}
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of the Incident
          </label>
          <input
            type="date"
            className="input w-full"
            value={formDataState.incident_date || ""}
            onChange={(e) => handleChange("incident_date", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time of the Incident
          </label>
          <input
            type="time"
            className="input w-full"
            value={formDataState.incident_time || ""}
            onChange={(e) => handleChange("incident_time", e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Geographic Location
        </label>
        <input
          type="text"
          placeholder="e.g. Davao City"
          className="input w-full"
          value={formDataState.incident_location || ""}
          onChange={(e) => handleChange("incident_location", e.target.value)}
        />
      </div>

      {/* Type of Place */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type of Place
        </label>
        <select
          className="input w-full"
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

      {/* Electronic Means */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Was it perpetrated via electronic means?
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={!!formDataState.is_via_electronic_means}
            onChange={(e) => toggleElectronic(e.target.checked)}
          />
          <span className="text-sm text-gray-600">Yes</span>
        </div>
        {formDataState.is_via_electronic_means && (
          <input
            type="text"
            placeholder="Specify electronic means"
            className="input w-full mt-2"
            value={formDataState.electronic_means || ""}
            onChange={(e) => handleChange("electronic_means", e.target.value)}
          />
        )}
      </div>

      {/* Conflict Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Did it happen in a conflict area?
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={!!formDataState.is_conflict_area}
            onChange={(e) => toggleConflict(e.target.checked)}
          />
          <span className="text-sm text-gray-600">Yes</span>
        </div>
        {formDataState.is_conflict_area && (
          <select
            className="input w-full mt-2"
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Did it happen in a calamity area?
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={!!formDataState.is_calamity_area}
            onChange={(e) => toggleCalamity(e.target.checked)}
          />
          <span className="text-sm text-gray-600">Yes</span>
        </div>
        {formDataState.is_calamity_area && (
          <select
            className="input w-full mt-2"
            value={formDataState.calamity_type || ""}
            onChange={(e) => handleChange("calamity_type", e.target.value)}
          >
            <option value="">Select type of calamity</option>
            <option value="Typhoon">Typhoon</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Flood">Flood</option>
            <option value="Volcanic Eruption">Volcanic Eruption</option>
            <option value="Fire">Fire</option>
            <option value="Pandemic">Pandemic</option>
            <option value="Others">Others</option>
          </select>
        )}
      </div>
    </div>
  );
}