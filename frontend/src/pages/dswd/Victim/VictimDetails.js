// ----- START OF OVERHAULED DESIGN -----

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api/axios";
import CaseTreeModal from "./CaseTreeModal";
import SessionDetails from "./SessionDetail";

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
    return () => (document.body.style.overflow = "auto");
  }, [showModal]);

  useEffect(() => {
    const fetchVictim = async () => {
      try {
        const res = await api.get(`/api/social_worker/victims/${vic_id}/`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setVictim(data || null);
      } catch (err) {
        setError(err?.response?.status ? `Error ${err.response.status}` : "Request failed");
      } finally {
        setLoading(false);
      }
    };

    const fetchIncidents = async () => {
      try {
        const res = await api.get(`/api/dswd/victims/case/${vic_id}/`);
        if (Array.isArray(res.data)) setIncidentList(res.data);
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
      if (obj?.[k]) return obj[k];
    }
    return fallback;
  };

  const firstName = get(victim, ["vic_first_name", "first_name", "fname", "given_name"], "");
  const middleName = get(victim, ["vic_middle_name", "middle_name", "mname"], "");
  const lastName = get(victim, ["vic_last_name", "last_name", "lname", "surname"], "");
  const extension = get(victim, ["vic_extension", "name_suffix"], "");

  const fullName = [firstName, middleName, lastName, extension]
    .filter((part) => part && part !== "N/A")
    .join(" ");


  const isMinor = victim?.vic_child_class != null;

  if (loading)
    return <div className="p-8 text-center text-gray-600">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="h-[180px] md:h-[240px] w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/DSWD1.jpg')" }}
      />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 -mt-20 pb-20 relative">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <img
            src={get(victim, ["vic_photo"])}
            alt="Victim"
            className="h-[180px] w-[180px] md:h-[220px] md:w-[220px] object-cover rounded-full border-4 border-white shadow-xl bg-white"
          />
        </div>

        {/* Name */}
        <div className="text-center mt-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#292D96]">
            {fullName || "N/A"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Victim ID: {get(victim, ["vic_id"])}
          </p>
        </div>

        {/* Victim Information Card */}
        <section className="bg-white shadow-md border rounded-xl p-6 mt-8">
          <h3 className="text-xl font-semibold text-[#292D96] mb-4">
            Victim Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Sex", value: get(victim, ["vic_sex"]) },
              { label: "Gender Identity", value: get(victim, ["vic_specific_sogie"]) },
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
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 border rounded-lg shadow-sm"
              >
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-1">Full Address</p>
            <p className="text-sm font-medium bg-gray-50 border rounded-lg p-4">
              {get(victim, ["vic_current_address"])}
            </p>
          </div>
        </section>

        {/* Minor Section */}
        {isMinor && (
          <section className="bg-white shadow-md border rounded-xl p-6 mt-8">
            <h3 className="text-xl font-semibold text-[#292D96] mb-4">
              Minor Classification & Guardian Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Child Classification", value: get(victim, ["vic_child_class"]) },
                { label: "Guardian First Name", value: get(victim, ["vic_guardian_fname"]) },
                { label: "Guardian Middle Name", value: get(victim, ["vic_guardian_mname"]) },
                { label: "Guardian Last Name", value: get(victim, ["vic_guardian_lname"]) },
                { label: "Guardian Contact", value: get(victim, ["vic_guardian_contact"]) },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 border rounded-lg shadow-sm"
                >
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {item.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Case Info */}
        <section className="mt-10">
          <h3 className="text-xl font-semibold text-[#292D96] mb-4">
            Case Information
          </h3>

          <div className="space-y-6">
            {incidentList.map((incident, index) => (
              <div
                key={index}
                className="bg-white border rounded-xl shadow-sm p-5"
              >
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <p className="font-medium text-gray-700">
                    Case No:{" "}
                    <span className="text-gray-900">
                      {incident.incident_num || "—"}
                    </span>
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedIncident(incident);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 border border-[#292D96] text-[#292D96] rounded-lg hover:bg-[#292D96] hover:text-white transition"
                    >
                      View Case Details
                    </button>

                    <button
                      onClick={() =>
                        setOpenSessionIndex(
                          openSessionIndex === index ? null : index
                        )
                      }
                      className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition"
                    >
                      {openSessionIndex === index
                        ? "Hide Sessions"
                        : "View Sessions"}
                    </button>
                  </div>
                </div>

                {/* Sessions */}
                {openSessionIndex === index && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {incident.sessions?.map((session) => (
                      <div
                        key={session.sess_id}
                        className="p-4 bg-gray-50 border rounded-lg shadow cursor-pointer hover:shadow-md"
                        onClick={() => setSelectedSessionId(session.sess_id)}
                      >
                        <h4 className="font-semibold text-[#292D96]">
                          Session {session.sess_num || "—"}
                        </h4>

                        <p className="text-sm mt-1">
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
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

                        {/* Dates */}
                        <p className="text-sm mt-1">
                          <span className="font-medium">Scheduled:</span>{" "}
                          {session.sess_next_sched
                            ? new Date(session.sess_next_sched).toLocaleString()
                            : "—"}
                        </p>

                        {session.sess_date_today && (
                          <p className="text-sm">
                            <span className="font-medium">Started:</span>{" "}
                            {new Date(session.sess_date_today).toLocaleString()}
                          </p>
                        )}

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
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Back Button */}
        <div className="flex justify-end mt-10">
          <Link
            to="/dswd/victims"
            className="px-5 py-2 border border-[#292D96] text-[#292D96] rounded-lg hover:bg-[#292D96] hover:text-white transition"
          >
            ← Back to List
          </Link>
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedIncident && (
        <CaseTreeModal
          selectedIncident={selectedIncident}
          onClose={() => {
            setShowModal(false);
            setSelectedIncident(null);
          }}
        />
      )}

      {selectedSessionId && (
        <SessionDetails
          sessionId={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
    </div>
  );
}

// ----- END OF OVERHAULED DESIGN -----
