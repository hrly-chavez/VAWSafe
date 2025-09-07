// frontend/src/pages/desk_officer/Session/Schedule.js
import Sidebar from "../sideBar";
import Navbar from "../navBar";

export default function Schedule({ back, next }) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">
        Schedule Session
      </h2>

      <div className="border rounded-lg">
        <div className="bg-gray-100 p-3 rounded-t-lg text-sm font-medium text-gray-700">
          Monitoring Session Forms of VAWC Victims
        </div>

        {/* Action Links */}
        <div className="p-4 text-sm space-y-2">
          {/* Form */}
          <div className="border rounded-lg p-4 bg-gray-50 mt-2">
            <p className="text-gray-500 mb-3">Please Fill up the form.</p>


            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  defaultValue={new Date().toISOString().split("T")[0]} // current date
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Time</label>
                <input
                  type="time"
                  className="w-full border rounded p-2"
                  defaultValue={new Date().toTimeString().slice(0, 5)} // current time HH:MM
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-600">Location </label>
              <input type="text" className="w-full border rounded p-2" />
            </div>


            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Type of Session</label>
                <select className="w-full border rounded p-2">
                  <option>Select Type</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              onClick={next}
            >
              Submit to Schedule Session
            </button>
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              onClick={next}
            >
              Start Session Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}