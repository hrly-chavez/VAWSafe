import React, { useState } from "react";

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
      <h2 className="text-2xl font-bold text-center mb-4">
        Barangay Protection Order (BPO) Application Form
      </h2>

      {/* Applicant Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="applicantName"
          placeholder="Name of Applicant"
          value={formData.applicantName}
          onChange={handleChange}
          className="input"
        />
        <input
          name="applicantAddress"
          placeholder="Address"
          value={formData.applicantAddress}
          onChange={handleChange}
          className="input"
        />
        <input
          name="applicantTel"
          placeholder="Tel. No."
          value={formData.applicantTel}
          onChange={handleChange}
          className="input"
        />
        <input
          name="relationshipToVictim"
          placeholder="Relationship to Victim/s"
          value={formData.relationshipToVictim}
          onChange={handleChange}
          className="input"
        />
        <input
          name="occupation"
          placeholder="Occupation"
          value={formData.occupation}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Victim Info */}
      <h3 className="text-xl font-semibold mt-6">Victim Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="victimName"
          placeholder="Name of Victim/s"
          value={formData.victimName}
          onChange={handleChange}
          className="input"
        />
        <input
          name="victimDOB"
          placeholder="Date/s of Birth"
          value={formData.victimDOB}
          onChange={handleChange}
          className="input"
        />
        <input
          name="victimAddress"
          placeholder="Address"
          value={formData.victimAddress}
          onChange={handleChange}
          className="input"
        />
        <input
          name="victimTel"
          placeholder="Tel. No."
          value={formData.victimTel}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Family Info */}
      <h3 className="text-xl font-semibold mt-6">Family Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="incomeSource"
          placeholder="Source of Income"
          value={formData.incomeSource}
          onChange={handleChange}
          className="input"
        />
        <input
          name="civilStatus"
          placeholder="Civil Status"
          value={formData.civilStatus}
          onChange={handleChange}
          className="input"
        />
        <input
          name="numberOfChildren"
          placeholder="Number of Children"
          value={formData.numberOfChildren}
          onChange={handleChange}
          className="input"
        />
        <input
          name="childrenAges"
          placeholder="Ages of Children"
          value={formData.childrenAges}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Respondent Info */}
      <h3 className="text-xl font-semibold mt-6">Respondent Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="respondentName"
          placeholder="Name of Respondent"
          value={formData.respondentName}
          onChange={handleChange}
          className="input"
        />
        <input
          name="respondentDOB"
          placeholder="Date of Birth"
          value={formData.respondentDOB}
          onChange={handleChange}
          className="input"
        />
        <input
          name="respondentSex"
          placeholder="Sex"
          value={formData.respondentSex}
          onChange={handleChange}
          className="input"
        />
        <input
          name="respondentAddress"
          placeholder="Address"
          value={formData.respondentAddress}
          onChange={handleChange}
          className="input"
        />
        <input
          name="respondentTel"
          placeholder="Tel. No."
          value={formData.respondentTel}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Incident Info */}
      <h3 className="text-xl font-semibold mt-6">Incident Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="commissionDates"
          placeholder="Date/s of Commission"
          value={formData.commissionDates}
          onChange={handleChange}
          className="input"
        />
        <input
          name="commissionPlaces"
          placeholder="Place/s of Commission"
          value={formData.commissionPlaces}
          onChange={handleChange}
          className="input"
        />
      </div>

      <label className="block mt-4 font-medium">
        Relationship of Victim to Respondent:
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

      {/* Acts Complained Of */}
      <h3 className="text-xl font-semibold mt-6">Acts Complained Of</h3>
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
        <input
          name="otherActs"
          placeholder="Others (specify)"
          value={formData.otherActs}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Signature */}
      <h3 className="text-xl font-semibold mt-6">Applicant Declaration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="date"
          placeholder="Date"
          value={formData.date}
          onChange={handleChange}
          className="input"
        />
        <input
          name="signature"
          placeholder="Signature over printed name"
          value={formData.signature}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Barangay Verification */}
      <h3 className="text-xl font-semibold mt-6">
        Verification of the Punong Barangay
      </h3>
      <p className="text-sm italic mb-2">
        I certify that the applicant for BPO who personally appeared before me
        is a bona fide resident of this barangay and is the same person who
        supplied all the above information and attests to the correctness of
        said information.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="punongBarangaySignature"
          placeholder="Punong Barangay Signature"
          value={formData.punongBarangaySignature}
          onChange={handleChange}
          className="input"
        />
        <input
          name="punongBarangayDate"
          placeholder="Date"
          value={formData.punongBarangayDate}
          onChange={handleChange}
          className="input"
        />
      </div>
    </form>
  );
};

export default BPOApplicationForm;
