import React, { useState, useEffect } from "react";
import { ListBulletIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function NurseReportForm({ victim, incident, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    bmi: "",
    report_info: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddNote = (type) => {
    let newText = "";
    if (type === "bullet") newText = "\n• ";
    if (type === "checkbox") newText = "\n☐ ";
    setFormData({ ...formData, report_info: formData.report_info + newText });
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 text-sm text-gray-700 max-h-[80vh] overflow-y-scroll p-4"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#292D96]">Monthly Patient Report</h2>
        <p className="text-xs text-gray-500 mt-1">Nurse Medical Assessment</p>
      </div>

      {/* Vitals & Measurements */}
      <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
        <h3 className="text-md font-semibold text-[#292D96]">Vitals & Measurements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className={`font-semibold ${formData.bmiCategory === "Normal"
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
      <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
        <h3 className="text-md font-semibold text-[#292D96]">Medical Summary & Observations</h3>
        <textarea
          name="report_info"
          placeholder="Write medical summary and observations here..."
          value={formData.report_info}
          onChange={handleChange}
          className="textarea h-32 w-full"
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white py-2">
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
