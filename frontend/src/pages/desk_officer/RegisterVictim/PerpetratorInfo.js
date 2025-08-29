export default function PerpetratorInfo({
  formDataState,
  setFormDataState,
  back,
  submit,
  loading,
}) {
  const handleChange = (field, value) =>
    setFormDataState((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
        Alleged Perpetrator Information
      </h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name
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

      {/* Occupation — matches model field `per_occupation` */}
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
          <option value="">Religion</option>
          <option value="Roman Catholic">Roman Catholic</option>
          <option value="Islam">Islam</option>
          <option value="Evangelicals">Evangelicals</option>
          <option value="Protestant">Protestant</option>
          <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {/* Keep more fields only if they exist in the model */}
      {/* buttons */}
      <button
        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        onClick={back}
      >
        Back
      </button>
      <button
        onClick={submit}
        disabled={loading}
        className=" bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
