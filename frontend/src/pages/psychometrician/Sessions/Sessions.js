// src/pages/psychometrician/Sessions/Sessions.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await api.get("/api/psychometrician/sessions/pending&Ongoing/");
        setSessions(
          (Array.isArray(res.data) ? res.data : []).sort(
            (a, b) => new Date(b.sess_next_sched) - new Date(a.sess_next_sched)
          )
        );
      } catch (err) {
        console.error("Failed to fetch sessions", err);
        setError("Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, []);

  const filtered = sessions.filter((s) => {
    const matchesSearch = (s.victim_name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? s.sess_status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const parts = dateStr.split("T");
    const date = parts[0];
    const time = parts[1]?.slice(0, 5);
    const [year, month, day] = date.split("-");
    const readableDate = new Date(`${year}-${month}-${day}T00:00:00`);
    return `${readableDate.toLocaleDateString("en-US", { dateStyle: "medium" })} ${convertTo12Hour(time)}`;
  };

  const convertTo12Hour = (hhmm) => {
    if (!hhmm) return "—";
    let [h, m] = hhmm.split(":");
    h = parseInt(h, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${suffix}`;
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSessions = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="w-full px-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Sessions</h1>
        <p className="text-gray-500 mt-1">VAWSAFE | Psychometrician | Session Management</p>
      </header>

      {/* Search + Filter */}
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center w-full md:w-1/3 border border-neutral-300 rounded-lg px-3 py-2 bg-white shadow-sm">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by victim name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-neutral-900 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-neutral-300 rounded-md px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
        <div className="rounded-xl">
          <table className="min-w-full table-fixed border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 font-semibold shadow">
              <tr>
                <th className="px-3 py-2 text-left border">Victim Name</th>
                <th className="px-3 py-2 text-left border">Case No.</th>
                <th className="px-3 py-2 text-left border">Session No.</th>
                <th className="px-3 py-2 text-left border">Schedule Date</th>
                <th className="px-3 py-2 text-left border">Status</th>
                <th className="px-3 py-2 text-left border">Assigned Official(s)</th>
                <th className="px-3 py-2 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-500">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : currentSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-500 italic">
                    No sessions found.
                  </td>
                </tr>
              ) : (
                currentSessions.map((s, idx) => {
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                  return (
                    <tr key={s.sess_id} className={`${rowBg} hover:bg-blue-50 transition`}>
                      <td className="px-3 py-2 border">{s.victim_name || "—"}</td>
                      <td className="px-3 py-2 border">{s.case_no || "—"}</td>
                      <td className="px-3 py-2 border">{s.sess_num || "—"}</td>
                      <td className="px-3 py-2 border">{formatDate(s.sess_next_sched)}</td>
                      <td className="px-3 py-2 border">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${s.sess_status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : s.sess_status === "Ongoing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                        >
                          {s.sess_status}
                        </span>
                      </td>
                      <td className="px-3 py-2 border">
                        {s.official_names && s.official_names.length > 0
                          ? s.official_names.join(", ")
                          : "—"}
                      </td>
                      <td className="px-3 py-2 border text-center">
                        <Link
                          to={`/psychometrician/sessions/${s.sess_id}`}
                          className="text-[#10b981] hover:text-[#059669]"
                        >
                          <EyeIcon className="h-5 w-5 inline" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} entries
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
    </div>
  );
}