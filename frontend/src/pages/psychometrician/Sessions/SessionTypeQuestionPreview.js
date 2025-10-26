// src/pages/social_worker/Sessions/SessionTypeQuestionPreview.js
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function SessionTypeQuestionPreview({ sessionNum, selectedTypes }) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!sessionNum || !selectedTypes || selectedTypes.length === 0) {
      setQuestions([]);
      return;
    }

    // session.sess_type may already be IDs (integers) from backend
    const typeIds = selectedTypes.join(",");
    api
      .get(`/api/social_worker/mapped-questions/?session_num=${sessionNum}&session_types=${typeIds}`)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("Failed to fetch mapped questions", err));
  }, [sessionNum, selectedTypes]);

  // Group questions by category
  const grouped = questions.reduce((acc, q) => {
    const cat = q.question_category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-blue-700 mb-4">Mapped Questions</h4>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-gray-500">No questions found for this session type.</p>
      )}

      {Object.entries(grouped).map(([category, qs]) => (
        <div key={category} className="mb-6">
          {/* Category header */}
          <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 rounded-t-md">
            <h5 className="text-md font-semibold text-blue-800">{category}</h5>
          </div>

          {/* Questions list */}
          <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
            <AnimatePresence>
              {qs.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="p-3 border rounded mb-2 bg-gray-50 hover:bg-gray-100"
                >
                  <p className="font-medium text-gray-800">{q.question_text}</p>
                  <p className="text-xs text-gray-500">{q.question_answer_type}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
