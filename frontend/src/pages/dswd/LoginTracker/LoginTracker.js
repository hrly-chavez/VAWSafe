import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function LoginTracker() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default 
  
  useEffect(() => {
    if (logs.length > 0) {
      const now = new Date();
      const fourteenDays = 14 * 24 * 60 * 60 * 1000;

      const hasOldLogs = logs.some((log) => {
        const logTime = new Date(log.login_time).getTime();
        return now - logTime > fourteenDays;
      });

      if (hasOldLogs) {
        cleanupOldLogs();
      }
    }
  }, [logs]);

  async function cleanupOldLogs() {
    try {
      await api.delete("/api/dswd/login-tracker/cleanup/");
      loadLogs(); // refresh UI after cleanup
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  }


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

  // Filtering logic
  const filteredLogs = logs.filter((log) => {
    const matchesStatus =
      statusFilter === "All" ? true : log.status === statusFilter;
    const matchesRole =
      roleFilter === "All" ? true : log.role === roleFilter;
    const matchesSearch =
      searchQuery === ""
        ? true
        : (log.official_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (log.username_attempted || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesRole && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  // Collect unique roles for dropdown
  const uniqueRoles = ["All", ...new Set(logs.map((log) => log.role).filter(Boolean))];

  return (
    <div className="w-full px-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Login Tracker</h1>
        <p className="text-gray-500 mt-1">
          Monitoring victims, incidents, and monthly reports.
        </p>
      </header>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Search Bar (no label, left side) */}
        <div className="flex items-center w-full md:w-1/3 border border-neutral-300 rounded-lg px-3 py-2 bg-white shadow-sm">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-sm text-neutral-900 outline-none"
          />
        </div>

        {/* Filters aligned right */}
        <div className="flex flex-row items-end gap-6">
          {/* Status Filter */}
          <div className="flex flex-col text-sm">
            <label className="text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white shadow-sm"
            >
              <option value="All">All Status</option>
              <option value="Success">Success Logins</option>
              <option value="Failed">Failed Attempts</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex flex-col text-sm">
            <label className="text-gray-600 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white shadow-sm"
            >
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size Filter */}
          <div className="flex flex-col text-sm">
            <label className="text-gray-600 mb-1">Rows per page</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="border border-neutral-300 rounded-lg px-3 py-2 bg-white shadow-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-neutral-500">Loading logs…</p>
      ) : (
        <>
          <div className="mt-6 bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
            <div className="rounded-xl">
              <table className="min-w-full table-fixed border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 font-semibold shadow">
                  <tr>
                    <th className="w-32 px-2 py-2 text-left border">Name</th>
                    <th className="w-40 px-2 py-2 text-left border">Username Attempted</th>
                    <th className="w-24 px-2 py-2 text-left border">Role</th>
                    <th className="w-24 px-2 py-2 text-left border">Status</th>
                    <th className="w-32 px-2 py-2 text-left border">IP Address</th>
                    <th className="w-64 px-2 py-2 text-left border">User Agent</th>
                    <th className="w-40 px-2 py-2 text-left border">Login Time</th>
                  </tr>
                </thead>

                <tbody className="text-gray-800">
                  {currentLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-2 py-4 text-center text-neutral-500 italic"
                      >
                        No logs available.
                      </td>
                    </tr>
                  ) : (
                    currentLogs.map((log, index) => {
                      const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";
                      return (
                        <tr
                          key={log.id}
                          className={`${rowBg} hover:bg-gray-100 transition`}
                        >
                          <td className="px-2 py-2 border truncate">
                            {log.official_name || "Unknown"}
                          </td>
                          <td className="px-2 py-2 border truncate">
                            {log.username_attempted || ""}
                          </td>
                          <td className="px-2 py-2 border truncate">{log.role || "N/A"}</td>
                          <td className="px-2 py-2 border">
                            <span
                              className={`px-2 py-0.5 text-xs rounded font-semibold ${log.status === "Success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 border truncate">
                            {log.ip_address || "Unknown"}
                          </td>
                          <td className="px-2 py-2 border truncate max-w-[250px]">
                            {log.user_agent}
                          </td>
                          <td className="px-2 py-2 border truncate">
                            {formatDate(log.login_time)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Summary + Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, filteredLogs.length)} of{" "}
                {filteredLogs.length} entries
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded ${currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#292D96] text-white hover:bg-blue-700"
                    }`}
                >
                  &laquo;
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-2 py-1 rounded ${currentPage === i + 1
                      ? "bg-[#292D96] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded ${currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#292D96] text-white hover:bg-blue-700"
                    }`}
                >
                  &raquo;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}