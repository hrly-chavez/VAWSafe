import { useEffect } from "react";

export default function VictimInfo({
  formDataState,
  setFormDataState,
  back,
  next,
}) {
  // Utility to calculate if victim is minor
  function isMinor(birthDate) {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    const age =
      today.getFullYear() -
      birth.getFullYear() -
      (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
        ? 1
        : 0);
    return age < 18;
  }

  // Auto-update is_minor when birth date changes
  useEffect(() => {
    const minor = isMinor(formDataState.vic_birth_date);
    setFormDataState((prev) => ({
      ...prev,
      is_minor: minor,
    }));
  }, [formDataState.vic_birth_date, setFormDataState]);

  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800">
        Victim Survivor Information
      </h2>

      {/* Name */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="input"
          type="text"
          placeholder="First Name"
          value={formDataState.vic_first_name || ""}
          onChange={(e) => handleChange("vic_first_name", e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="Middle Name"
          value={formDataState.vic_middle_name || ""}
          onChange={(e) => handleChange("vic_middle_name", e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="Last Name"
          value={formDataState.vic_last_name || ""}
          onChange={(e) => handleChange("vic_last_name", e.target.value)}
        />
      </div>

      {/* Sex + SOGIE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="input"
          value={formDataState.vic_sex || ""}
          onChange={(e) => handleChange("vic_sex", e.target.value)}
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select
          className="input"
          value={formDataState.vic_is_SOGIE || ""}
          onChange={(e) => handleChange("vic_is_SOGIE", e.target.value)}
        >
          <option value="">SOGIE?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Does not want to identify">
            Does not want to identify
          </option>
        </select>

        {formDataState.vic_is_SOGIE === "Yes" && (
          <input
            className="input"
            type="text"
            placeholder="Please specify"
            value={formDataState.vic_specific_SOGIE || ""}
            onChange={(e) => handleChange("vic_specific_SOGIE", e.target.value)}
          />
        )}
      </div>

      {/* Birth details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="input"
          type="date"
          value={formDataState.vic_birth_date || ""}
          onChange={(e) => handleChange("vic_birth_date", e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="Birth Place"
          value={formDataState.vic_birth_place || ""}
          onChange={(e) => handleChange("vic_birth_place", e.target.value)}
        />
      </div>

      {/* Guardian details if minor */}
      {formDataState.is_minor && (
        <>
          <h3 className="text-lg font-medium text-gray-700">
            Guardian Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input"
              type="text"
              placeholder="Guardian First Name"
              value={formDataState.guardian_first_name || ""}
              onChange={(e) =>
                handleChange("guardian_first_name", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Middle Name"
              value={formDataState.guardian_middle_name || ""}
              onChange={(e) =>
                handleChange("guardian_middle_name", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Last Name"
              value={formDataState.guardian_last_name || ""}
              onChange={(e) =>
                handleChange("guardian_last_name", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Contact"
              value={formDataState.guardian_contact || ""}
              onChange={(e) => handleChange("guardian_contact", e.target.value)}
            />
          </div>
        </>
      )}

      {/* Civil status, education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="input"
          value={formDataState.vic_civil_status || ""}
          onChange={(e) => handleChange("vic_civil_status", e.target.value)}
        >
          <option value="">Civil Status</option>
          <option value="SINGLE">Single</option>
          <option value="MARRIED">Married</option>
          <option value="WIDOWED">Widowed</option>
          <option value="SEPARATED">Separated</option>
          <option value="DIVORCED">Divorced</option>
        </select>

        <select
          className="input"
          value={formDataState.vic_educational_attainment || ""}
          onChange={(e) =>
            handleChange("vic_educational_attainment", e.target.value)
          }
        >
          <option value="">Educational Attainment</option>
          <option value="No Formal Education">No formal education</option>
          <option value="Elementary Level/Graduate">Elementary</option>
          <option value="Junior High School Level/Graduate">Junior High</option>
          <option value="Senior High School Level/Graduate">Senior High</option>
          <option value="Technical/Vocational">Technical/Vocational</option>
          <option value="College Level/Graduate">College</option>
          <option value="Post graduate">Post graduate</option>
        </select>
      </div>

      {/* Nationality & Ethnicity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="input"
          value={formDataState.vic_nationality || ""}
          onChange={(e) => handleChange("vic_nationality", e.target.value)}
        >
          <option value="">Nationality</option>
          <option value="Filipino">Filipino</option>
          <option value="Others">Others</option>
        </select>

        <input
          className="input"
          type="text"
          placeholder="Ethnicity"
          value={formDataState.vic_ethnicity || ""}
          onChange={(e) => handleChange("vic_ethnicity", e.target.value)}
        />
      </div>

      {/* Occupation & Income */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="input"
          type="text"
          placeholder="Main Occupation"
          value={formDataState.vic_main_occupation || ""}
          onChange={(e) => handleChange("vic_main_occupation", e.target.value)}
        />
        <input
          className="input"
          type="number"
          placeholder="Monthly Income"
          value={formDataState.vic_monthly_income || ""}
          onChange={(e) => handleChange("vic_monthly_income", e.target.value)}
        />
      </div>

      {/* Employment Status */}
      <select
        className="input"
        value={formDataState.vic_employment_status || ""}
        onChange={(e) => handleChange("vic_employment_status", e.target.value)}
      >
        <option value="">Employment Status</option>
        <option value="Employed">Employed</option>
        <option value="Self-employed">Self-employed</option>
        <option value="Informal Sector">Informal Sector</option>
        <option value="Unemployed">Unemployed</option>
        <option value="Not Applicable">Not Applicable</option>
      </select>

      {/* Migratory, Religion, PWD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          className="input"
          value={formDataState.vic_migratory_status || ""}
          onChange={(e) => handleChange("vic_migratory_status", e.target.value)}
        >
          <option value="">Migratory Status</option>
          <option value="Current OFW">Current OFW</option>
          <option value="Former/Returning OFW">Former/Returning OFW</option>
          <option value="Seeking employment abroad">
            Seeking employment abroad
          </option>
          <option value="Not Applicable">Not Applicable</option>
        </select>

        <select
          className="input"
          value={formDataState.vic_religion || ""}
          onChange={(e) => handleChange("vic_religion", e.target.value)}
        >
          <option value="">Religion</option>
          <option value="Roman Catholic">Roman Catholic</option>
          <option value="Islam">Islam</option>
          <option value="Evangelicals">Evangelicals</option>
          <option value="Protestant">Protestant</option>
          <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
          <option value="Others">Others</option>
        </select>

        <label className="flex items-center space-x-2">
          <span>Is the client internally displaced?</span>
          <input
            type="checkbox"
            checked={!!formDataState.vic_is_displaced}
            onChange={(e) => handleChange("vic_is_displaced", e.target.checked)}
          />
        </label>

        <select
          className="input"
          value={formDataState.vic_PWD_type || ""}
          onChange={(e) => handleChange("vic_PWD_type", e.target.value)}
        >
          <option value="">PWD Status</option>
          <option value="None">None</option>
          <option value="Deaf or Hard of Hearing">
            Deaf or Hard of Hearing
          </option>
          <option value="Intellectual Disability">
            Intellectual Disability
          </option>
          <option value="Learning Disability">Learning Disability</option>
          <option value="Mental Disability">Mental Disability</option>
          <option value="Orthopedic Disability">Orthopedic Disability</option>
          <option value="Physical Disability">Physical Disability</option>
          <option value="Psychological Disability">
            Psychological Disability
          </option>
          <option value="Speech and Language Disability">
            Speech and Language Disability
          </option>
          <option value="Visual Disability">Visual Disability</option>
        </select>
      </div>

      {/* Contact */}
      <input
        className="input w-full"
        type="text"
        placeholder="Contact Information"
        value={formDataState.vic_contact_number || ""}
        onChange={(e) => handleChange("vic_contact_number", e.target.value)}
      />

      {/* buttons */}
      <button
        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        onClick={back}
      >
        Back
      </button>
      <button
        className=" bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        onClick={next}
      >
        Next
      </button>
    </div>
  );
}
