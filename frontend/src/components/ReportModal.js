// ReportModal.js
export default function ReportModal({ report, userRole, onClose, onEdit }) {
  if (!report) return null;

  return (
    <div className="space-y-4 text-sm text-gray-700">
      <h2 className="text-xl font-bold text-[#292D96]">
        {report.report_type} Report —{" "}
        {new Date(report.report_month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </h2>

      <p><strong>Prepared by:</strong> {report.prepared_by_name}</p>
      <p><strong>Height:</strong> {report.height} cm</p>
      <p><strong>Weight:</strong> {report.weight} kg</p>
      <p><strong>BMI:</strong> {report.bmi}</p>

      <div>
        <p className="text-xs text-gray-500 mb-1">Medical Summary & Observations</p>
        <p className="whitespace-pre-wrap bg-gray-50 border rounded-md p-3">{report.report_info}</p>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onEdit} className="px-4 py-2 text-sm font-medium border border-[#292D96] text-[#292D96] rounded-md hover:bg-[#292D96] hover:text-white transition">
          Edit Report
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-gray-400 text-gray-600 rounded-md hover:bg-gray-100 transition">
          Close
        </button>
      </div>
    </div>
  );
}
