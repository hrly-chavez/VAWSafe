import React, { useState, useEffect } from "react";
import { ListBulletIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function NurseReportForm({ victim, incident, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    bmi: "",
    report_info: "",
    attachments: [],
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddNote = (type) => {
    let newText = "";
    if (type === "bullet") newText = "\n• ";
    if (type === "checkbox") newText = "\n☐ ";
    setFormData({ ...formData, report_info: formData.report_info + newText });
  };

  const handleFileUpload = (e) => {
    setFormData({ ...formData, attachments: [...e.target.files] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      bmi_category: formData.bmiCategory,
    });
  };

  useEffect(() => {
    const h = parseFloat(formData.height);
    const w = parseFloat(formData.weight);
    const age = parseInt(victim.age);

    if (!h || !w || !age) return;

    // ✅ Always cm and kg
    const heightInMeters = h / 100;
    const weightInKg = w;

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    const roundedBMI = parseFloat(bmi.toFixed(1));

    let category = "—";
    if (age >= 18) {
      if (roundedBMI < 18.5) category = "Underweight";
      else if (roundedBMI < 25) category = "Normal";
      else if (roundedBMI < 30) category = "Overweight";
      else category = "Obese";
    } else {
      category = "Age-based BMI not classified";
    }

    setFormData((prev) => ({
      ...prev,
      bmi: roundedBMI,
      bmiCategory: category,
    }));
  }, [formData.height, formData.weight, victim.age]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-sm text-gray-700">
      {/* Header */}
       <div className="text-center">
                <h2 className="text-2xl font-bold text-[#292D96]">Monthly Patient Report</h2>
                <p className="text-xs text-gray-500 mt-1">Nurse Medical Assessment</p>
            </div>

      {/* Patient Details */}
      <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
        <h3 className="text-md font-semibold text-[#292D96]">Patient Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Name" value={victim.full_name} />
          <InfoItem label="Sex" value={victim.vic_sex} />
          <InfoItem label="Date of Birth" value={victim.vic_birth_date} />
          <InfoItem label="Age" value={victim.age} />
        </div>
      </div>

      {/* Vitals & Measurements */}
      <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
        <h3 className="text-md font-semibold text-[#292D96]">Vitals & Measurements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Height */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g. 160"
            />
          </div>

          {/* Weight */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g. 60.2"
            />
          </div>

          {/* BMI */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">BMI</label>
            <input
              name="bmi"
              placeholder="Calculated BMI"
              value={formData.bmi}
              readOnly
              className="input"
            />
            {formData.bmi && (
              <p className="text-xs mt-1 text-gray-600">
                Category:{" "}
                <span
                  className={`font-semibold ${
                    formData.bmiCategory === "Normal"
                      ? "text-green-600"
                      : formData.bmiCategory === "Underweight"
                      ? "text-blue-600"
                      : formData.bmiCategory === "Overweight"
                      ? "text-orange-600"
                      : formData.bmiCategory === "Obese"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {formData.bmiCategory}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Medical Summary & Observations */}
      <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
        <h3 className="text-md font-semibold text-[#292D96]">Medical Summary & Observations</h3>
        <textarea
          name="report_info"
          placeholder="Write medical summary and observations here..."
          value={formData.report_info}
          onChange={handleChange}
          className="textarea h-40 w-full"
        />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleAddNote("bullet")}
            className="btn-secondary flex items-center gap-2"
          >
            <ListBulletIcon className="h-5 w-5 text-[#292D96]" />
            Bullet
          </button>
          <button
            type="button"
            onClick={() => handleAddNote("checkbox")}
            className="btn-secondary flex items-center gap-2"
          >
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-[#292D96]" />
            Checkbox
          </button>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
        <h3 className="text-md font-semibold text-[#292D96]">Attachments</h3>
        <label className="text-xs text-gray-500 block mb-2">Lab results, X-rays, etc.</label>
        <label className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-3 py-1.5 text-sm font-medium hover:bg-[#292D96] hover:text-white transition cursor-pointer">
          Choose Files
          <input type="file" multiple onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md border border-green-600 text-green-600 px-4 py-2 text-sm font-medium hover:bg-green-600 hover:text-white transition"
        >
          Save Report
        </button>
      </div>
    </form>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
