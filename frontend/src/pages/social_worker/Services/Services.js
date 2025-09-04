import React from "react";
import { Link } from "react-router-dom";
import "./Services.css";
import Navbar from '../../Navbar';
import Sidebar from '../../Sidebar';

/**
 * Social Worker > Services page
 * - Full-bleed wrapper to match DSWD width without touching SidebarLayout.css
 * - Card layout inside, responsive on all screen sizes
 */
export default function Services() {
  return (
    <div>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="sw-services-page">
          <div className="sw-services-card">
            <h2 className="servicetext">Service</h2>
            <p className="list-text">List of Services</p>

            <div className="row-one">
              {/* Search */}
              <div className="search">
                <input
                  type="text"
                  placeholder="Search"
                  className="searchbar"
                  aria-label="Search services"
                />
                <img src="/images/loupe.png" alt="Search" />
              </div>

              {/* Filters */}
              <div className="row-one-filter">
                <div className="filter-group">
                  <label htmlFor="service" className="service">Service</label>
                  <select id="service" name="service">
                    <option value="All">All</option>
                    <option value="Financial">Financial</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Counseling">Counseling</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="type" className="type">Case Type</label>
                  <select id="type" name="type">
                    <option value="All">All</option>
                    <option value="Physical">Physical</option>
                    <option value="Emotional">Emotional</option>
                    <option value="Sexual">Sexual</option>
                    <option value="Psychological">Psychological</option>
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
                    <th>Schedule</th>
                    <th>Case Type</th>
                    <th>Service</th>
                    <th>Intake Form</th>
                  </tr>
                </thead>
                <tbody>
                  {/* TODO: map your data */}
                  <tr>
                    <td>1</td>
                    <td>Rhodjien Caratao</td>
                    <td>—</td>
                    <td>Psychological Abuse</td>
                    <td>In Progress</td>
                    <td>
                      <Link to="/social_worker/case-records">View Form</Link>
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
