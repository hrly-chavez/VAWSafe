// src/pages/social_worker/Sessions/StartSession.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import NextSessionModal from "./NextSessionModal";
import CaseSessionFollowup from "./CaseSessionFollowup";

import Select from "react-select";

export default function StartSession() {
  const { sess_id } = useParams();
  const navigate = useNavigate();
  const [showNextModal, setShowNextModal] = useState(false);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [progress, setProgress] = useState(null);
  const [role, setRole] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [myFeedback, setMyFeedback] = useState("");


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          setMyFeedback(data?.my_progress?.notes || "");
          const myRole = data?.my_progress?.official_role || data?.my_progress?.role || "";
          setRole(myRole || "");
          setIsDone(Boolean(data?.my_progress?.is_done));
        } else if (sess.sess_status === "Ongoing") {
          setSession(sess);
          setQuestions(sess.questions || []);
          setProgress(sess.my_progress || null);
          setMyFeedback(sess?.my_progress?.notes || "");
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
      my_feedback: myFeedback,
      services: selectedServices.map((s) => s.value),
    };


    const response = await api.post(`/api/social_worker/sessions/${sess_id}/finish/`, payload);
    const { session_completed, all_finished } = response.data;

    // Extract victim ID safely
    const victimId =
      response?.data?.session?.incident?.vic_id?.vic_id ||
      response?.data?.session?.incident?.vic_id ||
      session?.incident?.vic_id?.vic_id ||
      null;

    //  Unified redirect behavior (always go to victim page)
    if (all_finished || session_completed) {
      alert(
        "All assigned officials have completed this session.\n" +
        "The session is now marked as done.\n" +
        "Redirecting to the victim’s profile..."
      );
    } else {
      alert(
        "Your part of this shared session has been completed.\n" +
        "You’ll now be redirected to the victim’s profile."
      );
    }

    //  Redirect regardless of completion state
    if (victimId) {
      setTimeout(() => {
        navigate(`/social_worker/victims/${victimId}`);
      }, 1000);
    } else {
      navigate("/social_worker/victims");
    }
  } catch (err) {
    console.error("Failed to finish session", err);
    alert("Failed to finish session.");
  }
};


// Reference to the current user's section
const mySectionRef = React.useRef(null);
const hasScrolledRef = React.useRef(false); //  prevent repeated scrolls

