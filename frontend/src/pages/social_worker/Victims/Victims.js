import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Victims.css";

export default function Victims() {
  const [victims, setVictims] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/social_worker/victims/")
      .then((res) => setVictims(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (vic_id) => {
    if (window.confirm("Are you sure you want to delete this victim?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/social_worker/victims/${vic_id}/`);
        setVictims(victims.filter((v) => v.vic_id !== vic_id));
      } catch (err) {
        console.error("Error deleting victim", err);
      }
    }
  };

  return (
    <div className="sw-victims-page">
      <div className="sw-victims-card">
        <h2 className="victimstext">VAWC Victims</h2>
        <p className="list-text">List of VAWC Victims</p>

        <div className="table-container">
          <table className="table-victims">
            <thead>
              <tr>
                <th>Victim No.</th>
                <th>Victim Name</th>
                <th>Age</th>
                <th>Place / Barangay</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {victims.length > 0 ? (
                victims.map((v) => (
                  <tr key={v.vic_id}>
                    <td>{v.vic_id}</td>
                    <td>
                      {v.vic_first_name} {v.vic_middle_name || ""} {v.vic_last_name} {v.vic_extension || ""}
                    </td>
                    <td>{v.age || "N/A"}</td>
                    <td>{v.vic_birth_place || "N/A"}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/social_worker/victims/${v.vic_id}`} className="btn-view">
                          View
                        </Link>
                        <Link to={`/social_worker/victims/${v.vic_id}/edit`} className="btn-edit">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(v.vic_id)} className="btn-delete">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No victims found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );  
}
