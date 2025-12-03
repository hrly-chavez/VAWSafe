import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { CheckBadgeIcon, UserIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, MapPinIcon } from "@heroicons/react/24/solid";

export default function ViewOfficials() {
  const { of_id } = useParams();
  const navigate = useNavigate();

  const [official, setOfficial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [audits, setAudits] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [auditsError, setAuditsError] = useState("");

  const formatChange = (field, value) => {
    const fieldLabels = {
      of_fname: "First Name",
      of_lname: "Last Name",
      of_m_initial: "Middle Initial",
      of_suffix: "Suffix",
      of_sex: "Sex",
      of_dob: "Date of Birth",
      of_pob: "Place of Birth",
      of_contact: "Contact",
      of_email: "Email",
      deleted_at: "Deleted At",
      username: "Username",
    };
    const label = fieldLabels[field] || field;
    if (Array.isArray(value) && value.length === 2) {
      return `${label} changed from ${value[0]} to ${value[1]}`;
    } else if (Array.isArray(value) && value.length === 1) {
      return `${label} set to ${value[0]}`;
    } else {
      return `${label} changed to ${value}`;
    }
  };

  useEffect(() => {
    api.get(`/api/dswd/officials/${of_id}/`)
      .then((res) => {
        setOfficial(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load official details.");
        setLoading(false);
      });
  }, [of_id]);

  const loadAudits = async () => {
    setAuditsLoading(true);
    setAuditsError("");
    try {
      const res = await api.get(`/api/dswd/officials/${of_id}/audits/`);
      setAudits(res.data || []);
    } catch (err) {
      console.error(err);
      setAuditsError("Unable to load audit trail.");
    } finally {
      setAuditsLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading official details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!official) return <div className="p-6 text-gray-500">No official found.</div>;

  return (
    <div className="min-h-screen p-4 sm:p-8 flex justify-center bg-gray-100 font-inter">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">

        {/* Header */}
        <header className="h-24 rounded-t-xl bg-[#292D96]"></header>

        {/* Profile Section */}
        <section className="px-6 md:px-8 flex flex-row items-start gap-6">
          <div className="-mt-16">
            <img
              src={official.of_photo || "https://via.placeholder.com/160"}
              alt="Official"
              className="w-40 h-40 rounded-full border-4 border-white bg-gray-200 object-cover shadow-lg"
            />
          </div>
          <div className="mt-2 flex flex-col justify-center">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{official.full_name}</h1>
              <span className={`inline-block px-3 py-1.5 text-sm font-medium rounded-full ${official.deleted_at ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {official.deleted_at ? "Archived" : "Active"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{official.of_role || "Unassigned"}</p>
            <p className="text-sm text-gray-600">Email: {official.of_email || "N/A"}</p>
          </div>
        </section>

        {/* Tabs */}
        <div className="px-6 md:px-8 mt-8">
          <div className="flex border-b border-gray-300 bg-white">
            {["details", "audits"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "audits") loadAudits();
                  }}
                  className={`px-6 py-2 text-sm font-semibold rounded-t-md transition-colors duration-200 ${isActive
                    ? "bg-[#292D96] text-white border border-gray-300 border-b-0"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#292D96] border border-gray-300"
                    }`}
                >
                  {tab === "details" ? "Details" : "Audit Logs"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 md:px-8 bg-white rounded-b-md">
          {activeTab === "details" && (
            <div className="space-y-8 pt-4">
              {/* Personal Info */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm p-6">
                  <Info label="Sex" value={official.of_sex} icon={<UserIcon className="h-4 w-4 text-gray-500" />} />
                  <Info label="Date of Birth" value={official.of_dob} icon={<CalendarIcon className="h-4 w-4 text-gray-500" />} />
                  <Info label="Place of Birth" value={official.of_pob} icon={<MapPinIcon className="h-4 w-4 text-gray-500" />} />
                  <Info label="Contact" value={official.of_contact} icon={<PhoneIcon className="h-4 w-4 text-gray-500" />} />
                  <Info label="Email" value={official.of_email} icon={<EnvelopeIcon className="h-4 w-4 text-gray-500" />} />
                  {/* Full Address */}
                  <Info
                    label="Full Address"
                    value={
                      [
                        official.address?.street,
                        official.address?.sitio,
                        official.address?.barangay_name,
                        official.address?.municipality_name,
                        official.address?.province_name,
                      ].filter(Boolean).join(", ") || "—"
                    }
                    icon={<MapPinIcon className="h-4 w-4 text-gray-500" />}
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "audits" && (
            <div className="space-y-8 pt-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                {/* Title bar */}
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-800">Audit Logs</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {auditsLoading && <p className="text-gray-500">Loading audits…</p>}
                  {auditsError && <p className="text-red-500">{auditsError}</p>}
                  {!auditsLoading && !auditsError && audits.length === 0 && (
                    <p className="text-gray-500 italic">No audit entries.</p>
                  )}

                  {audits.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition"
                    >
                      {/* Header: Action by Actor */}
                      <div className="flex justify-between text-sm mb-1">
                        <div>
                          <span className="font-medium capitalize">{a.action}</span>{" "}
                          <span className="opacity-70">by</span>{" "}
                          <span className="font-medium">{a.actor_name || "System"}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(a.created_at).toLocaleString("en-PH")}
                        </div>
                      </div>

                      {/* Reason */}
                      {a.reason && (
                        <div className="mt-1 text-xs">
                          <span className="font-medium">Reason:</span> {a.reason}
                        </div>
                      )}

                      {/* Changes (hide for create, archive, unarchive) */}
                      {!["create", "archive", "unarchive"].includes(a.action) && a.changes && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Changes:</span>
                          <ul className="list-disc ml-5 mt-1">
                            {Object.entries(a.changes).map(([field, value], index) => (
                              <li key={index}>{formatChange(field, value)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-end mt-10 px-6 md:px-8 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Officials
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}