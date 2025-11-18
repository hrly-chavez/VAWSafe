// src/components/PsychometricianReportForm.js
import React, { useState } from "react";

export default function PsychometricianReportForm({ victim, incident, onSubmit }) {
  const [formData, setFormData] = useState({
    psychological_tests: "",
    observations: "",
    recommendations: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-700">
      <InfoItem label="Victim Name" value={victim.full_name} />
      <textarea name="psychological_tests" placeholder="Psychological Tests" value={formData.psychological_tests} onChange={handleChange} className="textarea" />
      <textarea name="observations" placeholder="Observations" value={formData.observations} onChange={handleChange} className="textarea" />
      <textarea name="recommendations" placeholder="Recommendations" value={formData.recommendations} onChange={handleChange} className="textarea" />
      <button type="submit" className="btn-primary">Save Report</button>
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
