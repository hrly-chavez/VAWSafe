import React, { useState } from "react";
import SchedulePage from "../Session/Schedule";

const BPOApplicationForm = () => {
  const [formData, setFormData] = useState({
    applicantName: "",
    applicantAddress: "",
    applicantTel: "",
    relationshipToVictim: "",
    occupation: "",
    victimName: "",
    victimDOB: "",
    victimAddress: "",
    victimTel: "",
    incomeSource: "",
    civilStatus: "",
    numberOfChildren: "",
    childrenAges: "",
    respondentName: "",
    respondentDOB: "",
    respondentSex: "",
    respondentAddress: "",
    respondentTel: "",
    commissionDates: "",
    commissionPlaces: "",
    victimRespondentRelationship: "",
    actsComplained: [],
    otherActs: "",
    date: "",
    signature: "",
    punongBarangaySignature: "",
    punongBarangayDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      actsComplained: checked
        ? [...prev.actsComplained, value]
        : prev.actsComplained.filter((act) => act !== value),
    }));
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
            <input
              name="applicantName"
              value={formData.applicantName}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <input
              name="applicantAddress"
              value={formData.applicantAddress}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Tel. No.</label>
            <input
              name="applicantTel"
              value={formData.applicantTel}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">
              Relationship to Victim/s
            </label>
            <input
              name="relationshipToVictim"
              value={formData.relationshipToVictim}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Occupation</label>
            <input
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="input"
            />
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
              name="victimName"
              value={formData.victimName}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Date/s of Birth</label>
            <input
              name="victimDOB"
              value={formData.victimDOB}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <input
              name="victimAddress"
              value={formData.victimAddress}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Tel. No.</label>
            <input
              name="victimTel"
              value={formData.victimTel}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Family Info */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Family Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Source of Income</label>
            <input
              name="incomeSource"
              value={formData.incomeSource}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Civil Status</label>
            <input
              name="civilStatus"
              value={formData.civilStatus}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Number of Children</label>
            <input
              name="numberOfChildren"
              value={formData.numberOfChildren}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Ages of Children</label>
            <input
              name="childrenAges"
              value={formData.childrenAges}
              onChange={handleChange}
              className="input"
            />
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
            <input
              name="respondentName"
              value={formData.respondentName}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Date of Birth</label>
            <input
              name="respondentDOB"
              value={formData.respondentDOB}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Sex</label>
            <input
              name="respondentSex"
              value={formData.respondentSex}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Address</label>
            <input
              name="respondentAddress"
              value={formData.respondentAddress}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Tel. No.</label>
            <input
              name="respondentTel"
              value={formData.respondentTel}
              onChange={handleChange}
              className="input"
            />
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
            <input
              name="commissionDates"
              value={formData.commissionDates}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block font-medium">Place/s of Commission</label>
            <input
              name="commissionPlaces"
              value={formData.commissionPlaces}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <label className="block mt-4 font-medium">
          Relationship of Victim to Respondent
        </label>
        <select
          name="victimRespondentRelationship"
          value={formData.victimRespondentRelationship}
          onChange={handleChange}
          className="input"
        >
          <option value="">--Select--</option>
          {[
            "Husband/Wife",
            "Former Husband/Wife",
            "Parent",
            "Child",
            "Relative",
            "Guardian",
            "Common Law Spouse",
            "Dating Relationship",
            "Sexual Relationship",
          ].map((rel) => (
            <option key={rel} value={rel}>
              {rel}
            </option>
          ))}
        </select>
      </div>

      {/* Acts Complained Of */}
      <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-[#292D96]">
          Acts Complained Of
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              value="Threats"
              onChange={handleCheckboxChange}
            />
            Threats
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              value="Physical Injuries"
              onChange={handleCheckboxChange}
            />
            Physical Injuries
          </label>
          <div>
            <label className="block font-medium">Others (specify)</label>
            <input
              name="otherActs"
              value={formData.otherActs}
              onChange={handleChange}
              className="input"
            />
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
      <SchedulePage
        embedded={true}
        // victim={showSchedulePage.victim}
        // incident={showSchedulePage.incident}
      />
    </form>
  );
};

export default BPOApplicationForm;
