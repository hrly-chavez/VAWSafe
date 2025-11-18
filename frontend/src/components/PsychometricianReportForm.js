import React, { useState } from "react";

const tabs = [
  { key: "reason_for_referral", label: "Reason for Referral" },
  { key: "brief_history", label: "Brief History" },
  { key: "behavioral_observation", label: "Behavioral Observation" },
  { key: "test_results_discussion", label: "Test Results & Discussion" },
  { key: "recommendations", label: "Recommendations" },
];

export default function PsychometricianReportForm({ victim, incident, onSubmit }) {
  const [formData, setFormData] = useState({
    reason_for_referral: "",
    brief_history: "",
    behavioral_observation: "",
    test_results_discussion: "",
    recommendations: "",
  });

  const [activeTab, setActiveTab] = useState("reason_for_referral");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="text-sm text-gray-700">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-[#292D96]">Psychometrician's Report</h2>
        <p className="text-xs text-gray-500 mt-1">Comprehensive Psychological Assessment</p>
      </div>

      {/* Victim Info */}
      <div className="mb-6">
        <p className="text-xs text-gray-500">Client Name:</p>
        <p className="font-medium text-lg">{victim.full_name || "—"}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b border-gray-300">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md ${
              activeTab === tab.key
                ? "bg-[#292D96] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Section */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-md font-semibold text-[#292D96] mb-2">
          {tabs.find((t) => t.key === activeTab)?.label}
        </h3>
        <textarea
          name={activeTab}
          value={formData[activeTab]}
          onChange={handleChange}
          placeholder={`Provide detailed ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase()}...`}
          className="w-full border rounded-md p-3 text-sm text-gray-800 resize-none h-40"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            setFormData({
              reason_for_referral: "",
              brief_history: "",
              behavioral_observation: "",
              test_results_discussion: "",
              recommendations: "",
            })
          }
          className="px-4 py-2 text-sm font-medium border border-gray-400 text-gray-600 rounded-md hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium border border-[#292D96] text-[#292D96] rounded-md hover:bg-[#292D96] hover:text-white transition"
        >
          Save Comprehensive Report
        </button>
      </div>
    </form>
  );
}
