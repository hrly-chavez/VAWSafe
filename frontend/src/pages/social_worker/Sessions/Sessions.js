// src/pages/social_worker/Sessions/Session.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Sessions.css";
import api from "../../../api/axios";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    api
      .get("/api/social_worker/sessions/pending&Ongoing/")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Failed to fetch sessions", err));
  }, []);

  const filtered = sessions.filter((s) => {
    const matchesSearch = (s.victim_name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter
      ? s.sess_status === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div>
      <div className="flex min-h-screen bg-white">
        <div className="sw-sessions-page">
          <div className="sw-sessions-card">
            <h2 className="sessionstext">Sessions</h2>
            <p className="list-text">List of Scheduled Sessions</p>

            {/* Search & Filter Row */}
            <div className="row-one mb-4 flex flex-wrap gap-3 items-center">
              {/* Search box */}
              <div className="search">
                <input
                  type="text"
                  placeholder="Search victim name..."
                  className="searchbar"
                  aria-label="Search sessions"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <img src="/images/loupe.png" alt="Search" />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>

            {/* Table */}
            <div className="table-container overflow-x-auto">
              <table className="table-sessions min-w-full border rounded shadow-sm">
                <thead>
                  <tr>
                    <th>Victim Name</th>
                    <th>Case No.</th>
                    <th>Session No.</th>
                    <th>Schedule Date</th>
                    <th>Status</th>
                    <th>Assigned Official(s)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((s, idx) => (
                      <tr key={idx}>
                        <td>{s.victim_name || "—"}</td>
                        <td>{s.case_no || "—"}</td>
                        <td>{s.sess_num || "—"}</td>
                        <td>{formatDate(s.sess_next_sched)}</td>

                        {/* Status badge */}
                        <td>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              s.sess_status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : s.sess_status === "Ongoing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {s.sess_status}
                          </span>
                        </td>

                        {/* Officials */}
                        <td>
                          {s.official_names && s.official_names.length > 0
                            ? s.official_names.join(", ")
                            : "—"}
                        </td>

                        <td className="flex gap-2">
                          <Link
                            to={`/social_worker/sessions/${s.sess_id}`}
                            className="text-blue-700 bg-blue-100 px-3 py-1 rounded hover:bg-blue-200"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center text-gray-500 py-4"
                      >
                        No sessions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
