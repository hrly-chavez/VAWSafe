import React from "react";
import { Link } from "react-router-dom";
import "./CaseRecords.css";

export default function CaseRecords() {
  return (
    <div className="sw-case-records-page">
      <div className="sw-case-records-card">
        <h2 className="caserecordstext">Case Records</h2>
        <p className="list-text">List of Case Records</p>

        {/* Search + Filters */}
        <div className="row-one">
          {/* Search */}
          <div className="search">
            <input
              type="text"
              placeholder="Search"
              className="searchbar"
              aria-label="Search case records"
            />
            <img src="/images/loupe.png" alt="Search" />
          </div>

          {/* Filters */}
          <div className="row-one-filter">
            <div className="filter-group">
              <label htmlFor="caseType" className="type">Case</label>
              <select id="caseType" name="caseType">
                <option value="All">All</option>
                <option value="Physical">Physical</option>
                <option value="Emotional">Emotional</option>
                <option value="Sexual">Sexual</option>
                <option value="Psychological">Psychological</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="gender" className="type">Gender</label>
              <select id="gender" name="gender">
                <option value="All">All</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="table-case-records">
            <thead>
              <tr>
                <th>Case No.</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Barangay</th>
                <th>Case</th>
                <th>Intake Form</th>
              </tr>
            </thead>
            <tbody>
              {/* Example data row */}
              <tr>
                <td>1</td>
                <td>Maria Santos</td>
                <td>Female</td>
                <td>32</td>
                <td>Barangay 12</td>
                <td>Physical Abuse</td>
                <td>
                  <Link to="/social_worker/case-records/view">View Form</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
