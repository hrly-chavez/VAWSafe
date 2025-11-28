import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/SectionHeader";
import api from "../../../api/axios";

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

  const getRoleColor = (role) => {
    switch ((role || "").toLowerCase()) {
      case "social worker": return "bg-yellow-500";
      case "nurse": return "bg-blue-600";
      case "dswd": return "bg-green-600";
      case "psychometrician": return "bg-red-600";
      default: return "bg-gray-400";
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading official details...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!official) return <p className="p-6 text-gray-500">No official found.</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-10 max-w-screen-lg mx-auto space-y-10">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <img
            src={official.of_photo || "https://via.placeholder.com/160"}
            alt="Official"
            className="h-[220px] w-[220px] object-cover rounded-full border-4 border-white shadow-xl"
          />
        </div>

        {/* Name + Role */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#292D96]">{official.full_name}</h2>
          <p className="text-sm text-gray-500 mt-1">{official.of_email || "No email"}</p>
          <span
            className={`inline-block mt-2 px-3 py-1 text-xs font-medium text-white rounded-full ${getRoleColor(official.of_role)}`}
          >
            {official.of_role || "Unassigned"}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-6 border-b border-gray-300 text-sm font-medium">
          {["details", "audits"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "audits") loadAudits();
              }}
              className={`px-4 py-2 transition ${activeTab === tab
                ? "border-b-2 border-[#292D96] text-[#292D96]"
                : "text-gray-500 hover:text-[#292D96]"
                }`}
            >
              {tab === "details" ? "Details" : "Audit Trail"}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-10">
            {/* Personal Info (with Address included) */}
            <div className="bg-white border rounded-xl shadow-md p-6">
              <SectionHeader icon="/images/id-card.png" title="Personal Info" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Sex</p>
                  <p className="font-medium">{official.of_sex || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium">{official.of_dob || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Place of Birth</p>
                  <p className="font-medium">{official.of_pob || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="font-medium">{official.of_contact || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Specialization</p>
                  <p className="font-medium">{official.of_specialization || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium capitalize">{official.status}</p>
                </div>

                {/* Full Address merged here */}
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Full Address</p>
                  <p className="font-medium">
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

        {/* Audit Trail Tab */}
        {activeTab === "audits" && (
          <div className="space-y-10">
            <div className="bg-white border rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-[#292D96] mb-4">Audit Trail</h3>
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
  );
}