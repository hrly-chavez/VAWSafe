//frontend/src/pages/desk_officer/RegisterVictim/VictimInfo.js
import { useEffect, useState } from "react";
export default function VictimInfo({
  formDataState,
  setFormDataState,
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
    setShowGuardian(minor); // show guardian section if minor
  }, [formDataState.vic_birth_date]);

  const handleChange = (field, value) => {
    setFormDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [showGuardian, setShowGuardian] = useState(false);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 tracking-wide">
        Victim-Survivor Information
      </h2>

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
            onChange={(e) => handleChange("vic_first_name", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Middle Name"
            onChange={(e) => handleChange("vic_middle_name", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Last Name"
            onChange={(e) => handleChange("vic_last_name", e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Extension (e.g. Jr., III)"
            onChange={(e) => handleChange("vic_extension", e.target.value)}
          />
        </div>
      </div>

      {/* Sex + SOGIE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sex
          </label>
          <select
            className="input w-full"
            value={formDataState.vic_sex || ""}
            onChange={(e) => handleChange("vic_sex", e.target.value)}
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SOGIE
          </label>
          <select
            className="input w-full"
            onChange={(e) => handleChange("vic_is_SOGIE", e.target.value)}
          >
            <option>Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Does not want to identify">
              Does not want to identify
            </option>
          </select>
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
      </div>

      {/* Guardian details if minor */}
      {showGuardian && (
        <>
          <h3 className="text-lg font-medium text-gray-700">
            Guardian Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input"
              type="text"
              placeholder="Guardian First Name"
              onChange={(e) =>
                handleChange("vic_guardian_fname", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Middle Name"
              onChange={(e) =>
                handleChange("vic_guardian_mname", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Last Name"
              onChange={(e) =>
                handleChange("vic_guardian_lname", e.target.value)
              }
            />
            <input
              className="input"
              type="text"
              placeholder="Guardian Contact"
              maxLength={11}
              onChange={(e) =>
                handleChange("vic_guardian_contact", e.target.value)
              }
            />
          </div>

          <h3 className="text-lg font-medium text-gray-700">
            If applicable, indicate if the child is:
          </h3>
          <select
            className="input w-full"
            onChange={(e) => handleChange("vic_child_class", e.target.value)}
          >
            <option>Select</option>
            <option value="Orphan">Orphan</option>
            <option value="Unaccompanied">Unaccompanied</option>
            <option value="Separated">Separated</option>
            <option value="Vulnerable">Vulnerable</option>
          </select>
        </>
      )}

      {/* Civil status, education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Civil Status
          </label>
          <select
            className="input w-full"
            value={formDataState.vic_civil_status || ""}
            onChange={(e) => handleChange("vic_civil_status", e.target.value)}
          >
            <option value="">Select</option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="WIDOWED">Widowed</option>
            <option value="SEPARATED">Separated</option>
            <option value="DIVORCED">Divorced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Educational Attainment
          </label>
          <select
            className="input w-full"
            value={formDataState.vic_educational_attainment || ""}
            onChange={(e) =>
              handleChange("vic_educational_attainment", e.target.value)
            }
          >
            <option value="">Select</option>
            <option value="No Formal Education">No Formal Education</option>
            <option value="Elementary Level/Graduate">
              Elementary Level/Graduate
            </option>
            <option value="Junior High School Level/Graduate">
              Junior High School Level/Graduate
            </option>
            <option value="Senior High School Level/Graduate">
              Senior High School Level/Graduate
            </option>
            <option value="Technical/Vocational">Technical/Vocational</option>
            <option value="College Level/Graduate">
              College Level/Graduate
            </option>
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

        {/* Employment Status */}
        <div className="mt-4">
          <select
            className="input w-full"
            value={formDataState.vic_employment_status || ""}
            onChange={(e) =>
              handleChange("vic_employment_status", e.target.value)
            }
          >
            <option value="">Employment Status</option>
            <option value="Employed">Employed</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Informal Sector">Informal Sector</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>

        {/* migratory status */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Migratory Status
          </label>
          <select
            className="input"
            value={formDataState.vic_migratory_status || ""}
            onChange={(e) =>
              handleChange("vic_migratory_status", e.target.value)
            }
          >
            <option value="">Migratory Status</option>
            <option value="Current OFW">Current OFW</option>
            <option value="Former/Returning OFW">Former/Returning OFW</option>
            <option value="Seeking employment abroad">
              Seeking employment abroad
            </option>
            <option value="Not Applicable">Not Applicable</option>
          </select>

          {/* religion */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Religion
            </label>
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
          </div>

          {/* pwd status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PWD Type
            </label>

            <select
              className="input w-full"
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
        </div>

        {/* Checkbox for Displacement */}
        <div className="flex items-center space-x-2 py-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Is the client internally displaced?
          </label>
          <input
            type="checkbox"
            checked={!!formDataState.vic_is_displaced}
            onChange={(e) => handleChange("vic_is_displaced", e.target.checked)}
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number
          </label>
          <input
            className="input"
            type="text"
            placeholder="e.g. 09123456789"
            value={formDataState.vic_contact_number || ""}
            onChange={(e) => handleChange("vic_contact_number", e.target.value)}
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number
          </label>
          <input
            className="input w-full"
            type="text"
            placeholder="Contact Number"
            value={formDataState.vic_contact_number || ""}
            onChange={(e) => handleChange("vic_contact_number", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
