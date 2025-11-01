// src/pages/social_worker/Sessions/StartSession.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import NextSessionModal from "./NextSessionModal";
import CaseSessionFollowup from "./CaseSessionFollowup";
import AddCustomQuestions from "./AddCustomQuestions";
import Select from "react-select";

export default function StartSession() {
  const { sess_id } = useParams();
  const navigate = useNavigate();
  const [showNextModal, setShowNextModal] = useState(false);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryServices, setCategoryServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [progress, setProgress] = useState(null);
  const [role, setRole] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    api
      .get("/api/social_worker/service-categories/")
      .then((res) => setServiceCategories(res.data))
      .catch((err) => console.error("Failed to fetch service categories", err));
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    api
      .get(`/api/social_worker/services/category/${selectedCategory.value}/`)
      .then((res) => setCategoryServices(res.data))
      .catch((err) => console.error("Failed to fetch services by category", err));
  }, [selectedCategory]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const detailRes = await api.get(`/api/social_worker/sessions/${sess_id}/`);
        const sess = detailRes.data;

        if (sess.sess_status === "Pending") {
          const response = await api.post(`/api/social_worker/sessions/${sess_id}/start/`);
          const data = response.data;
          setSession(data);
          setQuestions(data.questions || []);
          setProgress(data.my_progress || null);
          const myRole = data?.my_progress?.official_role || data?.my_progress?.role || "";
          setRole(myRole || "");
          setIsDone(Boolean(data?.my_progress?.is_done));
        } else if (sess.sess_status === "Ongoing") {
          setSession(sess);
          setQuestions(sess.questions || []);
          setProgress(sess.my_progress || null);
          const myRole = sess?.my_progress?.official_role || sess?.my_progress?.role || "";
          setRole(myRole || "");
          setIsDone(Boolean(sess?.my_progress?.is_done));
        } else {
          alert("This session is already finished.");
          navigate(-1);
        }
      } catch (err) {
        console.error("Failed to load session", err);
        alert("Could not load session.");
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sess_id, navigate]);

  const handleChange = (sq_id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.sq_id === sq_id ? { ...q, [field]: value } : q))
    );
  };

  const isQuestionEditable = (q) => {
    if (isDone) return false;
    const assignedRole =
      q.assigned_role ||
      (q.question && q.question.role) ||
      q.question_category ||
      q.question_category_name ||
      null;

    const normalizedAssigned = assignedRole ? String(assignedRole).toLowerCase().trim() : null;
    const normalizedMyRole = role ? String(role).toLowerCase().trim() : null;
    if (!normalizedAssigned) return true;
    return normalizedAssigned === normalizedMyRole;
  };

  const handleFinishSession = async () => {
    try {
      const answersPayload = questions
        .filter((q) => isQuestionEditable(q))
        .map((q) => ({
          sq_id: q.sq_id,
          value: q.sq_value,
          note: q.sq_note,
        }));

      const payload = {
        answers: answersPayload,
        sess_description: session?.sess_description || "",
        services: selectedServices.map((s) => s.value),
      };

      const response = await api.post(`/api/social_worker/sessions/${sess_id}/finish/`, payload);
      alert("Your part of the session is now marked as completed.");

      if (response.data.all_finished) {
        setShowFollowupModal(true);
      } else {
        navigate("/social_worker/sessions");
      }
    } catch (err) {
      console.error("Failed to finish session", err);
      alert("Failed to finish session.");
    }
  };

// Reference to the current user's section
const mySectionRef = React.useRef(null);
const hasScrolledRef = React.useRef(false); //  prevent repeated scrolls

