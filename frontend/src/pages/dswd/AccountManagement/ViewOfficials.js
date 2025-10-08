import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import axios from "axios";

export default function ViewOfficials() {
  const { of_id } = useParams(); // expects route like /officials/:of_id
  const navigate = useNavigate();

  const [official, setOfficial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NEW: audits state
  const [audits, setAudits] = useState([]);
  const [auditsOpen, setAuditsOpen] = useState(false);
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [auditsError, setAuditsError] = useState("");

  useEffect(() => {
    // use the shared api base, not a hardcoded URL
    api.get(`/api/dswd/officials/${of_id}/`)
      .then((res) => {
        setOfficial(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch official:", err);
        setError("Unable to load official details.");
        setLoading(false);
      });
  }, [of_id]);

  // NEW: lazy-load audits on first open
  const loadAudits = async () => {
    if (auditsOpen && audits.length > 0) return; // already loaded
    setAuditsLoading(true);
    setAuditsError("");
    try {
      const res = await api.get(`/api/dswd/officials/${of_id}/audits/`);
      setAudits(res.data || []);
    } catch (err) {
      console.error("Failed to fetch audits:", err);
      setAuditsError("Unable to load audit trail.");
    } finally {
      setAuditsLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch ((role || "").toLowerCase()) {
      case "social worker":
        return "bg-yellow-500";
      case "vawdesk":
        return "bg-blue-600";
      case "dswd":
        return "bg-green-600";
      default:
        return "bg-gray-400";
    }
  };

  // pretty-print changes JSON
  const renderChanges = (changes) => {
    if (!changes || typeof changes !== "object" || Object.keys(changes).length === 0) return "—";
    return (
      <ul className="list-disc ml-5">
        {Object.entries(changes).map(([field, value]) => {
          // value can be [old, new] or our special _immutable_rejected object
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
              <span className="line-through opacity-60">{String(oldVal)}</span>{" "}
              → <span>{String(newVal)}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  //para ni sya sa edit
  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // form values
  const [formRole, setFormRole] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formSpec, setFormSpec] = useState("");
  const [formAssignedBrgy, setFormAssignedBrgy] = useState("");
  const [formStatus, setFormStatus] = useState("");   // optional
  const [formPhoto, setFormPhoto] = useState(null);
  const [formReason, setFormReason] = useState("");

  // dropdown options
  const ROLE_OPTIONS = ["VAWDesk", "Social Worker"];
  const STATUS_OPTIONS = ["pending", "approved", "rejected"];

  // barangay options fetched
  const [barangays, setBarangays] = useState([]);
  const [brgyLoading, setBrgyLoading] = useState(false);
  const [brgyErr, setBrgyErr] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");

  useEffect(() => {
    if (editOpen && official) {
      setFormRole(official.of_role || "");
      setFormEmail(official.of_email || "");
      setFormContact(official.of_contact || "");
      setFormSpec(official.of_specialization || "");
      setFormAssignedBrgy(official.of_assigned_barangay?.id || ""); // assumes serializer returns id
      setFormStatus(official.status || "");
      setFormPhoto(null);
      setFormReason("");

      setSelectedMunicipality(official.address?.municipality?.id || "");
    }
  }, [editOpen, official]);

  useEffect(() => {
    if (!editOpen || !selectedMunicipality) return;
    setBrgyLoading(true); setBrgyErr("");
    api.get(`/api/desk_officer/municipalities/${selectedMunicipality}/barangays/`)   // <-- change if your route differs
      .then(res => setBarangays(res.data || []))
      .catch(err => {
        console.error("Load barangays failed:", err);
        setBrgyErr("Unable to load barangays");
      })
      .finally(() => setBrgyLoading(false));
  }, [editOpen, selectedMunicipality]);

  const buildChangedPayload = () => {
    const changed = {};
    if ((official.of_role || "") !== (formRole || "")) changed.of_role = formRole || null;
    if ((official.of_email || "") !== (formEmail || "")) changed.of_email = formEmail || null;
    if ((official.of_contact || "") !== (formContact || "")) changed.of_contact = formContact || null;
    if ((official.of_specialization || "") !== (formSpec || "")) changed.of_specialization = formSpec || null;
    if ((official.status || "") !== (formStatus || "")) changed.status = formStatus || null;

    const currentBrgyId = official.of_assigned_barangay?.id ? String(official.of_assigned_barangay.id) : "";
    if (String(currentBrgyId) !== String(formAssignedBrgy || "")) {
      changed.of_assigned_barangay = formAssignedBrgy || null; // send ID
    }

    if (formPhoto) changed.of_photo = formPhoto; // file
    return changed;
  };

  const submitEdit = async () => {
    setEditSubmitting(true);
    try {
      const changes = buildChangedPayload();
      if (Object.keys(changes).length === 0) {
        alert("No changes to save.");
        setEditOpen(false);
        setEditSubmitting(false);
        return;
      }

      // include reason in the payload instead of a custom header
      const bodyWithReason = { ...changes, reason: formReason || "Admin update" };
      let body = bodyWithReason;

      if (changes.of_photo) {
        // use multipart
        const fd = new FormData();
        Object.entries(bodyWithReason).forEach(([k, v]) => {
          if (v === null || v === undefined) return;
          fd.append(k, v);
        });
        body = fd;
        // axios auto-sets content-type with boundary for FormData; don't set manually
      }

      await api.patch(`/api/dswd/officials/${official.of_id}/`, body);
      const refreshed = await api.get(`/api/dswd/officials/${of_id}/`);
      setOfficial(refreshed.data);
      setEditOpen(false);
      alert("Official updated.");
    } catch (err) {
      console.error("Edit failed:", err?.response?.data || err.message);
      alert(`Failed to save: ${JSON.stringify(err?.response?.data || err.message)}`);
    } finally {
      setEditSubmitting(false);
    }
  };

  // preview for newly selected photo
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (file) => {
    if (!file) {
      setFormPhoto(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      return;
    }
    // basic guard (optional)
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) { // 3MB cap (tweak as needed)
      alert("Image is too large. Max 3MB.");
      return;
    }
    setFormPhoto(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };



  if (loading) return <div className="p-6 text-gray-500">Loading official details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!official) return <div className="p-6 text-gray-500">No official found.</div>;

  return (
    <div className="p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#292D96]">Official Details</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 hover:bg-gray-400 text-sm px-4 py-2 rounded shadow"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <div className="flex items-center gap-6">
          <img
            src={official.of_photo || "https://via.placeholder.com/80"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border border-gray-300"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{official.full_name}</h2>
            <p className="text-sm text-gray-500">{official.of_contact || "No contact info"}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs text-white rounded-full ${getRoleColor(
                official.of_role
              )}`}
            >
              {official.of_role || "Unassigned"}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div><strong>Province:</strong> {official.address?.province?.name || "—"}</div>
          <div><strong>Municipality/City:</strong> {official.address?.municipality?.name || "—"}</div>
          <div><strong>Barangay:</strong> {official.address?.barangay?.name || "—"}</div>
          <div><strong>Sitio:</strong> {official.address?.sitio?.name || "—"}</div>
          <div><strong>Street:</strong> {official.address?.street?.name || "—"}</div>
          <div><strong>Assigned Barangay:</strong> {official.of_assigned_barangay?.name || "—"}</div>
        </div>

        {/* Status summary */}
        <div className="mt-4 text-sm">
          <span className="mr-4">
            <strong>Login Status:</strong>{" "}
            {official.user_is_active === null ? "No linked user" : (official.user_is_active ? "Active" : "Deactivated")}
          </span>
          <span className="mr-4">
            <strong>Archive:</strong>{" "}
            {official.deleted_at ? `Archived at ${new Date(official.deleted_at).toLocaleString()}` : "Not archived"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
          <button
            onClick={async () => {
              const reason = window.prompt("Reason for deactivation?");
              try {
                await api.post(`/api/dswd/officials/${official.of_id}/deactivate/`, { reason });
                alert("Official deactivated.");
                const refreshed = await api.get(`/api/dswd/officials/${of_id}/`);
                setOfficial(refreshed.data);
              } catch (err) {
                console.error(err);
                alert("Failed to deactivate.");
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded shadow disabled:opacity-50"
            disabled={official.user_is_active === false || official.deleted_at}
          >
            Deactivate
          </button>

          <button
            onClick={async () => {
              const reason = window.prompt("Reason for reactivation?");
              try {
                await api.post(`/api/dswd/officials/${official.of_id}/reactivate/`, { reason });
                alert("Official reactivated.");
                const refreshed = await api.get(`/api/dswd/officials/${of_id}/`);
                setOfficial(refreshed.data);
              } catch (err) {
                console.error(err);
                alert("Failed to reactivate.");
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded shadow disabled:opacity-50"
            disabled={official.user_is_active !== false || official.deleted_at}
          >
            Reactivate
          </button>

          <button
            onClick={async () => {
              const reason = window.prompt("Reason for archive?");
              if (!reason) return;
              try {
                await api.post(`/api/dswd/officials/${official.of_id}/archive/`, { reason });
                alert("Official archived.");
                const refreshed = await api.get(`/api/dswd/officials/${of_id}/`);
                setOfficial(refreshed.data);
              } catch (err) {
                console.error(err);
                alert("Failed to archive.");
              }
            }}
            className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded shadow disabled:opacity-50"
            disabled={!!official.deleted_at}
          >
            Archive
          </button>

          <button
            onClick={() => setEditOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow"
            disabled={!!official.deleted_at}
          >
            Edit
          </button>

          {/* NEW: Audit Trail toggle */}
          <button
            onClick={async () => {
              const newOpen = !auditsOpen;
              setAuditsOpen(newOpen);
              if (newOpen) await loadAudits();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded shadow"
          >
            {auditsOpen ? "Hide Audit Trail" : "View Audit Trail"}
          </button>
        </div>

        {/* NEW: Audit Trail panel */}
        {auditsOpen && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-md font-semibold mb-3">Audit Trail</h3>
            {auditsLoading && <div className="text-gray-500 text-sm">Loading audits…</div>}
            {auditsError && <div className="text-red-500 text-sm">{auditsError}</div>}
            {!auditsLoading && !auditsError && audits.length === 0 && (
              <div className="text-gray-500 text-sm">No audit entries.</div>
            )}
            <div className="space-y-3">
              {audits.map((a) => (
                <div key={a.id} className="p-3 rounded-lg border bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
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
                    <span className="font-medium">Changes:</span> {renderChanges(a.changes)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !editSubmitting && setEditOpen(false)}
          />

          {/* Modal shell: centers content & handles scrolling */}
          <div className="relative h-full w-full overflow-y-auto">
            <div className="mx-auto flex min-h-full items-center justify-center p-4">
              {/* Dialog */}
              <div
                className={[
                  // mobile: full screen card
                  "w-full h-full rounded-none",
                  // desktop: nicely sized card
                  "sm:h-auto sm:max-w-3xl sm:rounded-2xl",
                  "bg-white shadow-xl ring-1 ring-black/5",
                  "flex flex-col max-h-[95vh]"
                ].join(" ")}
              >
                {/* Header */}
                <div className="px-6 pt-5 pb-3 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 text-center">Edit Official</h3>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Only admin-level fields are editable here. Changes are audited.
                  </p>
                </div>

                {/* Body (scrolls if long) */}
                <div className="px-6 py-5 overflow-y-auto">
                  {/* ----- BIG centered profile photo section ----- */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="text-[11px] text-gray-500 mb-2">Profile Photo</div>

                    <div className="flex items-center justify-center gap-8">
                      {/* Current */}
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-2">Current</div>
                        <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden ring-2 ring-gray-200 bg-white">
                          <img
                            src={official.of_photo || "https://via.placeholder.com/160"}
                            alt="Current"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="hidden md:flex items-center">
                        <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>

                      {/* New (preview) */}
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-2">New (unsaved)</div>
                        <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden ring-2 ring-indigo-200 bg-white">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                              No image selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Upload / Dropzone */}
                    <label
                      htmlFor="of_photo"
                      className="mt-4 inline-flex items-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors bg-gray-50/60 hover:bg-indigo-50/40 px-4 py-3"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handlePhotoChange(file);
                      }}
                    >
                      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Drag & drop or <span className="text-indigo-600 underline">choose a file</span>
                      </span>
                      <input
                        id="of_photo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                      />
                    </label>

                    {/* Selected / actions */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                      {formPhoto ? (
                        <>
                          <span>
                            Selected: <span className="font-medium">{formPhoto.name}</span> ({Math.round(formPhoto.size/1024)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePhotoChange(null)} // clears preview; DOES NOT clear server value
                            className="px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                          >
                            Clear
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400">PNG/JPG, up to 3MB</span>
                          {official.of_photo && (
                            <a
                              href={official.of_photo}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                            >
                              View current
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>


                  {/* ----- FORM GRID (responsive) ----- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                      >
                        <option value="">—</option>
                        {["DSWD","VAWDesk","Social Worker"].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                      >
                        <option value="">—</option>
                        {["pending","approved","rejected"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="name@example.com"
                      />
                    </div>

                    {/* Contact */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={formContact}
                        onChange={(e) => setFormContact(e.target.value)}
                        placeholder="e.g. 09xxxxxxxxx"
                      />
                    </div>

                    {/* Specialization */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={formSpec}
                        onChange={(e) => setFormSpec(e.target.value)}
                        placeholder="e.g. Legal, Counseling"
                      />
                    </div>

                    {/* Assigned Barangay */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned Barangay {brgyLoading && <span className="text-xs text-gray-400">(loading…)</span>}
                      </label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={formAssignedBrgy}
                        onChange={(e) => setFormAssignedBrgy(e.target.value)}
                      >
                        <option value="">—</option>
                        {formAssignedBrgy &&
                          !barangays.some(b => String(b.id) === String(formAssignedBrgy)) && (
                            <option value={formAssignedBrgy}>
                              {official.of_assigned_barangay?.name || `Barangay #${formAssignedBrgy}`} (current)
                            </option>
                        )}
                        {barangays.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                      {brgyErr && <div className="text-xs text-red-500 mt-1">{brgyErr}</div>}
                    </div>

                    {/* Reason */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Change <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full border rounded px-3 py-2 text-sm"
                        rows={3}
                        value={formReason}
                        onChange={(e) => setFormReason(e.target.value)}
                        placeholder="Why are you changing this?"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">This is stored in the Audit Log.</p>
                    </div>
                  </div>
                </div>

                {/* Footer (sticky at bottom) */}
                <div className="px-6 py-4 border-t flex justify-end gap-3">
                  <button
                    onClick={() => setEditOpen(false)}
                    disabled={editSubmitting}
                    className="px-4 py-2 text-sm rounded border hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEdit}
                    disabled={editSubmitting || !formReason.trim()}
                    className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editSubmitting ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
