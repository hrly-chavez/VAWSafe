import { useEffect, useState } from "react";
import axios from "axios";

const emptyMember = {
  fam_fname: "",
  fam_mname: "",
  fam_lname: "",
  fam_extension: "",
  fam_birth_date: "",
  fam_sex: "",
  fam_victim_relationship: "",
  fam_civil_status: "",
  fam_educational_attainment: "",
  fam_occupation: "",
  fam_income: "",
};

function FamilyMember({
  index,
  member,
  updateMember,
  onRemove,
  isLocked,
  sexOptions,
  extensionOptions,
  civilStatusOptions,
  educationalAttainmentOptions,
  incomeOptions,
  relationshipOptions,
}) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-gray-50 my-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Family Member #{index + 1}</h3>

        {!isLocked && (
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <input
          readOnly={isLocked}
          disabled={isLocked}
          type="text"
          placeholder="First Name"
          value={member.fam_fname}
          onChange={(e) => updateMember(index, "fam_fname", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          readOnly={isLocked}
          disabled={isLocked}
          type="text"
          placeholder="Middle Name"
          value={member.fam_mname}
          onChange={(e) => updateMember(index, "fam_mname", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          readOnly={isLocked}
          disabled={isLocked}
          type="text"
          placeholder="Last Name"
          value={member.fam_lname}
          onChange={(e) => updateMember(index, "fam_lname", e.target.value)}
          className="border p-2 rounded"
        />

        <select
          readOnly={isLocked}
          disabled={isLocked}
          value={member.fam_extension}
          onChange={(e) => updateMember(index, "fam_extension", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Extension</option>
          {extensionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          readOnly={isLocked}
          disabled={isLocked}
          type="date"
          placeholder="Birth Date"
          value={member.fam_birth_date}
          onChange={(e) =>
            updateMember(index, "fam_birth_date", e.target.value)
          }
          className="border p-2 rounded"
        />

        <select
          readOnly={isLocked}
          disabled={isLocked}
          value={member.fam_sex}
          onChange={(e) => updateMember(index, "fam_sex", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Sex</option>
          {sexOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          readOnly={isLocked}
          disabled={isLocked}
          value={member.fam_victim_relationship}
          onChange={(e) =>
            updateMember(index, "fam_victim_relationship", e.target.value)
          }
          className="border p-2 rounded"
        >
          <option value="">Select Relationship</option>
          {relationshipOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          readOnly={isLocked}
          disabled={isLocked}
          value={member.fam_civil_status}
          onChange={(e) =>
            updateMember(index, "fam_civil_status", e.target.value)
          }
          className="border p-2 rounded"
        >
          <option value="">Select Civil Status</option>
          {civilStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          readOnly={isLocked}
          disabled={isLocked}
          value={member.fam_educational_attainment}
          onChange={(e) =>
            updateMember(index, "fam_educational_attainment", e.target.value)
          }
          className="border p-2 rounded"
        >
          <option value="">Select Educational Attainment</option>
          {educationalAttainmentOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          readOnly={isLocked}
          disabled={isLocked}
          type="text"
          placeholder="Occupation"
          value={member.fam_occupation}
          onChange={(e) =>
            updateMember(index, "fam_occupation", e.target.value)
          }
          className="border p-2 rounded"
        />

        <select
          readOnly={isLocked}
          disabled={isLocked}
          value={member.fam_income}
          onChange={(e) => updateMember(index, "fam_income", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Income Range</option>
          {incomeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function FamilyComposition({
  formDataState,
  setFormDataState,
  isLocked,
}) {
  const members = formDataState.familyMembers || [];

  const addMember = () => {
    const newMembers = [...members, { ...emptyMember }];
    setFormDataState((prev) => ({ ...prev, familyMembers: newMembers }));
  };

  const removeMember = (indexToRemove) => {
    const newMembers = members.filter((_, i) => i !== indexToRemove);
    setFormDataState((prev) => ({ ...prev, familyMembers: newMembers }));
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setFormDataState((prev) => ({ ...prev, familyMembers: newMembers }));
  };

  // for choices
  const [civilStatusOptions, setCivilStatusOptions] = useState([]);
  const [educationalAttainmentOptions, setEducationalAttainmentOptions] =
    useState([]);
  const [incomeOptions, setIncomeOptions] = useState([]);
  const [sexOptions, setSexOptions] = useState([]);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const [relationshipOptions, setRelationshipOptions] = useState([]);

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const [
          civilRes,
          educationRes,
          incomeRes,
          sexRes,
          extensionRes,
          relationshipRes,
        ] = await Promise.all([
          axios.get(
            "http://localhost:8000/api/social_worker/civil-status-choices/"
          ),
          axios.get(
            "http://localhost:8000/api/social_worker/educational-attainment-choices/"
          ),
          axios.get("http://localhost:8000/api/social_worker/income-choices/"),
          axios.get("http://localhost:8000/api/social_worker/sex-choices/"),
          axios.get(
            "http://localhost:8000/api/social_worker/extension-choices/"
          ),
          axios.get(
            "http://localhost:8000/api/social_worker/relationship-choices/"
          ),
        ]);

        setCivilStatusOptions(civilRes.data);
        setEducationalAttainmentOptions(educationRes.data);
        setIncomeOptions(incomeRes.data);
        setSexOptions(sexRes.data);
        setExtensionOptions(extensionRes.data);
        setRelationshipOptions(relationshipRes.data);
      } catch (err) {
        console.error("Failed to fetch family choices", err);
      }
    };

    fetchChoices();
  }, []);

  return (
    <div className="overflow-x-auto p-4">
      {!isLocked && (
        <button
          onClick={addMember}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
        >
          + Add Family Member
        </button>
      )}

      {members.map((member, index) => (
        <FamilyMember
          isLocked={isLocked}
          key={index}
          index={index}
          member={member}
          updateMember={updateMember}
          onRemove={removeMember}
          civilStatusOptions={civilStatusOptions}
          educationalAttainmentOptions={educationalAttainmentOptions}
          incomeOptions={incomeOptions}
          sexOptions={sexOptions}
          extensionOptions={extensionOptions}
          relationshipOptions={relationshipOptions}
        />
      ))}
    </div>
  );
}