// Automatically scroll to the logged-in user's section (only once)
useEffect(() => {
  if (
    !loading &&
    !hasScrolledRef.current && // only run once
    questions.length > 0 &&
    mySectionRef.current
  ) {
    hasScrolledRef.current = true; // mark as scrolled so it won’t trigger again

    // Determine highlight color based on user role
    const roleHighlights = {
      "social worker": "ring-green-300",
      "nurse": "ring-blue-300",
      "psychometrician": "ring-purple-300",
      "home life": "ring-orange-300",
    };

    const roleKey = role ? role.toLowerCase().trim() : "";
    const ringColor = roleHighlights[roleKey] || "ring-gray-300";

    // Delay a bit to ensure grouped sections are fully rendered
    const timer = setTimeout(() => {
      mySectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Add subtle highlight for visibility
      mySectionRef.current.classList.add(
        "ring-4",
        ringColor,
        "transition",
        "duration-500"
      );
      setTimeout(() => {
        mySectionRef.current.classList.remove("ring-4", ringColor);
      }, 1500);
    }, 500);

    return () => clearTimeout(timer);
  }
}, [loading, questions, role]);

  if (loading) return <p className="p-6">Loading session...</p>;

  const roleOrder = ["Social Worker", "Nurse", "Psychometrician", "Home Life"];
  const roleColors = {
    "Social Worker": "border-green-600 bg-green-50",
    Nurse: "border-blue-600 bg-blue-50",
    Psychometrician: "border-purple-600 bg-purple-50",
    "Home Life": "border-orange-600 bg-orange-50",
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-10">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-green-700 mb-2">
          Session {session?.sess_num || ""} — {session?.sess_status}
        </h2>
        {role && (
          <p className="text-gray-700">
            You are logged in as: <span className="font-semibold text-green-700">{role}</span>
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          Complete your part of this session below. Other officials’ answers are shown for
          reference only.
        </p>
      </div>

      {/* ROLE GROUPED QUESTIONS */}
      <div className="space-y-10">
        {roleOrder.map((r) => {
          const roleQuestions = questions.filter(
            (q) => q.assigned_role === r || q.question_category_name === r
          );
          if (roleQuestions.length === 0) return null;
          const colorClass = roleColors[r] || "border-gray-400 bg-gray-50";

          const isUserRole = r.toLowerCase() === role.toLowerCase();
          return (
            <div
              key={r}
              ref={isUserRole ? mySectionRef : null}
              className={`rounded-md border-2 ${colorClass} p-5 shadow-sm`}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 uppercase tracking-wide">
                {r} Section
              </h3>

              <AnimatePresence>
                {roleQuestions.map((q, index) => {
                  const editable = isQuestionEditable(q);
                  return (
                    <motion.div
                      key={q.sq_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 border border-gray-300 bg-white rounded-md mb-4"
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-gray-900 mb-2">
                          {q.question_text || q.sq_custom_text}
                        </p>
                        {!editable && (
                          <span className="text-xs text-gray-500 italic ml-4">Read-only</span>
                        )}
                      </div>

                      {(q.question_answer_type || q.sq_custom_answer_type) === "Yes/No" && (
                        <select
                          value={q.sq_value || ""}
                          onChange={(e) =>
                            handleChange(q.sq_id, "sq_value", e.target.value)
                          }
                          className="w-full border rounded p-2"
                          disabled={!editable}
                        >
                          <option value="">Select...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      )}

                      {(q.question_answer_type || q.sq_custom_answer_type) === "Text" && (
                        <textarea
                          value={q.sq_value || ""}
                          onChange={(e) =>
                            handleChange(q.sq_id, "sq_value", e.target.value)
                          }
                          className="w-full border rounded p-2"
                          rows={3}
                          placeholder={editable ? "Enter your answer..." : "Read-only"}
                          disabled={!editable}
                        />
                      )}

                      <input
                        type="text"
                        value={q.sq_note || ""}
                        onChange={(e) =>
                          handleChange(q.sq_id, "sq_note", e.target.value)
                        }
                        className="w-full border rounded p-2 mt-2"
                        placeholder="Additional notes (if any)..."
                        disabled={!editable}
                      />

                      {q.answered_by_name && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Answered by {q.answered_by_name}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* CUSTOM QUESTIONS */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddCustomModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Add Custom Question
        </button>
      </div>

      {/* SERVICES PROVIDED */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Services Provided</h2>
        <div className="p-4 bg-gray-50 border rounded-md shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Service Category
            </label>
            <Select
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setSelectedServices([]);
              }}
              options={serviceCategories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              placeholder="Choose category..."
            />
          </div>

          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Organization(s)
              </label>
              <Select
                isMulti
                value={selectedServices}
                onChange={(val) => setSelectedServices(val)}
                options={categoryServices.map((s) => ({
                  value: s.serv_id,
                  label: `${s.name} – ${s.contact_person} (${s.contact_number})`,
                }))}
                placeholder="Select organizations under this category..."
              />
            </div>
          )}
        </div>
      </div>

      {/* SESSION FEEDBACK */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Session Feedback</h2>
        <textarea
          value={session?.sess_description || ""}
          onChange={(e) =>
            setSession((prev) => ({ ...prev, sess_description: e.target.value }))
          }
          className="w-full border rounded-md p-3 text-sm text-gray-800 bg-gray-50"
          rows={4}
          placeholder="Write your feedback about this session (e.g., progress, issues, observations)..."
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-4 mt-8 border-t pt-4">
        {!isDone && (
          <button
            onClick={handleFinishSession}
            className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            Finish Session
          </button>
        )}
        {isDone && (
          <p className="text-gray-600 italic mt-2 text-sm">
            You’ve already completed your part of this session.
          </p>
        )}
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {/* MODALS */}
      <NextSessionModal
        show={showNextModal}
        onClose={(success) => {
          setShowNextModal(false);
          if (success) navigate("/social_worker/sessions");
        }}
        session={session}
      />
      <CaseSessionFollowup
        show={showFollowupModal}
        onClose={(success) => {
          setShowFollowupModal(false);
          if (success) navigate("/social_worker/sessions");
        }}
        session={session}
      />
      <AddCustomQuestions
        show={showAddCustomModal}
        onClose={() => setShowAddCustomModal(false)}
        sessionId={sess_id}
        onAdded={(newQ) => setQuestions((prev) => [...prev, newQ])}
      />
    </div>
  );
}
