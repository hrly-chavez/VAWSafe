// src/pages/social_worker/Sessions/Sessions.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import api from "../../../api/axios";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await api.get("/api/social_worker/sessions/pending&Ongoing/");
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

  return (
    <div className="w-full px-6">
      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-[#292D96] pt-6 mb-2">
        Sessions
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">
        List of Scheduled Sessions
      </p>

      {/* Search + Filter */}
      <div className="mt-4 w-full flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center w-full md:w-2/3 border border-neutral-300 rounded-lg px-3 py-2">
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
      <div className="mt-6 bg-white rounded-xl shadow-md border border-neutral-200">
        <div className="overflow-x-auto rounded-xl">

          <table className="min-w-full table-fixed border border-neutral-200">
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 text-sm font-semibold">
              <tr>
                <th className="border px-4 py-3 text-left">Victim Name</th>
                <th className="border px-4 py-3 text-left">Case No.</th>
                <th className="border px-4 py-3 text-left">Session No.</th>
                <th className="border px-4 py-3 text-left">Schedule Date</th>
                <th className="border px-4 py-3 text-left">Status</th>
                <th className="border px-4 py-3 text-left">Assigned Official(s)</th>
                <th className="border px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-500">
                    Loading sessions…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-500 italic">
                    No sessions found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filtered.map((s, idx) => {
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                  return (
                    <tr key={s.sess_id} className={rowBg}>
                      <td className="border px-4 py-3">{s.victim_name || "—"}</td>
                      <td className="border px-4 py-3">{s.case_no || "—"}</td>
                      <td className="border px-4 py-3">{s.sess_num || "—"}</td>
                      <td className="border px-4 py-3">{formatDate(s.sess_next_sched)}</td>
                      <td className="border px-4 py-3">
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
                      <td className="border px-4 py-3">
                        {s.official_names && s.official_names.length > 0
                          ? s.official_names.join(", ")
                          : "—"}
                      </td>
                      <td className="border px-4 py-3 text-center">
                        <Link
                          to={`/social_worker/sessions/${s.sess_id}`}
                          className="text-[#10b981] hover:text-[#059669]"
                        >
                          <EyeIcon className="h-5 w-5 inline" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
