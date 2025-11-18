import SectionHeader from "./SectionHeader";

export default function ReportModal({ report, userRole, currentOfficialId, onClose, onEdit }) {
  if (!report) return null;

  const getCategoryColor = (category) => {
    switch (category) {
      case "Normal": return "text-green-600";
      case "Underweight": return "text-blue-600";
      case "Overweight": return "text-orange-600";
      case "Obese": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const safeJoin = (val) =>
    Array.isArray(val) ? val.join(", ") : val || "—";

  return (
    <div className="bg-white border rounded-xl shadow-md p-6 space-y-8 text-sm text-gray-700">
      {/* Header */}
      <SectionHeader icon="/images/case_details.png" title={`${report.report_type || "Report"}`} />

      {/* Common Info */}
      <div className="space-y-4">
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
            <h3 className="text-md font-semibold text-[#292D96]">Vitals & Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <h3 className="text-md font-semibold text-[#292D96]">Medical Summary & Observations</h3>
            <p className="whitespace-pre-wrap bg-white border rounded-md p-3 text-gray-800">
              {report.report_info || "—"}
            </p>
          </div>
        </>
      )}

      {/* Psychometrician Comprehensive Report */}
      {report.report_type?.toLowerCase().includes("comprehensive") && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
          <h3 className="text-md font-semibold text-[#292D96]">Comprehensive Report Details</h3>
          <p><span className="font-medium">Reason for Referral:</span> {report.reason_for_referral || "—"}</p>
          <p><span className="font-medium">Brief History:</span> {report.brief_history || "—"}</p>
          <p><span className="font-medium">Behavioral Observation:</span> {report.behavioral_observation || "—"}</p>
          <p><span className="font-medium">Test Results & Discussion:</span> {report.test_results_discussion || "—"}</p>
          <p><span className="font-medium">Recommendations:</span> {report.recommendations || "—"}</p>
        </div>
      )}

      {/* Psychometrician Monthly Progress Report */}
      {report.report_type?.toLowerCase().includes("monthly") && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
          <h3 className="text-md font-semibold text-[#292D96]">Monthly Progress Details</h3>
          <p><span className="font-medium">Presentation:</span> {safeJoin(report.presentation)}</p>
          <p><span className="font-medium">Affect:</span> {safeJoin(report.affect)}</p>
          <p><span className="font-medium">Mood:</span> {safeJoin(report.mood)}</p>
          <p><span className="font-medium">Interpersonal:</span> {safeJoin(report.interpersonal)}</p>
          <p><span className="font-medium">Safety Issues:</span> {safeJoin(report.safety_issues)}</p>
          <p><span className="font-medium">Client Has:</span> {safeJoin(report.client_has)}</p>
          <p><span className="font-medium">Subjective Reports:</span> {safeJoin(report.subjective_reports)}</p>
          <p><span className="font-medium">Observations:</span> {safeJoin(report.observations)}</p>
          <p><span className="font-medium">Psychological Testing:</span> {safeJoin(report.psychological_testing)}</p>
          <p><span className="font-medium">Previous Diagnosis:</span> {report.previous_diagnosis || "—"}</p>
          <p><span className="font-medium">Latest Check-up (Psychologist):</span> {report.latest_checkup_psychologist || "—"}</p>
          <p><span className="font-medium">Latest Check-up (Psychiatrist):</span> {report.latest_checkup_psychiatrist || "—"}</p>
          <p><span className="font-medium">On Medication:</span> {report.on_medication ? "Yes" : "No"}</p>
          {report.on_medication && (
            <p><span className="font-medium">Medication:</span> {report.medication_name} ({report.medication_dosage})</p>
          )}
          <p><span className="font-medium">Summary of Results:</span> {report.summary_of_results || "—"}</p>
          <p><span className="font-medium">Recommendations:</span> {report.recommendations || "—"}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
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

        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium border border-gray-400 text-gray-600 rounded-md hover:bg-gray-100 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
