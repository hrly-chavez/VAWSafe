import SectionHeader from "./SectionHeader";

export default function ReportModal({ report, userRole, currentOfficialId, onClose, onEdit }) {
  if (!report) return null;

  const renderCheckboxGroup = (title, options, values, otherValue, icon = "/images/clipboard.png") => (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <SectionHeader icon={icon} title={title} />
      <div className="grid grid-cols-2 gap-2 mt-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2">
            <input type="checkbox" checked={values?.includes(opt)} disabled />
            {opt}
          </label>
        ))}
      </div>
      {otherValue && (
        <p className="mt-2 text-sm text-gray-600">Other: {otherValue}</p>
      )}
    </div>
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case "Normal": return "text-green-600";
      case "Underweight": return "text-blue-600";
      case "Overweight": return "text-orange-600";
      case "Obese": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getBoxColorClass = (type) => {
    const lower = type?.toLowerCase();
    if (lower.includes("nurse")) return "border-blue-600 hover:border-blue-700";
    if (lower.includes("psychometrician")) return "border-red-600 hover:border-red-700";
    return "border-gray-300 hover:border-gray-400";
  };

  const safeJoin = (val) =>
    Array.isArray(val) ? val.join(", ") : val || "—";

  return (
    <div className="bg-white border rounded-xl shadow-md p-6 text-sm text-gray-700 
                max-h-[80vh] overflow-y-scroll space-y-4">
      {/* Header */}
      <SectionHeader icon="/images/case_details.png" title={`${report.report_type || "Report"}`} />

      {/* Common Info */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Report Month</p>
        <p className="font-medium">
          {report.report_month
            ? new Date(report.report_month).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
            : "—"}
        </p>

        <p className="text-xs text-gray-500">Prepared By</p>
        <p className="font-medium">{report.prepared_by_name || "—"}</p>
      </div>

      {/* Nurse Report */}
      {report.report_type?.toLowerCase().includes("nurse") && (
        <>
          <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Vitals & Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Height</p><p className="font-medium">{report.height} cm</p></div>
              <div><p className="text-xs text-gray-500">Weight</p><p className="font-medium">{report.weight} kg</p></div>
              <div>
                <p className="text-xs text-gray-500">BMI</p>
                <p className="font-medium">{report.bmi}</p>
                {report.bmi_category && (
                  <p className="text-xs mt-1 text-gray-600">
                    Category:{" "}
                    <span className={`font-semibold ${getCategoryColor(report.bmi_category)}`}>
                      {report.bmi_category}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Medical Summary & Observations</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.report_info || "—"}
            </p>
          </div>
        </>
      )}

      {/* Psychometrician Comprehensive Report */}
      {report.report_type?.toLowerCase().includes("comprehensive") && (
        <div className="space-y-4">
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Reason for Referral</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.reason_for_referral || "—"}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Brief History</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.brief_history || "—"}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Behavioral Observation</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.behavioral_observation || "—"}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Test Results & Discussion</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.test_results_discussion || "—"}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Recommendations</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.recommendations || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Psychometrician Comprehensive Report */}
      {report.report_type?.toLowerCase().includes("comprehensive") && (
        <div className="space-y-4">
          {["reason_for_referral", "brief_history", "behavioral_observation", "test_results_discussion", "recommendations"].map((field, idx) => (
            <div key={idx} className="bg-gray-50 border rounded-lg p-4">
              <h3 className="text-md font-semibold text-[#292D96] mb-2">
                {field.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              </h3>
              <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
                {report[field] || "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Psychometrician Monthly Progress Report */}
      {report.report_type?.toLowerCase().includes("monthly") && (
        <div className="space-y-4">
          {renderCheckboxGroup("Presentation",
            ["Oriented/alert", "Disorganized", "Tangential", "Preoccupied", "Circumstantial"],
            report.presentation, report.presentation_other)}

          {renderCheckboxGroup("Affect",
            ["Appropriate", "Inappropriate", "Labile", "Constricted", "Blunted", "Flat"],
            report.affect, report.affect_other)}

          {renderCheckboxGroup("Mood",
            ["Euthymic", "Depressed", "Dysphoric", "Anxious", "Angry", "Euphoric", "Stable"],
            report.mood, report.mood_other)}

          {renderCheckboxGroup("Interpersonal",
            ["Congenial", "Guarded", "Open/candid", "Patient/cooperative", "Friendly/polite", "Quiet/withdrawn", "Distant/disengaged", "Annoyed", "Engaging", "Hostile", "Shy", "Motivated", "Relaxed", "Cautious/defensive", "Irritable"],
            report.interpersonal, report.interpersonal_other)}

          {renderCheckboxGroup("Safety Issues",
            ["None", "Suicidal Ideation", "Homicidal Ideation", "Other"],
            report.safety_issues, report.safety_issues_other, "/images/warning.png")}

          {renderCheckboxGroup("Client Has",
            ["Intention to act", "Plan to act", "Means to act"],
            report.client_has, report.client_has_other)}

          {renderCheckboxGroup("Subjective Reports",
            ["Feels Depressed", "Feeling anxious", "Unmotivated", "Little sleep", "Too much sleep", "Feels overwhelmed", "Feels directionless", "Feels stressed", "Feeling hopeless", "Difficulty breathing", "Heavy chest/chest pain", "Irritability", "Mood Swings", "Loss of appetite", "Overeating", "Conflict with fellow resident", "Conflict with staff"],
            report.subjective_reports, report.subjective_reports_other)}

          {renderCheckboxGroup("Observations",
            ["Seems depressed", "Seems anxious", "Lack of motivation", "Sleeping too much", "Issues with partner", "Seems overwhelmed", "Seems better overall", "Seems worse overall", "Seems stressed", "Improved intimacy", "Decreased intimacy", "Communication improved", "Fighting increased", "Fighting less", "Communication worse", "Maintaining progress", "Mood swings better", "Mood swings worse", "Anxiety decreasing", "Seems self-conscious", "Anger issues", "Moving through grief", "Lack of focus/organization", "Seems more secure", "More self-confident", "Increase in motivation", "Defeating self-talk", "Better self-care", "Committed to intervention", "Better time management", "Becoming isolated", "Continues to blame others", "Taking more responsibility for emotions", "More self-aware", "Breaking self-defeating patterns", "Difficulty breaking patterns", "Establishing better boundaries"],
            report.observations, report.observations_other)}

          {renderCheckboxGroup("Psychological Testing",
            ["TONI 4", "NEO PI-R", "BPI", "Suicidal Ideation", "Intention to act"],
            report.psychological_testing, report.psychological_testing_other)}

          {/* Previous Diagnosis */}
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <SectionHeader icon="/images/clipboard.png" title="Previous Diagnosis" />
            <p className="whitespace-pre-wrap bg-gray-50 border rounded-md p-3 text-gray-800">
              {report.previous_diagnosis || "—"}
            </p>
          </div>

          {/* Services Availed */}
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <SectionHeader icon="/images/serviced.png" title="Services Availed (Sessions)" />
            <ul className="list-disc ml-6">
              {report.individual_sessions?.length > 0
                ? report.individual_sessions.map((s) => (
                  <li key={s.sess_id}>
                    {s.session_type_names?.join(", ") || "—"} —{" "}
                    {s.sess_date_today
                      ? new Date(s.sess_date_today).toLocaleDateString("en-US")
                      : "—"}
                  </li>
                ))
                : "—"}
            </ul>
          </div>

          {/* Checkups */}
          <p><span className="font-medium">Latest Check-up (Psychologist):</span> {report.latest_checkup_psychologist || "—"}</p>
          <p><span className="font-medium">Latest Check-up (Psychiatrist):</span> {report.latest_checkup_psychiatrist || "—"}</p>

          {/* Medication */}
          <p><span className="font-medium">On Medication:</span> {report.on_medication ? "Yes" : "No"}</p>
          {report.on_medication && (
            <p><span className="font-medium">Medication:</span> {report.medication_name} ({report.medication_dosage})</p>
          )}

          {/* Summary of Results */}
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <SectionHeader icon="/images/clipboard.png" title="Summary of Results" />
            <p className="whitespace-pre-wrap bg-gray-50 border rounded-md p-3 text-gray-800">
              {report.summary_of_results || "—"}
            </p>
          </div>

          {/* Recommendations */}
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <SectionHeader icon="/images/clipboard.png" title="Recommendations" />
            <p className="whitespace-pre-wrap bg-gray-50 border rounded-md p-3 text-gray-800">
              {report.recommendations || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Social Worker Monthly Report */}
      {report.report_type?.toLowerCase().includes("social worker") && (
        <div className="space-y-4">
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Social Service</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.social_service || "—"}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Medical Service</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.medical_service || "—"}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Psychological Service</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.psychological_service || "—"}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="text-md font-semibold text-[#292D96] mb-2">Homelife Service</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.homelife_service || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 bg-white py-2">
        {userRole === "nurse" &&
          report.report_type?.toLowerCase().includes("nurse") &&
          String(report.prepared_by_id) === String(currentOfficialId) && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition"
            >
              Edit Report
            </button>
          )}

        {userRole === "psychometrician" &&
          String(report.prepared_by_id) === String(currentOfficialId) && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium border border-[#292D96] text-[#292D96] rounded-md hover:bg-[#292D96] hover:text-white transition"
            >
              Edit Report
            </button>
          )}

        {userRole === "social worker" &&
          String(report.prepared_by_id) === String(currentOfficialId) && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white transition"
            >
              Edit Report
            </button>
          )}
      </div>
    </div>
  );
}
