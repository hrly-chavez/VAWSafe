import React, { useState } from "react";

const tabs = [
  { key: "social_service", label: "Social Service" },
  { key: "medical_service", label: "Medical Service" },
  { key: "psychological_service", label: "Psychological Service" },
  { key: "homelife_service", label: "Homelife Service" },
];

export default function SocialWorkerReportForm({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    social_service: "",
    medical_service: "",
    psychological_service: "",
    homelife_service: "",
  });

  const [activeTab, setActiveTab] = useState("social_service");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const insertFormat = (format) => {
    const currentText = formData[activeTab] || "";
    let newText = currentText;

    if (format === "bullet") {
      newText += "\n•\tItem 1\n•\tItem 2\n•\tItem 3\n";
    }
    if (format === "number") {
      newText += "\n1.\tItem 1\n2.\tItem 2\n3.\tItem 3\n";
    }
    if (format === "letter") {
      newText += "\na.\tItem 1\nb.\tItem 2\nc.\tItem 3\n";
    }

    setFormData({ ...formData, [activeTab]: newText });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="text-sm text-gray-700 max-h-[80vh] overflow-y-auto p-4"
    >
      {/* Title */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-[#292D96]">Social Worker's Report</h2>
        <p className="text-xs text-gray-500 mt-1">Monthly Progress Documentation</p>
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
        <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
          <h3 className="text-base font-semibold text-[#292D96]">
            {tabs.find((t) => t.key === activeTab)?.label}
          </h3>

          {/* Word-style formatting toolbar */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => insertFormat("bullet")}
              title="Bullet"
              className="px-2 py-1 text-sm font-medium border border-gray-300 rounded hover:bg-gray-100"
            >
              •
            </button>
            <button
              type="button"
              onClick={() => insertFormat("number")}
              title="Numbered List"
              className="px-2 py-1 text-sm font-medium border border-gray-300 rounded hover:bg-gray-100"
            >
              1.
            </button>
            <button
              type="button"
              onClick={() => insertFormat("letter")}
              title="Lettered List"
              className="px-2 py-1 text-sm font-medium border border-gray-300 rounded hover:bg-gray-100"
            >
              a.
            </button>
          </div>
        </div>

        <textarea
          name={activeTab}
          value={formData[activeTab]}
          onChange={handleChange}
          placeholder={`Type your ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} here...`}
          className="w-full border border-gray-300 rounded-md p-3 text-base text-gray-800 resize-none h-72 focus:outline-none focus:ring-2 focus:ring-[#292D96]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white py-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium border border-gray-400 text-gray-600 rounded-md hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium border border-[#292D96] text-[#292D96] rounded-md hover:bg-[#292D96] hover:text-white transition"
        >
          Save Monthly Report
        </button>
      </div>
    </form>
  );
}
