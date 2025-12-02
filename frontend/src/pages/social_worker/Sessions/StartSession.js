// src/pages/social_worker/Sessions/StartSession.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import NextSessionModal from "./NextSessionModal";
import CaseSessionFollowup from "./CaseSessionFollowup";
import { useRef } from "react";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


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
  const [openRoles, setOpenRoles] = useState([]);
  const roleRefs = useRef({});
  const startedRef = React.useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


    useEffect(() => {
      let mounted = true;
      const loadSession = async () => {
        try {
          const detailRes = await api.get(`/api/social_worker/sessions/${sess_id}/`);
          const sess = detailRes.data;

          // === PENDING SESSION - only call start() once ===
          if (sess.sess_status === "Pending") {
            if (!startedRef.current) {
              startedRef.current = true; // prevent duplicate calls

              const response = await api.post(`/api/social_worker/sessions/${sess_id}/start/`);
              const data = response.data;

              const myRole =
                data?.my_progress?.official_role ||
                data?.my_progress?.role ||
                "";

              if (!mounted) return;

              setSession(data);
              setQuestions(data.questions || []);
              setProgress(data.my_progress || null);
              setMyFeedback(data?.my_progress?.notes || "");
              setRole(myRole);
              setIsDone(Boolean(data?.my_progress?.is_done));

              // Open ONLY my role
              setOpenRoles(myRole ? [myRole] : []);
              setTimeout(() => {
                window.location.reload();
              }, 50);
            }
          }

          // === ONGOING SESSION ===
          if (sess.sess_status === "Ongoing") {
            const myRole =
              sess?.my_progress?.official_role ||
              sess?.my_progress?.role ||
              "";

            if (!mounted) return;

            setSession(sess);
            setQuestions(sess.questions || []);
            setProgress(sess.my_progress || null);
            setMyFeedback(sess?.my_progress?.notes || "");
            setRole(myRole);
            setIsDone(Boolean(sess?.my_progress?.is_done));

            // Open ONLY my role
            setOpenRoles(myRole ? [myRole] : []);
            return;
          }

          // === FINISHED ===
                if (sess.sess_status === "Done") {
                  alert("This session is already finished.");
                  navigate(-1);
                  return;
                }

        } catch (err) {
          console.error("Failed to load session", err);
          if (mounted) alert("Could not load session.");
        } finally {
          if (mounted) setLoading(false);
        }
      };

      loadSession();

      return () => { mounted = false; };

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

    // =============================
    // REQUIRED QUESTIONS CHECK
    // =============================
    const missingRequired = questions.filter(
      (q) =>
        q.sq_is_required &&
        isQuestionEditable(q) &&
        (!q.sq_value || q.sq_value.trim() === "")
    );

    if (missingRequired.length > 0) {
      const firstMissing = missingRequired[0];

      // Determine the role of the missing question
      const missingRole =
        firstMissing.assigned_role ||
        firstMissing.question_category_name ||
        null;

      // 1. Auto-open that role section
      if (missingRole) {
        setOpenRoles((prev) =>
          prev.includes(missingRole) ? prev : [...prev, missingRole]
        );
      }

      // 2. Scroll to the missing question (use sq_id data attribute)
      setTimeout(() => {
        const el = document.querySelector(`[data-question-id="${firstMissing.sq_id}"]`);

        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });

          // 3. Highlight effect (temporary ring)
          el.classList.add("ring-4", "ring-red-400", "transition", "duration-500");
          setTimeout(() => {
            el.classList.remove("ring-4", "ring-red-400");
          }, 1500);
        }
      }, 350);

      toast.warning("Please answer all REQUIRED questions before finishing.");
      return;
  }



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
      toast.success(
        "All officials have finished. Session is now marked as done. Redirecting..."
      );
    } else {
      toast.info(
          "Your part of this shared session is completed. Redirecting..."
        );
    }

    //  Redirect regardless of completion state
    if (victimId) {
      setTimeout(() => {
        navigate(`/social_worker/victims/${victimId}`);
      }, 3200);
    } else {
      navigate("/social_worker/victims");
    }
  } catch (err) {
    console.error("Failed to finish session", err);

      // Show backend error message if available
      const msg =
        err?.response?.data?.error ||
        "Failed to finish session. Please ensure all required questions are answered.";

      toast.error(msg);

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
    "Social Worker": "border-gray-300 bg-white",
    Nurse: "border-gray-300 bg-white",
    Psychometrician: "border-gray-300 bg-white",
    "Home Life": "border-gray-300 bg-white",
  };


  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-10">
      
      {/* HEADER */}
       <div className="text-center mb-8">

          {/* SESSION TITLE – blue, with bottom border */}
          <h2 className="text-2xl font-bold text-blue-800 border-b pb-2 inline-block mb-2">
              {session?.sess_type_display?.[0]?.name} Session
            </h2>

          {/* STATUS BADGE – professional subtle colors */}
          <div className="mt-1">
            <span
              className={`
                inline-block px-3 py-1 rounded-full text-xs font-medium border
                ${
                  session?.sess_status === "Pending"
                    ? "bg-gray-50 text-gray-600 border-gray-300"
                    : session?.sess_status === "Ongoing"
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-green-50 text-green-700 border-green-300"
                }
              `}
            >
              {session?.sess_status}
            </span>
          </div>

          {/* ROLE */}
          {role && (
            <p className="text-gray-600 mt-2 text-sm">
              Logged in as:{" "}
              <span className="font-semibold text-gray-800">{role}</span>
            </p>
          )}

          {/* SUBTEXT */}
          <p className="text-gray-500 text-xs mt-2">
            Complete your part of this session below. Other officials’ answers are visible for review.
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
                  className="rounded-md border border-blue-300 p-5 shadow-sm bg-white border-t-4 border-blue-600"
                  >
                  {/* Role header with colored badge */}
                  <button
                    onClick={() =>
                      setOpenRoles((prev) =>
                        prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
                      )
                    }
                    className="w-full flex items-center justify-between mb-4 text-left"
                  >
                    <h3 className="text-xl font-bold text-gray-800 tracking-wide flex items-center gap-2">
                      {r} Section
                    </h3>
                    <div className="mt-1 mb-3 h-[2px] bg-blue-600/20"></div>



                    {/* Right-side button with role badge + plus/minus */}
                    <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        r === "Social Worker"
                          ? "bg-blue-600"
                          : r === "Nurse"
                          ? "bg-teal-600"
                          : r === "Psychometrician"
                          ? "bg-red-600"
                          : "bg-orange-600"
                      }`}
                    >
                      {r}
                    </span>




                      {/* Toggle Icon */}
                      <span className="text-2xl text-gray-700">
                        {openRoles.includes(r) ? "−" : "+"}
                      </span>
                    </div>
                  </button>


                  {/* Group questions by category within this role */}
                  <div
                    ref={(el) => (roleRefs.current[r] = el)}
                    style={{
                      height: openRoles.includes(r)
                        ? roleRefs.current[r]?.scrollHeight + "px"
                        : "0px",
                      opacity: openRoles.includes(r) ? 1 : 0,
                    }}
                    className="overflow-hidden transition-all duration-500 ease-in-out"
                  >


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
                    
                    <div className="px-4 py-2 rounded-t-md border-l-4 border-blue-600 bg-gray-50 shadow-sm">
                    
                    <h5 className="text-md font-semibold text-gray-900 tracking-wide">
                      {category}
                    </h5>
                  </div>


                      {/* Category Question List */}
                      <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
                        <AnimatePresence>
                          {catQuestions.map((q, index) => {
                            const editable = isQuestionEditable(q);
                            return (
                              <motion.div
                                key={q.sq_id}
                                data-question-id={q.sq_id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.22, delay: index * 0.04 }}
                                className="p-4 border border-gray-200 bg-white rounded-md mb-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="font-medium text-gray-900">
                                      {q.sq_question_text_snapshot || q.question_text || q.sq_custom_text}
                                    </p>

                                    {q.sq_is_required && (
                                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                        REQUIRED
                                      </span>
                                    )}
                                  </div>

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
                </div>
              );
            })}
            
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
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
