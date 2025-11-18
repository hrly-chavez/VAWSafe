// src/components/SocialWorkerReportForm.js
import React, { useState } from "react";

export default function SocialWorkerReportForm({ victim, incident, onSubmit }) {
  const [formData, setFormData] = useState({
    social_interventions: "",
    referrals: "",
    follow_up: "",
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
      <textarea name="social_interventions" placeholder="Social Interventions" value={formData.social_interventions} onChange={handleChange} className="textarea" />
      <textarea name="referrals" placeholder="Referrals" value={formData.referrals} onChange={handleChange} className="textarea" />
      <textarea name="follow_up" placeholder="Follow-up Plans" value={formData.follow_up} onChange={handleChange} className="textarea" />
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
