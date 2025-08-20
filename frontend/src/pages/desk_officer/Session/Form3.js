export default function Form3() {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Session</h2>

      <h3 className="text-lg font-medium text-gray-800 mb-2">
        Victims Sessions
      </h3>

      <div className="border rounded-lg">
        <div className="bg-gray-100 p-3 rounded-t-lg text-sm font-medium text-gray-700">
          Monitoring Session Forms of VAWC Victims
        </div>

        <div className="p-4 text-sm space-y-3">
          {/* Links */}
          <a href="#" className="text-red-600 block hover:underline">
            View Victim’s Case
          </a>
          <a href="#" className="text-red-600 block hover:underline">
            Session Forms
          </a>
          <a href="#" className="text-red-600 block hover:underline">
            Session Contents/Notes
          </a>

          {/* Form */}
          <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
            <p className="text-gray-500">Please Fill up the form.</p>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Session No.</label>
                <input
                  type="text"
                  value="01"
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">
                  Victim Register No.
                </label>
                <input
                  type="text"
                  value="VAW-2025-05-0023"
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Case No.</label>
                <input
                  type="text"
                  value="01"
                  disabled
                  className="w-full border rounded p-2 bg-gray-100 text-gray-500"
                />
              </div>
            </div>

            {/* Issues Discussed */}
            <div>
              <label className="text-xs text-gray-600">Issues Discussed:</label>
              <textarea
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Type here..."
              />
            </div>

            {/* Interventions */}
            <div>
              <label className="text-xs text-gray-600">
                Interventions Done:
              </label>
              <textarea
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Type here..."
              />
            </div>

            {/* Action Plan */}
            <div>
              <label className="text-xs text-gray-600">Action Plan:</label>
              <textarea
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Type here..."
              />
            </div>
          </div>

          {/* Extra Links */}
          <div className="space-y-1">
            <a href="#" className="text-red-600 block hover:underline">
              Next Session Appointment
            </a>
            <a href="#" className="text-red-600 block hover:underline">
              Feedback
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
              CONTINUE
            </button>
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
