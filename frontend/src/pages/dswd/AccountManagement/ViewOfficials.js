import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

export default function ViewOfficials() {
  const { of_id } = useParams();
  const navigate = useNavigate();

  const [official, setOfficial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [audits, setAudits] = useState([]);
  const [auditsOpen, setAuditsOpen] = useState(false);
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
    if (auditsOpen && audits.length > 0) return;
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

  const renderChanges = (changes) => {
    if (!changes || Object.keys(changes).length === 0) return "—";
    return (
      <ul className="list-disc ml-5 space-y-1">
        {Object.entries(changes).map(([field, value]) => {
          if (field === "_immutable_rejected") {
            return (
              <li key={field} className="text-amber-700">
                Rejected immutable fields: {JSON.stringify(value)}
              </li>
            );
          }
          const [oldVal, newVal] = Array.isArray(value) ? value : [null, value];
          return (
            <li key={field}>
              <span className="font-medium">{field}</span>:{" "}
              <span className="line-through opacity-60">{String(oldVal)}</span> → <span>{String(newVal)}</span>
            </li>
          );
        })}
      </ul>
    );
  };


  if (loading) return <div className="p-6 text-gray-500">Loading official details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!official) return <div className="p-6 text-gray-500">No official found.</div>;

  return (
    <div className="p-6 font-sans max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#292D96]">Official Details</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 hover:bg-gray-400 text-sm px-4 py-2 rounded shadow"
        >
          Back
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden ring-2 ring-indigo-200">
            <img
              src={official.of_photo || "https://via.placeholder.com/160"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-semibold text-gray-800">{official.full_name}</h2>
            <p className="text-gray-500 text-sm">{official.of_contact || "No contact info"}</p>
            <span
              className={`inline-block mt-1 px-3 py-1 text-xs font-medium text-white rounded-full ${getRoleColor(official.of_role)}`}
            >
              {official.of_role || "Unassigned"}
            </span>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <div><strong>Province:</strong> {official.address?.province_name || "—"}</div>
              <div><strong>Municipality:</strong> {official.address?.municipality_name || "—"}</div>
              <div><strong>Barangay:</strong> {official.address?.barangay_name || "—"}</div>
              <div><strong>Sitio:</strong> {official.address?.sitio || "—"}</div>
              <div><strong>Street:</strong> {official.address?.street || "—"}</div>
            </div>
            <div className="mt-2 text-sm">
              <span className="mr-4"><strong>Login:</strong> {official.user_is_active === null ? "No linked user" : (official.user_is_active ? "Active" : "Deactivated")}</span>
              <span className="mr-4"><strong>Archive:</strong> {official.deleted_at ? `Archived at ${new Date(official.deleted_at).toLocaleString()}` : "Not archived"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
          <button
            onClick={async () => {
              const reason = window.prompt("Reason for archive?");
              if (!reason) return;
              try {
                await api.post(`/api/dswd/officials/${official.of_id}/archive_or_deactivate/`, { reason });
                alert("Archived & deactivated.");
                const refreshed = await api.get(`/api/dswd/officials/${official.of_id}/`);
                setOfficial(refreshed.data);
              } catch (err) { console.error(err); alert("Failed to archive."); }
            }}
            className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded shadow disabled:opacity-50"
            disabled={!!official.deleted_at}
          >
            Archive
          </button>

          <button
            onClick={async () => { setAuditsOpen(!auditsOpen); if (!auditsOpen) await loadAudits(); }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded shadow"
          >
            {auditsOpen ? "Hide Audit Trail" : "View Audit Trail"}
          </button>
        </div>

        {/* Audit Trail */}
        {auditsOpen && (
          <div className="mt-6 border-t pt-4 space-y-3">
            <h3 className="text-md font-semibold mb-3">Audit Trail</h3>
            {auditsLoading && <div className="text-gray-500 text-sm">Loading audits…</div>}
            {auditsError && <div className="text-red-500 text-sm">{auditsError}</div>}
            {!auditsLoading && !auditsError && audits.length === 0 && <div className="text-gray-500 text-sm">No audit entries.</div>}
            {audits.map((a) => (
              <div key={a.id} className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium capitalize">{a.action}</span>{" "}
                    <span className="opacity-70">by</span>{" "}
                    <span className="font-medium">{a.actor_name || "System"}</span>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</div>
                </div>
                {a.reason && <div className="mt-1 text-xs"><span className="font-medium">Reason:</span> {a.reason}</div>}
                <div className="mt-2 text-xs"><span className="font-medium">Changes:</span> {renderChanges(a.changes)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
