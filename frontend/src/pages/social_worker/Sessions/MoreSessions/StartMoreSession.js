// src/pages/social_worker/Sessions/MoreSessions/StartMoreSession.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

const StartMoreSession = () => {
  const { sess_id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryServices, setCategoryServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const isCaseClosureSession =
    session?.sess_type_display?.some((t) => t.name === "Case Closure");

  // Fetch session data and service categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessRes, catRes] = await Promise.all([
          api.get(`/api/social_worker/sessions/${sess_id}/`),
          api.get(`/api/social_worker/service-categories/`),
        ]);
        const sessData = sessRes.data;
        setSession(sessData);
        setQuestions(sessData.questions || []); // backend returns assigned_role on each question
        setFeedback(sessData?.my_progress?.notes || sessData.sess_description || "");
        setServiceCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load session data", err);
        setError("Failed to load session information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sess_id]);

  // Fetch services under a selected category
  useEffect(() => {
    if (!selectedCategory) return;
    const fetchServices = async () => {
      try {
        const res = await api.get(
          `/api/social_worker/services/category/${selectedCategory.value}/`
        );
        setCategoryServices(res.data);
      } catch (err) {
        console.error("Failed to load services by category", err);
      }
    };
    fetchServices();
  }, [selectedCategory]);

  const handleAnswerChange = (sq_id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.sq_id === sq_id ? { ...q, [field]: value } : q))
    );
  };

  // ===== New: derive list of roles from questions (keeps compatibility with Session 1 grouping) =====
  const roles = React.useMemo(() => {
    const setRoles = new Set();
    (questions || []).forEach((q) => {
      const roleFromQ = q.assigned_role || (q.question && q.question.role) || "Unassigned";
      setRoles.add(roleFromQ);
    });
    return Array.from(setRoles);
  }, [questions]);

  // Group questions by role -> category
  const questionsByRole = React.useMemo(() => {
    const out = {};
    (roles || []).forEach((r) => {
      out[r] = {};
    });
    (questions || []).forEach((q) => {
      const role = q.assigned_role || (q.question && q.question.role) || "Unassigned";
      const cat = q.question_category_name || "Uncategorized";
      if (!out[role]) out[role] = {};
      if (!out[role][cat]) out[role][cat] = [];
      out[role][cat].push(q);
    });
    return out;
  }, [roles, questions]);

  const handleFinishSession = async () => {
    setFinishing(true);
    try {
      // Send all session question answers — don't require assigned_role to be present
      const answersPayload = (questions || [])
        .filter((q) => q.sq_id) // ensure we only send existing SessionQuestion rows
        .map((q) => ({
          sq_id: q.sq_id,
          value: q.sq_value,
          note: q.sq_note,
        }));

      const payload = {
        answers: answersPayload,
        my_feedback: feedback, // <-- IMPORTANT: backend expects my_feedback for SessionProgress.notes
        services: selectedServices.map((s) => s.value),
      };

      // =============================
      // REQUIRED QUESTIONS CHECK
      // =============================
      const missingRequired = (questions || []).filter(
        (q) =>
          q.sq_is_required &&
          (!q.sq_value || q.sq_value.trim() === "")
      );

      if (missingRequired.length > 0) {
        alert("Please answer all REQUIRED questions before finishing this session.");
        setFinishing(false);
        return;
      }

      // Proceed with API call
      const response = await api.post(`/api/social_worker/sessions/${sess_id}/finish/`, payload);

      if (response?.data?.case_closed) {
        alert("Session completed successfully.\nThe case has now been CLOSED.");
      } else {
        alert("Session completed successfully!");
      }

      const victimId =
        response?.data?.session?.incident?.vic_id?.vic_id ||
        response?.data?.session?.incident?.vic_id ||
        session?.incident?.vic_id?.vic_id ||
        null;

      if (victimId) {
        navigate(`/social_worker/victims/${victimId}`);
      } else {
        navigate("/social_worker/victims");
      }

    } catch (err) {
      console.error("Failed to finish session", err);

      const msg =
        err?.response?.data?.error ||
        "Failed to finish session. Please ensure all required questions are answered.";

      alert(msg);
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading session...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!session) return <p className="p-6">No session found.</p>;
  return (
  <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">

    {/* SESSION TITLE */}
    <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">
      {session?.sess_type_display?.[0]?.name} Session
    </h2>

    {/* QUESTIONS GROUPED BY CATEGORY */}
    <div className="space-y-8">
      {Object.entries(
        (questions || []).reduce((acc, q) => {
          const category = q.question_category_name || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(q);
          return acc;
        }, {})
      ).map(([category, qs]) => (
        <div key={category} className="mb-6">

          {/* CATEGORY HEADER */}
          <div className="px-4 py-2 rounded-t-md border-l-4 border-blue-600 bg-blue-50 shadow-sm">
            <h5 className="text-md font-semibold text-blue-800 tracking-wide">
              {category}
            </h5>
          </div>

          {/* CATEGORY QUESTION LIST */}
          <div className="border border-t-0 rounded-b-md p-4 bg-white shadow-sm">
            <AnimatePresence>
              {qs.map((q, index) => (
                <motion.div
                  key={q.sq_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.22, delay: index * 0.04 }}
                  className="p-4 border border-gray-200 bg-gray-50 rounded-md mb-3"
                >
                  {/* QUESTION TEXT */}
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {q.sq_question_text_snapshot ||
                        q.question_text ||
                        q.sq_custom_text}
                    </p>

                    {q.sq_is_required && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                        REQUIRED
                      </span>
                    )}
                  </div>

                  {/* YES/NO */}
                  {(q.sq_answer_type_snapshot ||
                    q.question_answer_type ||
                    q.sq_custom_answer_type) === "Yes/No" && (
                    <select
                      value={q.sq_value || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.sq_id, "sq_value", e.target.value)
                      }
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select…</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  )}

                  {/* TEXT */}
                  {(q.sq_answer_type_snapshot ||
                    q.question_answer_type ||
                    q.sq_custom_answer_type) === "Text" && (
                    <textarea
                      value={q.sq_value || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.sq_id, "sq_value", e.target.value)
                      }
                      className="w-full border rounded p-2"
                      rows={3}
                      placeholder="Enter your answer…"
                    />
                  )}

                  {/* NOTES */}
                  {(q.sq_answer_type_snapshot ||
                    q.question_answer_type ||
                    q.sq_custom_answer_type) !== "Text" && (
                    <input
                      type="text"
                      value={q.sq_note || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.sq_id, "sq_note", e.target.value)
                      }
                      className="w-full border rounded p-2 mt-2"
                      placeholder="Additional notes (if any)…"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>

    {/* FEEDBACK SECTION */}
    <div className="p-4 bg-gray-50 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Feedback
      </h3>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full border rounded-md p-3 text-sm text-gray-800"
        rows={4}
        placeholder="Write your feedback about this session..."
      />
    </div>

    {/* ACTION BUTTONS */}
    <div className="flex justify-end gap-4 mt-6">
    <button
         onClick={() => {
        // Extra confirmation ONLY for Case Closure
          if (isCaseClosureSession) {
              const confirmed = window.confirm(
                "This session is a CASE CLOSURE session.\nFinishing this will CLOSE the entire case.\n\nDo you want to continue?"
              );
              if (!confirmed) return;
          }
          handleFinishSession();
      }}
        disabled={finishing}
        className={`px-6 py-2 rounded-md font-semibold text-white flex items-center justify-center gap-2 transition ${
          finishing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {finishing ? "Finishing..." : "Finish Session"}
      </button>
    </div>
  </div>
);

  // return (
  //   <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
  //     <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">
  //       {session?.sess_type_display?.[0]?.name} Session
  //     </h2>


  //     {/* Render role sections (even if only one role exists) */}
  //     {roles.map((role) => {
  //       const grouped = questionsByRole[role] || {};
  //       return (
  //         <div key={role} className="mb-6">
  //           <div className="bg-green-50 border-l-4 border-green-600 px-4 py-2 rounded-t-md">
  //             <h5 className="text-md font-semibold text-green-800">{role} Section</h5>
  //           </div>

  //           <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
  //             <AnimatePresence>
  //               {Object.entries(grouped).map(([category, qs]) => (
  //                 <div key={category} className="mb-4">
  //                   <div className="mb-2">
  //                     <h6 className="font-semibold text-gray-700">{category}</h6>
  //                   </div>
  //                   {qs.map((q, index) => (
  //                     <motion.div
  //                       key={q.sq_id}
  //                       initial={{ opacity: 0, x: -20 }}
  //                       animate={{ opacity: 1, x: 0 }}
  //                       exit={{ opacity: 0, x: 20 }}
  //                       transition={{ duration: 0.22, delay: index * 0.04 }}
  //                       className="p-3 border rounded mb-3 bg-gray-50"
  //                     >
  //                       <div className="flex items-center gap-2 mb-2">
  //                         <p className="font-medium text-gray-800">
  //                           {q.sq_question_text_snapshot || q.question_text || q.sq_custom_text}
  //                         </p>

  //                         {q.sq_is_required && (
  //                           <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
  //                             REQUIRED
  //                           </span>
  //                         )}
  //                       </div>

  //                       {(q.sq_answer_type_snapshot || q.question_answer_type || q.sq_custom_answer_type) === "Yes/No" && (
  //                         <select
  //                           value={q.sq_value || ""}
  //                           onChange={(e) =>
  //                             handleAnswerChange(q.sq_id, "sq_value", e.target.value)
  //                           }
  //                           className="w-full border rounded p-2"
  //                         >
  //                           <option value="">Select...</option>
  //                           <option value="Yes">Yes</option>
  //                           <option value="No">No</option>
  //                         </select>
  //                       )}

  //                       {(q.sq_answer_type_snapshot || q.question_answer_type || q.sq_custom_answer_type) === "Text" && (
  //                         <textarea
  //                           value={q.sq_value || ""}
  //                           onChange={(e) =>
  //                             handleAnswerChange(q.sq_id, "sq_value", e.target.value)
  //                           }
  //                           className="w-full border rounded p-2"
  //                           rows={3}
  //                           placeholder="Enter your answer..."
  //                         />
  //                       )}

  //                       {/* Show notes only if the question type is not Text */}
  //                       {(q.sq_answer_type_snapshot || q.question_answer_type || q.sq_custom_answer_type) !== "Text" && (
  //                         <input
  //                           type="text"
  //                           value={q.sq_note || ""}
  //                           onChange={(e) =>
  //                             handleAnswerChange(q.sq_id, "sq_note", e.target.value)
  //                           }
  //                           className="w-full border rounded p-2 mt-2"
  //                           placeholder="Additional notes (if any)..."
  //                         />
  //                       )}
  //                     </motion.div>
  //                   ))}
  //                 </div>
  //               ))}
  //             </AnimatePresence>
  //           </div>

  //           {/* Per-role feedback box */}
  //           <div className="p-4 bg-gray-50 border rounded-md shadow-sm mt-3">
  //             <h3 className="text-lg font-semibold text-green-800">{role} Feedback</h3>
  //             <textarea
  //               value={feedback}
  //               onChange={(e) => setFeedback(e.target.value)}
  //               className="w-full border rounded-md p-3 text-sm text-gray-800"
  //               rows={4}
  //               placeholder="Write your feedback about this role's part..."
  //             />
  //           </div>
  //         </div>
  //       );
  //     })}

  //     {/* Finish Button */}
  //     <div className="flex justify-end gap-4 mt-6">
  //       <button
  //         onClick={() => navigate(-1)}
  //         className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
  //       >
  //         Back
  //       </button>
  //       <button
  //         onClick={handleFinishSession}
  //         disabled={finishing}
  //         className={`px-6 py-2 rounded-md font-semibold text-white flex items-center justify-center gap-2 transition ${
  //           finishing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
  //         }`}
  //       >
  //         {finishing ? "Finishing..." : "Finish Session"}
  //       </button>
  //     </div>
  //   </div>
  // );
};

export default StartMoreSession;
