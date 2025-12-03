import React, { useState } from "react";
import SectionHeader from "./SectionHeader";

const checkboxGroups = {
    presentation: ["Oriented/alert", "Disorganized", "Tangential", "Preoccupied", "Circumstantial"],
    affect: ["Appropriate", "Inappropriate", "Labile", "Constricted", "Blunted", "Flat"],
    mood: ["Euthymic", "Depressed", "Dysphoric", "Anxious", "Angry", "Euphoric", "Stable"],
    interpersonal: [
        "Congenial", "Guarded", "Open/candid", "Patient/cooperative", "Friendly/polite", "Quiet/withdrawn",
        "Distant/disengaged", "Annoyed", "Engaging", "Hostile", "Shy", "Motivated", "Relaxed", "Cautious/defensive", "Irritable"
    ],
    subjective_reports: [
        "Feels Depressed", "Feeling anxious", "Unmotivated", "Little sleep", "Too much sleep", "Feels overwhelmed", "Feels directionless",
        "Feels stressed", "Feeling hopeless", "Difficulty breathing", "Heavy chest/chest pain", "Irritability", "Mood Swings", "Loss of appetite",
        "Overeating", "Conflict with fellow resident", "Conflict with staff"
    ],
    observations: [
        "Seems depressed", "Seems anxious", "Lack of motivation", "Sleeping too much", "Issues with partner",
        "Seems overwhelmed", "Seems better overall", "Seems worse overall", "Seems stressed", "Improved intimacy",
        "Decreased intimacy", "Communication improved", "Fighting increased", "Fighting less", "Communication worse",
        "Maintaining progress", "Mood swings better", "Mood swings worse", "Anxiety decreasing", "Seems self-conscious",
        "Anger issues", "Moving through grief", "Lack of focus/organization", "Seems more secure", "More self-confident",
        "Increase in motivation", "Defeating self-talk", "Better self-care", "Committed to intervention",
        "Better time management", "Becoming isolated", "Continues to blame others", "Taking more responsibility for emotions",
        "More self-aware", "Breaking self-defeating patterns", "Difficulty breaking patterns", "Establishing better boundaries"
    ],
    psychological_testing: ["TONI 4", "NEO PI-R", "BPI", "Suicidal Ideation", "Intention to act"],
};

