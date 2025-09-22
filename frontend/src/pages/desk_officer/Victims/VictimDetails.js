//src/pages/desk_officer/Victims/VictimDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api/axios";
import CaseTreeModal from "./CaseTreeModal";
import SessionDetails from "./SessionDetails";

export default function VictimDetails() {
  const { vic_id } = useParams();
  const [victim, setVictim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incidentList, setIncidentList] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [openSessionIndex, setOpenSessionIndex] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  useEffect(() => {
    const fetchVictim = async () => {
      try {
        const res = await api.get(`/api/desk_officer/victims/${vic_id}/`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setVictim(data || null);
      } catch (err) {
        setError(err?.response?.status ? `Error ${err.response.status}` : "Request failed");
      } finally {
        setLoading(false);
      }
    };


    // PISTI NANI WA NASAD NI GANA, DI NA KA FETCH NA AHAK NAMAN NI OIIII
    const fetchIncidents = async () => {
      try {
        const res = await api.get(`/api/desk_officer/case/${vic_id}/`);
        if (Array.isArray(res.data)) {
          setIncidentList(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch incidents", err);
      }
    };

    if (vic_id) {
      fetchVictim();
      fetchIncidents();
    }
  }, [vic_id]);

  const get = (obj, keys, fallback = "N/A") => {
    for (const k of keys) {
      if (obj && obj[k] != null && obj[k] !== "") return obj[k];
    }
    return fallback;
  };

  const fullName = victim
    ? [
        get(victim, ["vic_first_name", "first_name", "fname", "given_name"], ""),
        get(victim, ["vic_middle_name", "middle_name", "mname"], ""),
        get(victim, ["vic_last_name", "last_name", "lname", "surname"], ""),
        get(victim, ["vic_extension", "name_suffix"], ""),
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const isMinor = victim?.vic_child_class != null;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Banner */}
      <div
        className="h-[200px] w-full bg-cover bg-center absolute top-0 left-0 z-0"
        style={{ backgroundImage: "url('/images/DSWD1.jpg')" }}
      />

      <div className="relative z-10 pt-[120px] px-6 max-w-screen-lg mx-auto space-y-10">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <img
            src={get(victim, ["vic_photo", "photo_url", "photo"], "")}
            alt="Victim"
            className="h-[220px] w-[220px] object-cover rounded-full border-4 border-white shadow-xl"
          />
        </div>

        {/* Name & ID */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#292D96]">{fullName || "N/A"}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Victim ID: {get(victim, ["vic_id", "id"], "—")}
          </p>
        </div>

        {/* Victim Info */}
        <div className="bg-white border rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[#292D96] mb-4">Victim Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "Sex", value: get(victim, ["vic_sex", "sex", "gender"]) },
              { label: "Gender and Sexual Identity", value: get(victim, ["vic_specific_sogie"]) },
              { label: "Birth Date", value: get(victim, ["vic_birth_date"]) },
              { label: "Birth Place", value: get(victim, ["vic_birth_place"]) },
              { label: "Nationality", value: get(victim, ["vic_nationality"]) },
              { label: "Religion", value: get(victim, ["vic_religion"]) },
              { label: "Civil Status", value: get(victim, ["vic_civil_status"]) },
              { label: "Educational Attainment", value: get(victim, ["vic_educational_attainment"]) },
              { label: "Employment Status", value: get(victim, ["vic_employment_status"]) },
              { label: "Main Occupation", value: get(victim, ["vic_main_occupation"]) },
              { label: "Monthly Income", value: get(victim, ["vic_monthly_income"]) },
              { label: "PWD Type", value: get(victim, ["vic_PWD_type"]) },
              { label: "Migratory Status", value: get(victim, ["vic_migratory_status"]) },
              { label: "Contact Number", value: get(victim, ["vic_contact_number"]) },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-md px-4 py-3 border shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-sm font-medium text-gray-800">{item.value || "—"}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-1">Full Address</p>
            <p className="text-sm font-medium text-gray-800 bg-gray-50 border rounded-md p-3 whitespace-pre-wrap break-words">
              {get(victim, ["vic_current_address"], "—")}
            </p>
          </div>
        </div>

        {isMinor && (
          <div className="mt-8 bg-white border rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#292D96] mb-4">Minor Classification & Guardian Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "Child Classification", value: get(victim, ["vic_child_class"]) },
                { label: "Guardian First Name", value: get(victim, ["vic_guardian_fname"]) },
                { label: "Guardian Middle Name", value: get(victim, ["vic_guardian_mname"]) },
                { label: "Guardian Last Name", value: get(victim, ["vic_guardian_lname"]) },
                { label: "Guardian Contact", value: get(victim, ["vic_guardian_contact"]) },
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-md px-4 py-3 border shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-[#292D96] mb-4">Case Information</h3>
        {incidentList.map((incident, index) => (
          <div key={index} className="border rounded-md p-4 shadow-sm bg-gray-50">
            {/* Case Info + Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-700">
              <p>
                <span className="font-medium text-gray-800">Case No:</span>{" "}
                {incident.incident_num || "—"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedIncident(incident);
                    setShowModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-3 py-1.5 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
                >
                  View Case Details
                </button>
                <button
                  onClick={() => {
                    const isSame = openSessionIndex === index;
                    setOpenSessionIndex(isSame ? null : index);
                    setSelectedSessionId(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-green-600 text-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-600 hover:text-white transition"
                >
                  {openSessionIndex === index ? "Hide Sessions" : "View Sessions"}
                </button>
              </div>
            </div>

            {/* Sessions */}
            {openSessionIndex === index && (
              <div className="mt-4 space-y-4">
                <p className="text-sm font-semibold text-[#292D96]">Sessions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(incident.sessions || []).map((session) => (
                    <div
                      key={session.sess_id}
                      className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition cursor-pointer"
                      onClick={() => setSelectedSessionId(session.sess_id)}
                    >
                      <h4 className="text-base font-semibold text-[#292D96] mb-2">
                        Session {session.sess_num || "—"}
                      </h4>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            session.sess_status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : session.sess_status === "Ongoing"
                              ? "bg-blue-100 text-blue-700"
                              : session.sess_status === "Done"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {session.sess_status}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Date:</span>{" "}
                        {session.sess_next_sched || session.sess_date_today || "—"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Location:</span>{" "}
                        {session.sess_location || "—"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Assigned Official:</span>{" "}
                        {session.official_name || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Back Button */}
        <div className="flex justify-end">
          <Link
            to="/desk_officer/victims"
            className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
          >
            ← Back to List
          </Link>
        </div>
      </div>

      {/* Case Modal */}
      {showModal && selectedIncident && (
        <CaseTreeModal
          selectedIncident={selectedIncident}
          onClose={() => {
            setShowModal(false);
            setSelectedIncident(null);
          }}
        />
      )}

      {/* Session Modal */}
      {selectedSessionId && (
        <SessionDetails
          sessionId={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
    </div>
  );
}