// Automatically scroll to the logged-in user's role section (only once, after render)
useEffect(() => {
  if (!loading && !hasScrolledRef.current && questions.length > 0 && role) {
    const timer = setTimeout(() => {
      const roleSection = document.querySelector(
        `[data-role-section="${role.toLowerCase()}"]`
      );

      if (roleSection) {
        hasScrolledRef.current = true; // mark as done
        roleSection.scrollIntoView({ behavior: "smooth", block: "center" });

        // Determine highlight color based on user role
        const roleHighlights = {
          "social worker": "ring-green-300",
          "nurse": "ring-blue-300",
          "psychometrician": "ring-purple-300",
          "home life": "ring-orange-300",
        };
        const ringColor =
          roleHighlights[role.toLowerCase()] || "ring-gray-300";

        // Temporary highlight for visibility
        roleSection.classList.add("ring-4", ringColor, "transition", "duration-500");
        setTimeout(() => {
          roleSection.classList.remove("ring-4", ringColor);
        }, 1500);
      }
    }, 700); // wait for DOM render

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
          review only.
        </p>
      </div>

        {/* ROLE GROUPED QUESTIONS (grouped by role -> category) */}
          <div className="space-y-8">
            {roleOrder.map((r) => {
              const roleQuestions = questions.filter(
                (q) => q.assigned_role === r || q.question_category_name === r
              );
              if (roleQuestions.length === 0) return null;

              const colorClass = roleColors[r] || "border-gray-400 bg-gray-50";
              const isUserRole = r.toLowerCase() === role.toLowerCase();

              // helper: find progress note for this role (if any)
              const roleProgress = session?.progress?.find(
                (p) => String(p.official_role).toLowerCase() === String(r).toLowerCase()
              );
              const roleNote = roleProgress?.notes || "";

              return (
                <div
                  key={r}
                  ref={isUserRole ? mySectionRef : null}
                  data-role-section={r.toLowerCase()}
                  className={`rounded-md border-2 ${colorClass} p-5 shadow-sm`}
                >
                  {/* Role header with colored badge */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 uppercase tracking-wide">
                      {r} Section
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        r === "Social Worker" ? "bg-green-100 text-green-800" :
                        r === "Nurse" ? "bg-blue-100 text-blue-800" :
                        r === "Psychometrician" ? "bg-purple-100 text-purple-800" :
                        "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {r}
                    </span>
                  </div>

                  {/* Group questions by category within this role */}
                  {Object.entries(
                    roleQuestions.reduce((acc, q) => {
                      const category = q.question_category_name || "Uncategorized";
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(q);
                      return acc;
                    }, {})
                  ).map(([category, catQuestions]) => (
                    <div key={category} className="mb-6">
                      {/* Category Header */}
                      <div
                      className={`px-4 py-2 rounded-t-md border-l-4 ${
                        r === "Social Worker"
                          ? "bg-green-100 border-green-600"
                          : r === "Nurse"
                          ? "bg-blue-100 border-blue-600"
                          : r === "Psychometrician"
                          ? "bg-purple-100 border-purple-600"
                          : r === "Home Life"
                          ? "bg-orange-100 border-orange-600"
                          : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      <h5 className="text-md font-semibold text-gray-700">{category}</h5>
                    </div>

                      {/* Category Question List */}
                      <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
                        <AnimatePresence>
                          {catQuestions.map((q, index) => {
                            const editable = isQuestionEditable(q);
                            return (
                              <motion.div
                                key={q.sq_id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.22, delay: index * 0.04 }}
                                className="p-4 border border-gray-200 bg-white rounded-md mb-4"
                              >
                                <div className="flex items-start justify-between">
                                  <p className="font-medium text-gray-900 mb-2">
                                    {q.sq_question_text_snapshot || q.question_text || q.sq_custom_text}
                                  </p>
                                  {!editable && (
                                    <span className="text-xs text-gray-500 italic ml-4">Read-only</span>
                                  )}
                                </div>

                                {(q.sq_answer_type_snapshot || q.question_answer_type || q.sq_custom_answer_type) === "Yes/No" && (
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

                                {(q.sq_answer_type_snapshot || q.question_answer_type || q.sq_custom_answer_type) === "Text" && (
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

                                {(q.sq_answer_type_snapshot || q.question_answer_type || q.sq_custom_answer_type) !== "Text" && (
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
                                )}

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
                    </div>
                  ))}

                  {/* Per-role feedback box (appears after the role's questions) */}
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {isUserRole ? `Your feedback (${r})` : `${r} feedback`}
                    </label>

                    {isUserRole ? (
                      <textarea
                        value={myFeedback}
                        onChange={(e) => setMyFeedback(e.target.value)}
                        disabled={isDone}
                        className="w-full border rounded p-3 text-sm bg-white"
                        rows={3}
                        placeholder="Write your feedback about this role's part..."
                      />
                    ) : (
                      <textarea
                        value={roleNote || ""}
                        readOnly
                        className="w-full border rounded p-3 text-sm bg-gray-50"
                        rows={3}
                        placeholder="No feedback yet"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

     

    

      {/* SESSION FEEDBACK */}
      {/* <div className="mt-10 space-y-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Session Feedback</h2> */}

        {/* ---- YOUR FEEDBACK (EDITABLE) ---- */}
        {/* <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Your Feedback ({role})
          </h3>
          <textarea
            value={myFeedback}
            onChange={(e) => setMyFeedback(e.target.value)}
            disabled={isDone}
            className="w-full border rounded-md p-3 text-sm text-gray-800 bg-white"
            rows={4}
            placeholder="Enter your own feedback about this session..."
          />
        </div> */}

        {/* ---- OTHERS' FEEDBACK (READ-ONLY) ---- */}
        {/* <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Other Officials’ Feedback</h3>

          <div className="space-y-4">
            {session?.progress
              ?.filter((p) => p.official_role !== role)
              .map((p) => (
                <div
                  key={p.official}
                  className="p-3 bg-gray-50 border rounded-md shadow-sm"
                >
                  <p className="font-semibold text-gray-700 mb-1">{p.official_role}</p>
                  <textarea
                    value={p.notes || ""}
                    readOnly
                    className="w-full border rounded-md p-2 bg-gray-100 text-sm"
                    rows={3}
                  />
                </div>
              ))}
          </div>
        </div> */}
      {/* </div> */}


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
    </div>
  );
}
