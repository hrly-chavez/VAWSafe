// src/pages/social_worker/Sessions/StartSession.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import NextSessionModal from "./NextSessionModal";
import CaseSessionFollowup from "./CaseSessionFollowup";
import AddCustomQuestions from "./AddCustomQuestions";

export default function StartSession() {
  const { sess_id } = useParams();
  const navigate = useNavigate();
  const [showNextModal, setShowNextModal] = useState(false);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0); // always go to the top
  }, []);

  //  Start session & hydrate questions on mount
  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await api.post(
          `/api/social_worker/sessions/${sess_id}/start/`
        );
        setQuestions(res.data.questions); // hydrated questions
        setSession(res.data); // keep session details for modal
      } catch (err) {
        console.error("Failed to start session", err);
        alert("Could not start session.");
      } finally {
        setLoading(false);
      }
    };
    startSession();
  }, [sess_id]);

  //  Update answer locally
  const handleChange = (sq_id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.sq_id === sq_id ? { ...q, [field]: value } : q))
    );
  };

  //  Finish session
  const handleFinishSession = async () => {
  try {
    const payload = {
      answers: questions.map((q) => ({
        sq_id: q.sq_id,
        value: q.sq_value,
        note: q.sq_note,
      })),
      sess_description: session?.sess_description || "",
    };
    await api.post(`/api/social_worker/sessions/${sess_id}/finish/`, payload);
    alert("Session finished successfully!");
    setShowFollowupModal(true); // 🔹 open modal instead of window.confirm
  } catch (err) {
    console.error("Failed to finish session", err);
    alert("Failed to finish session.");
  }
};


  if (loading) return <p className="p-6">Loading session...</p>;

  // Group by category
  const grouped = questions.reduce((acc, q) => {
    const cat = q.question_category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        Start Session & Answer Questions
      </h2>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-gray-500">No questions available.</p>
      )}

      {Object.entries(grouped).map(([category, qs]) => (
        <div key={category} className="mb-6">
          {/* Category header */}
          <div className="bg-green-50 border-l-4 border-green-600 px-4 py-2 rounded-t-md">
            <h5 className="text-md font-semibold text-green-800">{category}</h5>
          </div>

          {/* Questions list */}
          <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
            <AnimatePresence>
              {qs.map((q, index) => (
                <motion.div
                  key={q.sq_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-3 border rounded mb-3 bg-gray-50"
                >
                  <p className="font-medium text-gray-800 mb-2">
                    {q.question_text || q.sq_custom_text}
                  </p>

                  {/* Render input by type */}
                  {(q.question_answer_type || q.sq_custom_answer_type) === "Yes/No" && (
                    <select
                      value={q.sq_value || ""}
                      onChange={(e) =>
                        handleChange(q.sq_id, "sq_value", e.target.value)
                      }
                      className="w-full border rounded p-2"
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
                      placeholder="Enter your answer..."
                    />
                  )}

                  {(q.question_answer_type || q.sq_custom_answer_type) === "Multiple Choice" && (
                    <input
                      type="text"
                      value={q.sq_value || ""}
                      onChange={(e) =>
                        handleChange(q.sq_id, "sq_value", e.target.value)
                      }
                      className="w-full border rounded p-2"
                      placeholder="Enter selected choice..."
                    />
                  )}
                  

                  {/* Optional note */}
                  <input
                    type="text"
                    value={q.sq_note || ""}
                    onChange={(e) =>
                      handleChange(q.sq_id, "sq_note", e.target.value)
                    }
                    className="w-full border rounded p-2 mt-2"
                    placeholder="Additional notes (if any)..."
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
        {/* CUSTOM QUESTION BUTTON */}
        <div className="flex justify-end">
              <button onClick={() => setShowAddCustomModal(true)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Add Custom Question
              </button>
            </div>
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Session Feedback
          </h2>   
          {/* Session Feedback / Description */}
          <div className="p-4 bg-gray-50 border rounded-md shadow-sm mb-6">
            <textarea value={session?.sess_description || ""}
              onChange={(e) => setSession((prev) => ({ ...prev, sess_description: e.target.value }))}
              className="w-full border rounded-md p-3 text-sm text-gray-800"
              rows={4}
              placeholder="Write your feedback about this session (e.g. progress, issues, observations)..."/>
          </div>

      {/* Actions */}
      {questions.length > 0 && (
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleFinishSession}
            className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            Finish Session
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      )}

      {/*  Modal for scheduling next session */}
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
      {/* Modal for Custom Questions */}
    <AddCustomQuestions
        show={showAddCustomModal}
        onClose={() => setShowAddCustomModal(false)}
        sessionId={sess_id}
        onAdded={(newQ) => setQuestions((prev) => [...prev, newQ])}
      />

    </div>
  );
}
