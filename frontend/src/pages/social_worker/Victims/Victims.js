import React from "react";
import { Link } from "react-router-dom";
import "./Victims.css";

export default function Victims() {
  return (
    <div className="sw-victims-page">
      <div className="sw-victims-card">
        <h2 className="victimstext">VAWC Victims</h2>
        <p className="list-text">List of VAWC Victims</p>

        {/* Search + Filters */}
        <div className="row-one">
          {/* Search */}
          <div className="search">
            <input
              type="text"
              placeholder="Search"
              className="searchbar"
              aria-label="Search victims"
            />
            <img src="/images/loupe.png" alt="Search" />
          </div>

          {/* Filters */}
          <div className="row-one-filter">
            <div className="filter-group">
              <label htmlFor="violence" className="type">Type of Violence</label>
              <select id="violence" name="violence">
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
          <table className="table-victims">
            <thead>
              <tr>
                <th>Victim No.</th>
                <th>Victim Name</th>
                <th>Gender</th>
                <th>Type of Violence</th>
                <th>Perpetrators</th>
                <th>Intake Form</th>
              </tr>
            </thead>
            <tbody>
              {/* Example data row */}
              <tr>
                <td>1</td>
                <td>Jane Doe</td>
                <td>Female</td>
                <td>Psychological Abuse</td>
                <td>John Doe</td>
                <td>
                  <Link to="/social_worker/case-records">View Form</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
