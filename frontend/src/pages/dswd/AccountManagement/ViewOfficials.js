import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/SectionHeader";
import api from "../../../api/axios";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

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
        <header className="h-40 rounded-t-xl bg-[#292D96] flex items-start p-6">
          <h1 className="text-3xl font-bold text-white shadow-sm">DSWD Official Details</h1>
        </header>

        {/* Profile Info */}
        <section className="px-6 md:px-8 -mt-16 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center md:items-start">
            <img
              src={official.of_photo || "https://via.placeholder.com/160"}
              alt="Official"
              className="w-32 h-32 rounded-full border-4 border-white ring-4 ring-[#F59E0B] bg-gray-200 object-cover shadow-lg"
            />
            <h1 className="text-3xl font-bold mt-4 text-gray-800">{official.full_name}</h1>
            <p className="text-lg text-[#292D96] font-medium">{official.of_role || "Unassigned"}</p>
            <div className="mt-2 flex space-x-2 items-center">
              <span className="px-3 py-1 text-xs font-bold rounded-full uppercase bg-green-500 text-white">
                {official.status || "Active"}
              </span>
              <p className="text-sm text-gray-500">Email: {official.of_email || "N/A"}</p>
            </div>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="px-6 md:px-8 mt-6 border-b border-gray-300">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-2 border-b-2 transition duration-200 ${activeTab === "details"
                  ? "border-[#292D96] text-[#292D96] font-semibold"
                  : "border-transparent text-gray-600 hover:text-[#292D96]"
                }`}
            >
              Full Profile
            </button>
            <button
              onClick={() => {
                setActiveTab("audits");
                loadAudits();
              }}
              className={`py-2 border-b-2 transition duration-200 ${activeTab === "audits"
                  ? "border-[#292D96] text-[#292D96] font-semibold"
                  : "border-transparent text-gray-600 hover:text-[#292D96]"
                }`}
            >
              Audit Log
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === "details" && (
            <div className="space-y-8">
              {/* Personal Info */}
              <div>
                <SectionHeader icon="/images/id-card.png" title="Personal Info" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                  <div>
                    <p className="text-gray-500">Sex</p>
                    <p className="text-gray-800 font-medium">{official.of_sex || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date of Birth</p>
                    <p className="text-gray-800 font-medium">{official.of_dob || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Place of Birth</p>
                    <p className="text-gray-800 font-medium">{official.of_pob || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contact</p>
                    <p className="text-gray-800 font-medium">{official.of_contact || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Specialization</p>
                    <p className="text-gray-800 font-medium">{official.of_specialization || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="text-gray-800 font-medium capitalize">{official.status}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Full Address</p>
                    <p className="text-gray-800 font-medium">
                      {[
                        official.address?.street,
                        official.address?.sitio,
                        official.address?.barangay?.name,
                        official.address?.municipality?.name,
                        official.address?.province?.name,
                      ].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audits" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Audit Log</h2>
              {auditsLoading && <p className="text-gray-500 text-sm">Loading audits…</p>}
              {auditsError && <p className="text-red-500 text-sm">{auditsError}</p>}
              {!auditsLoading && !auditsError && audits.length === 0 && (
                <p className="text-gray-500 text-sm">No audit entries.</p>
              )}
              {audits.map((a) => (
                <div
                  key={a.id}
                  className="border rounded-md p-4 shadow-sm bg-gray-50 mb-4 hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium capitalize">{a.action}</span>{" "}
                      <span className="opacity-70">by</span>{" "}
                      <span className="font-medium">{a.actor_name || "System"}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                  {a.reason && (
                    <div className="mt-1 text-xs">
                      <span className="font-medium">Reason:</span> {a.reason}
                    </div>
                  )}
                  <div className="mt-2 text-xs">
                    <span className="font-medium">Changes:</span>{" "}
                    {JSON.stringify(a.changes)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-end mt-10">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-md border border-[#292D96] text-[#292D96] px-4 py-2 text-sm font-medium hover:bg-[#292D96] hover:text-white transition"
            >
              ← Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}