export default function PsychometricianMonthlyReport({ victim, incident, onSubmit }) {
    const [formData, setFormData] = useState({
        ...Object.keys(checkboxGroups).reduce((acc, key) => ({ ...acc, [key]: [], [`${key}_other`]: "" }), {}),
        safety_issues: [],
        safety_issues_other: "",
        client_has: [],
        previous_diagnosis: "",
        latest_checkup_psychologist: "",
        latest_checkup_psychiatrist: "",
        on_medication: false,
        medication_name: "",
        medication_dosage: "",
        summary_of_results: "",
        recommendations: "",
    });

    const toggleCheckbox = (group, value) => {
        setFormData((prev) => {
            let current = prev[group] || [];
            if (group === "safety_issues") {
                if (value === "None") {
                    current = current.includes("None") ? [] : ["None"];
                } else {
                    current = current.filter((v) => v !== "None");
                    current = current.includes(value)
                        ? current.filter((v) => v !== value)
                        : [...current, value];
                }
            } else {
                current = current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value];
            }
            return { ...prev, [group]: current };
        });
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

    return (
        <form onSubmit={handleSubmit} className="text-sm text-gray-700 space-y-4 max-h-[80vh] overflow-y-scroll p-4">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-[#292D96]">Monthly Progress Report</h2>
                <p className="text-xs text-gray-500 mt-1">Psychometrician's Assessment</p>
            </div>

            {/* 1. Presentation */}
            {/* 2. Affect */}
            {/* 3. Mood */}
            {/* 4. Interpersonal */}
            {["presentation", "affect", "mood", "interpersonal"].map((group) => (
                <div key={group} className="bg-white border rounded-lg shadow-sm p-3">
                    <SectionHeader icon="/images/clipboard.png" title={group.charAt(0).toUpperCase() + group.slice(1)} />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {checkboxGroups[group].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                                <input type="checkbox" checked={formData[group].includes(opt)} onChange={() => toggleCheckbox(group, opt)} />
                                {opt}
                            </label>
                        ))}
                    </div>
                    <input type="text" name={`${group}_other`} placeholder="Other..." value={formData[`${group}_other`]} onChange={handleChange} className="mt-2 w-full border rounded-md p-2 text-sm" />
                </div>
            ))}

            {/* 5. Safety Issues */}
            <div className="bg-white border rounded-lg shadow-sm p-3">
                <SectionHeader icon="/images/warning.png" title="Safety Issues" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {["None", "Suicidal Ideation", "Homicidal Ideation", "Other"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.safety_issues.includes(opt)} onChange={() => toggleCheckbox("safety_issues", opt)} />
                            {opt}
                        </label>
                    ))}
                </div>
                <input type="text" name="safety_issues_other" placeholder="Other..." value={formData.safety_issues_other} onChange={handleChange} className="mt-2 w-full border rounded-md p-2 text-sm" />
            </div>

            {/* Client Has (conditional) */}
            {formData.safety_issues.some(issue => ["Suicidal Ideation", "Homicidal Ideation", "Other"].includes(issue)) && (
                <div className="bg-white border rounded-lg shadow-sm p-3">
                    <SectionHeader icon="/images/clipboard.png" title="Client Has" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {["Intention to act", "Plan to act", "Means to act"].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.client_has.includes(opt)} onChange={() => toggleCheckbox("client_has", opt)} />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* 6-8. Previous Diagnosis, Psychologist, Psychiatrist */}
            {[
                { name: "previous_diagnosis", label: "Previous Diagnosis (if any)" },
                { name: "latest_checkup_psychologist", label: "Latest Check-up with Psychologist" },
                { name: "latest_checkup_psychiatrist", label: "Latest Check-up with Psychiatrist" }
            ].map(({ name, label }) => (
                <div key={name}><p className="text-xs text-gray-500">{label}</p>
                    <textarea name={name} value={formData[name]} onChange={handleChange} className="w-full border rounded-md p-3 text-sm text-gray-800 resize-none h-24" />
                </div>
            ))}

            {/* 9. On Medication */}
            <div className="bg-white border rounded-lg shadow-sm p-3">
                <SectionHeader icon="/images/pill.png" title="Medication" />
                <label className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        checked={formData.on_medication}
                        onChange={(e) =>
                            setFormData({ ...formData, on_medication: e.target.checked })
                        }
                    />
                    On Medication?
                </label>
                {formData.on_medication && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <input
                            type="text"
                            name="medication_name"
                            placeholder="Medication Name"
                            value={formData.medication_name}
                            onChange={handleChange}
                            className="border rounded-md p-2 text-sm"
                        />
                        <input
                            type="text"
                            name="medication_dosage"
                            placeholder="Dosage"
                            value={formData.medication_dosage}
                            onChange={handleChange}
                            className="border rounded-md p-2 text-sm"
                        />
                    </div>
                )}
            </div>

            {/* 10. Subjective Reports */}
            <div className="bg-white border rounded-lg shadow-sm p-3">
                <SectionHeader icon="/images/clipboard.png" title="Subjective Reports" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {checkboxGroups.subjective_reports.map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.subjective_reports.includes(opt)}
                                onChange={() => toggleCheckbox("subjective_reports", opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
                <input
                    type="text"
                    name="subjective_reports_other"
                    placeholder="Other..."
                    value={formData.subjective_reports_other}
                    onChange={handleChange}
                    className="mt-2 w-full border rounded-md p-2 text-sm"
                />
            </div>

            {/* 11. Observations */}
            <div className="bg-white border rounded-lg shadow-sm p-3">
                <SectionHeader icon="/images/clipboard.png" title="Observations" />
                <div className="grid grid-cols-2 gap-2 mt-2 pr-2">
                    {checkboxGroups.observations.map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.observations.includes(opt)}
                                onChange={() => toggleCheckbox("observations", opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
                <input
                    type="text"
                    name="observations_other"
                    placeholder="Other..."
                    value={formData.observations_other}
                    onChange={handleChange}
                    className="mt-2 w-full border rounded-md p-2 text-sm"
                />
            </div>

            {/* 12. Psychological Testing */}
            <div className="bg-white border rounded-lg shadow-sm p-3">
                <SectionHeader icon="/images/clipboard.png" title="Psychological Testing (if conducted)" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {checkboxGroups.psychological_testing.map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.psychological_testing.includes(opt)}
                                onChange={() => toggleCheckbox("psychological_testing", opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
                <input
                    type="text"
                    name="psychological_testing_other"
                    placeholder="Other..."
                    value={formData.psychological_testing_other}
                    onChange={handleChange}
                    className="mt-2 w-full border rounded-md p-2 text-sm"
                />
            </div>

            {/* 13. Summary of Results */}
            <div>
                <p className="text-xs text-gray-500">Summary of Results</p>
                <textarea
                    name="summary_of_results"
                    value={formData.summary_of_results}
                    onChange={handleChange}
                    className="w-full border rounded-md p-3 text-sm text-gray-800 resize-none h-32"
                />
            </div>

            {/* 14. Recommendations */}
            <div>
                <p className="text-xs text-gray-500">Recommendations</p>
                <textarea
                    name="recommendations"
                    value={formData.recommendations}
                    onChange={handleChange}
                    className="w-full border rounded-md p-3 text-sm text-gray-800 resize-none h-32"
                />
            </div>

            {/* Save Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full py-3 text-white bg-[#292D96] rounded-md font-semibold hover:bg-[#1e237e] transition"
                >
                    Save Monthly Progress Report
                </button>
            </div>
        </form>
    );
}