import { useState } from "react";

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

function FamilyMember({ index, member, updateMember, onRemove, isLocked }) {
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
          <option value="Jr.">Jr.</option>
          <option value="Sr.">Sr.</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
          <option value="V">V</option>
          <option value="">None</option>
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
          <option value="Male">Male</option>
          <option value="Female">Female</option>
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
          <option value="Mother">Mother</option>
          <option value="Father">Father</option>
          <option value="Sibling">Sibling</option>
          <option value="Son">Son</option>
          <option value="Daughter">Daughter</option>
          <option value="Spouse">Spouse</option>
          <option value="Partner">Partner</option>
          <option value="Grandparent">Grandparent</option>
          <option value="Aunt">Aunt</option>
          <option value="Uncle">Uncle</option>
          <option value="Cousin">Cousin</option>
          <option value="Other">Other</option>
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
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Separated">Separated</option>
          <option value="Divorced">Divorced</option>
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
          <option value="No Formal Education">No Formal Education</option>
          <option value="Elementary Level">Elementary Level</option>
          <option value="Elementary Graduate">Elementary Graduate</option>
          <option value="High School Level">High School Level</option>
          <option value="High School Graduate">High School Graduate</option>
          <option value="Senior High School Level">
            Senior High School Level
          </option>
          <option value="Senior High School Graduate">
            Senior High School Graduate
          </option>
          <option value="Vocational/Technical">Vocational/Technical</option>
          <option value="College Level">College Level</option>
          <option value="College Graduate">College Graduate</option>
          <option value="Post-Graduate">Post-Graduate</option>
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
          <option value="Below ₱5,000">Below ₱5,000</option>
          <option value="₱5,000 – ₱10,000">₱5,000 – ₱10,000</option>
          <option value="₱10,001 – ₱20,000">₱10,001 – ₱20,000</option>
          <option value="₱20,001 – ₱30,000">₱20,001 – ₱30,000</option>
          <option value="Above ₱30,000">Above ₱30,000</option>
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
        />
      ))}
    </div>
  );
}
