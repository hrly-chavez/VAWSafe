//src/pages/desk_officer/Victims/VictimDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../api/axios";

export default function VictimDetails() {
  const { vic_id } = useParams();
  const [victim, setVictim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("victim");


  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(`api/desk_officer/victims/${vic_id}/`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setVictim(data || null);
      } catch (err) {
        setError(
          err?.response?.status
            ? `Error ${err.response.status}`
            : "Request failed"
        );
      } finally {
        setLoading(false);
      }
    };

    if (vic_id) run();
  }, [vic_id]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialTab = params.get("tab");
    if (initialTab) setActiveTab(initialTab);
  }, []);
  // small helper to read whichever key exists (keeps UI from going blank if fields differ)
  const get = (obj, keys, fallback = "N/A") => {
    for (const k of keys) {
      if (obj && obj[k] != null && obj[k] !== "") return obj[k];
    }
    return fallback;
  };

  const fullName = victim
    ? [
      get(
        victim,
        ["vic_first_name", "first_name", "fname", "given_name"],
        ""
      ),
      get(victim, ["vic_middle_name", "middle_name", "mname"], ""),
      get(victim, ["vic_last_name", "last_name", "lname", "surname"], ""),
      get(victim, ["vic_extension", "name_suffix"], ""),
    ]
      .filter(Boolean)
      .join(" ")
    : "";

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <h1 className="text-2xl font-bold text-[#292D96] px-6 pt-6">
          Victim Details
        </h1>
        <div className="flex flex-1 gap-6 px-6 py-8 max-w-screen-xl mx-auto w-full">
          {/* Left: Profile Sidebar */}
          <div className="w-[300px] bg-white rounded-xl shadow p-4 border flex flex-col items-center">
            {/* Profile Photo */}
            <img
              src={get(victim, ["vic_photo", "photo_url", "photo"], "")}
              alt="Victim"
              className="h-[180px] w-[180px] object-cover rounded-md mb-4 border"
            />

            {/* Name & ID */}
            <div className="text-center w-full">
              <h2 className="text-xl font-semibold text-[#292D96]">{fullName || "N/A"}</h2>
              <p className="text-sm text-gray-500 mt-1">Victim ID: {get(victim, ["vic_id", "id"])}</p>
            </div>

            {/* Case Info Container */}
            <div className="mt-6 w-full space-y-3">
              <h3 className="text-base font-semibold text-[#292D96] mb-1">Case Information</h3>

              {[
                { label: "Case No.", value: get(victim?.case_report, ["case_no", "case_number"]) },
                { label: "Intake Form Date", value: get(victim?.case_report, ["intake_date", "form_date"]) },
                { label: "Handling Organization", value: get(victim?.case_report, ["handling_org", "organization"]) },
                { label: "Case Manager", value: get(victim?.case_report, ["case_manager", "manager_name"]) },
                { label: "Position", value: get(victim?.case_report, ["manager_position", "position"]) },
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-md px-4 py-3 border shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Tabbed Content */}
          <div className="flex-1 bg-white rounded-xl shadow p-6 border">
            {/* Tab Menu */}
            <div className="flex space-x-6 border-b mb-6">
              {[
                { key: "victim", label: "Victim Information" },
                { key: "perpetrator", label: "Perpetrator Information" },
                { key: "incident", label: "Incident Reports & Records" },
                { key: "sessions", label: "Sessions" },
                { key: "faces", label: "Face Samples" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                setActiveTab(tab.key);
                window.history.replaceState(null, "", `?tab=${tab.key}`);
              }}
                  className={`pb-2 text-sm font-medium ${activeTab === tab.key
                    ? "text-[#292D96] border-b-2 border-[#292D96]"
                    : "text-gray-500 hover:text-[#292D96]"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="text-sm text-gray-800">
              {activeTab === "victim" && (
                <div>
                  <h4 className="text-lg font-semibold text-[#292D96] mb-4">Victim Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", value: fullName },
                      { label: "Sex", value: get(victim, ["vic_sex", "sex", "gender"]) },
                      { label: "SOGIE", value: get(victim, ["vic_sogie", "sogie"]) },
                      { label: "Date of Birth", value: get(victim, ["vic_birth_date", "birth_date"]) },
                      { label: "Birth Place", value: get(victim, ["vic_birth_place", "birth_place", "place"]) },
                      { label: "Age", value: get(victim, ["age"]) },
                      { label: "Civil Status", value: get(victim, ["vic_civil_status", "civil_status"]) },
                      { label: "Educational Attainment", value: get(victim, ["vic_education", "education"]) },
                      { label: "Nationality", value: get(victim, ["vic_nationality", "nationality"]) },
                      { label: "Ethnicity", value: get(victim, ["vic_ethnicity", "ethnicity"]) },
                      { label: "Occupation", value: get(victim, ["vic_occupation", "occupation"]) },
                      { label: "Monthly Income", value: get(victim, ["vic_monthly_income", "monthly_income"]) },
                      { label: "Religion", value: get(victim, ["vic_religion", "religion"]) },
                      { label: "Contact No.", value: get(victim, ["vic_contact", "contact"]) },
                    ].map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-md px-4 py-3 border shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-gray-800">{item.value || "—"}</p>
                      </div>

                    ))}
                  </div>

                  {/* Full Address in its own row */}
                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-md px-4 py-3 border shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Full Address</p>
                      <p className="text-sm font-medium text-gray-800">{get(victim, ["vic_address", "address"]) || "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "perpetrator" && (
                <div>
                  <h4 className="text-lg font-semibold text-[#292D96] mb-4">Perpetrator Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        label: "Full Name",
                        value: [
                          get(victim?.incidents?.[0]?.perpetrator, ["per_first_name", "first_name"], ""),
                          get(victim?.incidents?.[0]?.perpetrator, ["per_last_name", "last_name"], "")
                        ].filter(Boolean).join(" ")
                      },
                      { label: "Sex", value: get(victim?.incidents?.[0]?.perpetrator, ["per_sex", "sex"]) },
                      { label: "Date of Birth", value: get(victim?.incidents?.[0]?.perpetrator, ["per_birth_date", "birth_date"]) },
                      { label: "Birth Place", value: get(victim?.incidents?.[0]?.perpetrator, ["per_birth_place", "birth_place"]) },
                      { label: "Nationality", value: get(victim?.incidents?.[0]?.perpetrator, ["per_nationality", "nationality"]) },
                      { label: "Occupation", value: get(victim?.incidents?.[0]?.perpetrator, ["per_occupation", "occupation"]) },
                      { label: "Religion", value: get(victim?.incidents?.[0]?.perpetrator, ["per_religion", "religion"]) },
                    ].map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-md px-4 py-3 border shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-gray-800">{item.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "incident" && (
                <div>
                  <h4 className="text-lg font-semibold text-[#292D96] mb-2">Incident Reports & Records</h4>
                  <p>Review incident descriptions, locations, and evidence.</p>
                </div>
              )}

              {activeTab === "sessions" && (
                <div>
                  <h4 className="text-lg font-semibold text-[#292D96] mb-2">Sessions</h4>
                  <p>Track session history, status, and assigned personnel.</p>
                </div>
              )}
              {activeTab === "faces" && (
            <div>
              <h4 className="text-lg font-semibold text-[#292D96] mb-4">
                Victim Face Samples
              </h4>
              {victim.face_samples && victim.face_samples.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {victim.face_samples.map((sample, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg shadow-sm bg-gray-50 p-2 flex flex-col items-center"
                    >
                      <img
                        src={sample.photo}
                        alt={`Face Sample ${idx + 1}`}
                        className="w-full h-40 object-cover rounded"
                      />
                      <p className="text-xs text-gray-500 mt-2">Sample {idx + 1}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No face samples available.</p>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
        {/* Back Button Below Right Section */}
        <div className="max-w-screen-xl mx-auto w-full px-6 pb-8 flex justify-end">
          <Link
            to="/desk_officer/victims"
            className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-3 py-1.5 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
          >
            ← Back to List
          </Link>
        </div>
      </div>
    </>
  );
}
