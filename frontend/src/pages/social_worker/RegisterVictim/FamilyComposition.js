export default function FamilyComposition() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 text-sm text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">First Name</th>
            <th className="border px-2 py-1">Middle Name</th>
            <th className="border px-2 py-1">Last Name</th>
            <th className="border px-2 py-1">Extension</th>
            <th className="border px-2 py-1">Birth Date</th>
            <th className="border px-2 py-1">Relationship to Victim</th>
            <th className="border px-2 py-1">Civil Status</th>
            <th className="border px-2 py-1">Educational Attainment</th>
            <th className="border px-2 py-1">Occupation</th>
            <th className="border px-2 py-1">Income</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Example Row 1 */}
          <tr>
            <td className="border px-2 py-1">
              <input
                type="text"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <input
                type="text"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <input
                type="text"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <input
                type="text"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <input
                type="date"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <input
                type="text"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <select className="w-full border rounded p-1 text-sm">
                <option value="">Select</option>
                <option>Single</option>
                <option>Married</option>
                <option>Widowed</option>
                <option>Separated</option>
              </select>
            </td>
            <td className="border px-2 py-1">
              <input
                type="text"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <input
                type="text"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <input
                type="number"
                className="w-full border rounded p-1 text-sm"
              />
            </td>
            <td className="border px-2 py-1">
              <button className="text-red-500 hover:text-red-700">✕</button>
            </td>
          </tr>

          {/* Add as many rows as you like for UI mockup */}
        </tbody>
      </table>

      <div className="mt-3">
        <button
          type="button"
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          + Add Family Member
        </button>
      </div>
    </div>
  );
}
