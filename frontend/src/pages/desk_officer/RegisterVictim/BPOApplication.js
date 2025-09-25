import React from "react";

const BPOApplicationForm = () => {
  return (
    <form className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#292D96]">
        Barangay Protection Order (BPO) Application Form
      </h2>

      {/* Applicant Info */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Applicant Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Name of Applicant</label>
            <input className="input" />
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <input className="input" />
          </div>
          <div>
            <label className="block font-medium">Tel. No.</label>
            <input className="input" />
          </div>
          <div>
            <label className="block font-medium">
              Relationship to Victim/s
            </label>
            <input className="input" />
          </div>
          <div>
            <label className="block font-medium">Occupation</label>
            <input className="input" />
          </div>
        </div>
      </div>

      {/* Victim Info */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Victim Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Name of Victim/s</label>
            <input className="input" />
          </div>
          <div>
            <label className="block font-medium">Date/s of Birth</label>
            <input className="input" type="date" />
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <input className="input" />
          </div>
          <div>
            <label className="block font-medium">Tel. No.</label>
            <input className="input" />
          </div>
        </div>
      </div>

      {/* Victim’s Children Info */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Victim's Children Information
        </h3>

        {/* Single Child Card (can be duplicated dynamically later) */}
        <div className="p-4 bg-white rounded-lg shadow-sm border space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extension
              </label>
              <input className="input w-full" placeholder="e.g. Jr., III" />
            </div>
          </div>

          {/* Sex & DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select className="input w-full">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input className="input w-full" type="date" />
            </div>
          </div>
        </div>
      </div>

      {/* Respondent Info */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Respondent Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Name of Respondent</label>
            <input className="input" />
          </div>
          <div>
            <label className="block font-medium">Date of Birth</label>
            <input className="input" type="date" />
          </div>
          <div>
            <label className="block font-medium">Sex</label>
            <select className="input">
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <input className="input" />
          </div>
          <div>
            <label className="block font-medium">Tel. No.</label>
            <input className="input" />
          </div>
        </div>
      </div>

      {/* Incident Info */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Incident Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Date/s of Commission</label>
            <input className="input" type="date" />
          </div>
          <div>
            <label className="block font-medium">Place/s of Commission</label>
            <input className="input" />
          </div>
        </div>

        <label className="block mt-4 font-medium">
          Relationship of Victim to Respondent
        </label>
        <select className="input">
          <option value="">--Select--</option>
          <option>Husband/Wife</option>
          <option>Former Husband/Wife</option>
          <option>Parent</option>
          <option>Child</option>
          <option>Relative</option>
          <option>Guardian</option>
          <option>Common Law Spouse</option>
          <option>Dating Relationship</option>
          <option>Sexual Relationship</option>
        </select>
      </div>

      {/* Acts Complained Of */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Acts Complained Of
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Threats
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Physical Injuries
          </label>
          <div>
            <label className="block font-medium">Others (specify)</label>
            <input className="input" />
          </div>
        </div>
      </div>
    </form>
  );
};

export default BPOApplicationForm;
