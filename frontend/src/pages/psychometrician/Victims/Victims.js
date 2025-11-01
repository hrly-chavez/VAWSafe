import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchVictimFacial from "./SearchVictimFacial";
import "./Victims.css";
import api from "../../../api/axios";

export default function Victims() {
  const [victims, setVictims] = useState([]);
  const [showFacialModal, setShowFacialModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadVictims = async () => {
      try {
        const res = await api.get("/api/psychometrician/victims/");
        setVictims(res.data);
        console.log("Fetched victims:", res.data); // optional debug
      } catch (err) {
        console.error("Error fetching victims:", err);
      }
    };

    loadVictims();
  }, []);

  const handleDelete = async (vic_id) => {
    if (window.confirm("Are you sure you want to delete this victim?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/psychometrician/victims/${vic_id}/`);
        setVictims(victims.filter((v) => v.vic_id !== vic_id));
      } catch (err) {
        console.error("Error deleting victim", err);
      }
    }
  };

  return (
    <div>

      <div className="flex min-h-screen bg-white">
        <div className="sw-victims-page">
          <div className="sw-victims-card">
            <div className="victim-header-row flex justify-between items-center">
              <p className="list-text">List of VAWC Victims</p>
              <button
                className="btn-search-facial bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowFacialModal(true)}
              >
                Search Facial
              </button>
            </div>

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
                            <Link to={`/psychometrician/victims/${v.vic_id}`} className="btn-view">View</Link>
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

          {/* Modal injected here */}
          {showFacialModal && (
            <SearchVictimFacial
              onClose={() => setShowFacialModal(false)}
              onFound={(victimId) => {
                setShowFacialModal(false);
                navigate(`/psychometrician/victims/${victimId}`);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

