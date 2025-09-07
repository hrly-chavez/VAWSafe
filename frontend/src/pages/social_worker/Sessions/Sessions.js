import React from "react";
import { Link } from "react-router-dom";
import "./Sessions.css";
import Navbar from "../../Navbar";

export default function Sessions() {
  return (
    <div>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        <div className="sw-sessions-page">
          <div className="sw-sessions-card">
            <h2 className="sessionstext">Sessions</h2>
            <p className="list-text">List of Sessions</p>

            {/* Search + Filters */}
            <div className="row-one">
              {/* Search */}
              <div className="search">
                <input
                  type="text"
                  placeholder="Search"
                  className="searchbar"
                  aria-label="Search sessions"
                />
                <img src="/images/loupe.png" alt="Search" />
              </div>

              {/* Filters */}
              <div className="row-one-filter">
                <div className="filter-group">
                  <label htmlFor="caseType" className="type">Case Type</label>
                  <select id="caseType" name="caseType">
                    <option value="All">All</option>
                    <option value="Physical">Physical</option>
                    <option value="Emotional">Emotional</option>
                    <option value="Sexual">Sexual</option>
                    <option value="Psychological">Psychological</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="sessionType" className="type">Session</label>
                  <select id="sessionType" name="sessionType">
                    <option value="All">All</option>
                    <option value="Counseling">Counseling</option>
                    <option value="Interview">Interview</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="table-container">
              <table className="table-sessions">
                <thead>
                  <tr>
                    <th>Victim No.</th>
                    <th>Victim Name</th>
                    <th>Schedule</th>
                    <th>Case Type</th>
                    <th>Session</th>
                    <th>Session Form</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example row */}
                  <tr>
                    <td>1</td>
                    <td>Rhodjien Caratao</td>
                    <td>2025-08-15</td>
                    <td>Psychological Abuse</td>
                    <td>Counseling</td>
                    <td>
                      <Link to="/social_worker/sessions/view">View Form</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
