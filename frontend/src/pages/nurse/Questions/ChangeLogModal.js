//src/pages/psychometrician/Questions/ChangeLogModal.js
import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function ChangeLogModal({ questionId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) return;

    const fetchLogs = async () => {
      try {
        const res = await api.get("/api/psychometrician/change-logs/");
        // Filter logs only for this specific question
        const filtered = res.data.filter(
          (log) =>
            log.record_id === questionId &&
            (log.model_name === "Question" ||
              log.model_name === "SessionTypeQuestion")
        );
        setLogs(filtered);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [questionId]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-xl font-bold text-blue-700 mb-4">
          Change Logs for Question #{questionId}
        </h2>

        {/* Logs Table */}
        {loading ? (
          <p className="text-gray-500 text-center">Loading logs...</p>
        ) : logs.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto border rounded">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Action</th>
                  <th className="p-2 border">Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors duration-100"
                  >
                    <td className="border p-2 text-gray-700">
                      {new Date(log.created_at).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="border p-2 text-gray-700">
                      {log.user_name || "System"}
                    </td>
                    <td
                      className={`border p-2 font-semibold ${
                        log.action === "CREATE"
                          ? "text-green-600"
                          : log.action === "UPDATE"
                          ? "text-blue-600"
                          : log.action === "DELETE"
                          ? "text-red-600"
                          : log.action === "ASSIGN"
                          ? "text-purple-600"
                          : "text-gray-700"
                      }`}
                    >
                      {log.action === "ASSIGN"
                        ? "Assignment"
                        : log.action.charAt(0) +
                          log.action.slice(1).toLowerCase()}
                    </td>
                    <td className="border p-2 whitespace-pre-line leading-relaxed text-gray-700">
                      {log.description || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center italic">
            No logs found for this question.
          </p>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
