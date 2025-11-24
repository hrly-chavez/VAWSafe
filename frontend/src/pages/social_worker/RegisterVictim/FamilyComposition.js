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

function FamilyMember({ index, member, updateMember, onRemove }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-gray-50 my-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Family Member #{index + 1}</h3>
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="First Name"
          value={member.fam_fname}
          onChange={(e) => updateMember(index, "fam_fname", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Middle Name"
          value={member.fam_mname}
          onChange={(e) => updateMember(index, "fam_mname", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={member.fam_lname}
          onChange={(e) => updateMember(index, "fam_lname", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Extension"
          value={member.fam_extension}
          onChange={(e) => updateMember(index, "fam_extension", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          placeholder="Birth Date"
          value={member.fam_birth_date}
          onChange={(e) => updateMember(index, "fam_birth_date", e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={member.fam_sex}
          onChange={(e) => updateMember(index, "fam_sex", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input
          type="text"
          placeholder="Victim Relationship"
          value={member.fam_victim_relationship}
          onChange={(e) => updateMember(index, "fam_victim_relationship", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Civil Status"
          value={member.fam_civil_status}
          onChange={(e) => updateMember(index, "fam_civil_status", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Educational Attainment"
          value={member.fam_educational_attainment}
          onChange={(e) => updateMember(index, "fam_educational_attainment", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Occupation"
          value={member.fam_occupation}
          onChange={(e) => updateMember(index, "fam_occupation", e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Income"
          value={member.fam_income}
          onChange={(e) => updateMember(index, "fam_income", e.target.value)}
          className="border p-2 rounded"
        />
      </div>
    </div>
  );
}

export default function FamilyComposition({ formDataState, setFormDataState }) {
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
      <h2 className="text-xl font-semibold mb-4">Family Member Information</h2>

      <button
        onClick={addMember}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        + Add Family Member
      </button>

      {members.map((member, index) => (
        <FamilyMember
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
