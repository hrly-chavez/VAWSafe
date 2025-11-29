import React, { useEffect, useState } from "react";
import api from "../../../api/axios"; // <-- your axios instance

export default function LoginTracker() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const res = await api.get("/api/dswd/login-tracker/");
      setLogs(res.data);
    } catch (error) {
      console.error("Failed to load login logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const filteredLogs =
    filter === "All"
      ? logs
      : logs.filter((log) => log.status === filter);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Login Tracker</h1>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="All">All</option>
          <option value="Success">Success Logins</option>
          <option value="Failed">Failed Attempts</option>
        </select>
      </div>

      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Username Attempted</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">IP Address</th>
                <th className="p-3 border">User Agent</th>
                <th className="p-3 border">Login Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    No logs available.
                  </td>
                </tr>
              )}

              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-3 border">
                    {log.official_name || "Unknown"}
                  </td>

                  <td className="p-3 border">
                    {log.username_attempted || ""}
                  </td>

                  <td className="p-3 border">{log.role || "N/A"}</td>

                  <td className="p-3 border">
                    <span
                      className={
                        log.status === "Success"
                          ? "text-green-700 font-semibold"
                          : "text-red-700 font-semibold"
                      }
                    >
                      {log.status}
                    </span>
                  </td>

                  <td className="p-3 border">
                    {log.ip_address || "Unknown"}
                  </td>

                  <td className="p-3 border max-w-sm overflow-hidden text-ellipsis">
                    {log.user_agent}
                  </td>

                  <td className="p-3 border">
                    {formatDate(log.login_time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
