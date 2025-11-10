import { useState } from "react";

function FamilyMember({ index, onRemove }) {
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

      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="First Name"
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Middle Name"
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          className="border p-2 rounded"
        />
      </div>
    </div>
  );
}

export default function FamilyComposition() {
  const [members, setMembers] = useState([]);

  const addMember = () => {
    setMembers([...members, {}]);
  };

  const removeMember = (indexToRemove) => {
    setMembers(members.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Member Information</h2>

      <button
        onClick={addMember}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        + Add Family Member
      </button>

      {members.map((_, index) => (
        <FamilyMember key={index} index={index} onRemove={removeMember} />
      ))}
    </div>
  );
}
