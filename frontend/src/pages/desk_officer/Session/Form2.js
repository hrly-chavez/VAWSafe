import Sidebar from "../components/sideBar";
import Navbar from "../components/navBar";

export default function Form2() {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Session</h2>

      {/* Section Title */}
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        Victims Sessions
      </h3>

      <div className="border rounded-lg">
        <div className="bg-gray-100 p-3 rounded-t-lg text-sm font-medium text-gray-700">
          Monitoring Session Forms of VAWC Victims
        </div>

        {/* Action Links */}
        <div className="p-4 text-sm space-y-2">
          <a href="#" className="text-red-600 block hover:underline">
            View Victim’s Case
          </a>
          <a href="#" className="text-red-600 block hover:underline">
            Session Forms
          </a>

          {/* Form */}
          <div className="border rounded-lg p-4 bg-gray-50 mt-2">
            <p className="text-gray-500 mb-3">Please Fill up the form.</p>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Session No.</label>
                <input
                  type="text"
                  value="01"
                  disabled
                  className="w-full border rounded p-2 text-gray-500 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">
                  Victim Register No.
                </label>
                <input
                  type="text"
                  value="VAW-2025-05-00123"
                  disabled
                  className="w-full border rounded p-2 text-gray-500 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Case No.</label>
                <input
                  type="text"
                  value="01"
                  disabled
                  className="w-full border rounded p-2 text-gray-500 bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Date</label>
                <input type="date" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Time</label>
                <input type="time" className="w-full border rounded p-2" />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-600">Location Address</label>
              <input type="text" className="w-full border rounded p-2" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Region</label>
                <select className="w-full border rounded p-2">
                  <option>Select Region</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Province</label>
                <select className="w-full border rounded p-2">
                  <option>Select Province</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">CityMun.</label>
                <select className="w-full border rounded p-2">
                  <option>Select City</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Barangay</label>
                <select className="w-full border rounded p-2">
                  <option>Select Barangay</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Type of Session</label>
                <select className="w-full border rounded p-2">
                  <option>Select Type</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block">Attended?</label>
                <div className="flex items-center space-x-4 mt-1">
                  <label className="flex items-center space-x-1">
                    <input type="radio" name="attended" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="radio" name="attended" />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Extra Links */}
          <div className="space-y-1">
            <a href="#" className="text-red-600 block hover:underline">
              Session Contents/Notes
            </a>
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
