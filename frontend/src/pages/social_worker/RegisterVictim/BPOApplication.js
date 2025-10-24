import React, { useState, useEffect } from "react";
import SchedulePage from "../Session/Schedule";

const BPOApplicationForm = () => {
  const [showSchedulePage, setShowSchedulePage] = useState(null);
  const victimData = JSON.parse(localStorage.getItem("victimData") || "{}");
  const incidentData = JSON.parse(localStorage.getItem("incidentData") || "{}");

  useEffect(() => {
    setShowSchedulePage({
      victim: victimData,
      incident: incidentData,
    });

    console.log(victimData);
    console.log(incidentData);
  }, []);

  const [children, setChildren] = useState([
    {
      firstName: "",
      middleName: "",
      lastName: "",
      extension: "",
      sex: "",
      dob: "",
    },
  ]);

  // Add new child card
  const addChild = () => {
    setChildren([
      ...children,
      {
        firstName: "",
        middleName: "",
        lastName: "",
        extension: "",
        sex: "",
        dob: "",
      },
    ]);
  };

  // Remove child card
  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  // Update child values
  const handleChange = (index, field, value) => {
    const updatedChildren = [...children];
    updatedChildren[index][field] = value;
    setChildren(updatedChildren);
  };

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
            <input className="input" readOnly={true} />
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
            <input
              className="input"
              type="text"
              value={victimData.full_name}
              readOnly
            />
          </div>
          <div>
            <label className="block font-medium">Date/s of Birth</label>
            <input
              className="input"
              value={victimData.vic_birth_date || null}
              type="date"
              readOnly
            />
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <input className="input" value={null} readOnly />
          </div>
          <div>
            <label className="block font-medium">Tel. No.</label>
            <input
              className="input"
              value={victimData.vic_contact_number || null}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* TODO */}
      {children.map((child, index) => (
        <div
          key={index}
          className="p-4 mb-4 bg-white rounded-lg shadow-sm border space-y-4 relative"
        >
          {/* Remove button */}
          {children.length > 1 && (
            <button
              type="button"
              onClick={() => removeChild(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                className="input w-full"
                value={child.firstName}
                onChange={(e) =>
                  handleChange(index, "firstName", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                className="input w-full"
                value={child.middleName}
                onChange={(e) =>
                  handleChange(index, "middleName", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                className="input w-full"
                value={child.lastName}
                onChange={(e) =>
                  handleChange(index, "lastName", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extension
              </label>
              <input
                className="input w-full"
                placeholder="e.g. Jr., III"
                value={child.extension}
                onChange={(e) =>
                  handleChange(index, "extension", e.target.value)
                }
              />
            </div>
          </div>

          {/* Sex & DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select
                className="input w-full"
                value={child.sex}
                onChange={(e) => handleChange(index, "sex", e.target.value)}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                className="input w-full"
                value={child.dob}
                onChange={(e) => handleChange(index, "dob", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add child button */}
      <button
        type="button"
        onClick={addChild}
        className="mt-2 px-4 py-2 bg-[#292D96] text-white rounded-lg hover:bg-[#1e2370]"
      >
        + Add Child
      </button>

      {/* Respondent Info */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Respondent Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Name of Respondent</label>
            <input className="input" value={null} />
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

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          className="px-6 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 transition"
        >
          Decline
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-[#292D96] text-white hover:bg-[#1e2370] transition"
        >
          Accept
        </button>
      </div>

      {/* Show schedule page after success */}
      {showSchedulePage && (
        <SchedulePage
          embedded={true}
          victim={showSchedulePage.victim}
          incident={showSchedulePage.incident}
        />
      )}
    </form>
  );
};

export default BPOApplicationForm;
