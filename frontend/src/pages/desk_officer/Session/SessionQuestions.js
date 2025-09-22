// src/pages/desk_officer/Session/SessionQuestions.js
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function SessionQuestions({ sessionId }) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!sessionId) return;

    api
      .get(`/api/desk_officer/sessions/${sessionId}/questions/`)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("Failed to fetch session questions", err));
  }, [sessionId]);

  const handleChange = (sq_id, field, newValue) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.sq_id === sq_id ? { ...q, [field]: newValue } : q
      )
    );
  };

 const handleSaveAnswers = async () => {
  try {
    const payload = {
      answers: questions.map((q) => ({
        sq_id: q.sq_id,
        value: q.sq_value,
        note: q.sq_note,
      })),
    };
    await api.post(`/api/desk_officer/sessions/${sessionId}/answers/`, payload);
    alert(" Answers submitted successfully!");
  } catch (err) {
    console.error("Failed to submit answers", err.response?.data || err.message);
    alert(" Failed to submit answers");
  }
};;

  // Group questions by category
  const grouped = questions.reduce((acc, q) => {
    const cat = q.question_category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-green-700 mb-4">
        Answer Session Questions
      </h4>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-gray-500">
          No generated questions found for this session.
        </p>
      )}

      {Object.entries(grouped).map(([category, qs]) => (
        <div key={category} className="mb-6">
          {/* Category header */}
          <div className="bg-green-50 border-l-4 border-green-500 px-4 py-2 rounded-t-md">
            <h5 className="text-md font-semibold text-green-800">{category}</h5>
          </div>

          {/* Questions list */}
          <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
            <AnimatePresence>
              {qs.map((q, index) => (
                <motion.div
                  key={q.sq_id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="p-3 border rounded mb-3 bg-gray-50"
                >
                  <p className="font-medium text-gray-800 mb-2">
                    {q.question_text}
                  </p>

                  {/* Render input by type */}
                  {q.question_answer_type === "Yes/No" && (
                    <select
                      value={q.sq_value || ""}
                      onChange={(e) => handleChange(q.sq_id, "sq_value", e.target.value)}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  )}

                  {q.question_answer_type === "Text" && (
                    <textarea
                      value={q.sq_value || ""}
                      onChange={(e) => handleChange(q.sq_id, "sq_value", e.target.value)}
                      className="w-full border rounded p-2"
                      rows={3}
                      placeholder="Enter your answer..."
                    />
                  )}

                  {q.question_answer_type === "Multiple Choice" && (
                    <input
                      type="text"
                      value={q.sq_value || ""}
                      onChange={(e) => handleChange(q.sq_id, "sq_value", e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="Enter selected choice..."
                    />
                  )}

                  {/* Optional note */}
                  <input
                    type="text"
                    value={q.sq_note || ""}
                    onChange={(e) => handleChange(q.sq_id, "sq_note", e.target.value)}
                    className="w-full border rounded p-2 mt-2"
                    placeholder="Additional notes (if any)..."
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {questions.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveAnswers}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Save Answers
          </button>
        </div>
      )}
    </div>
  );
}
