// src/pages/nurse/Questions/ViewQuestion.js
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function ViewQuestion({ questionId, onClose }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) return;
    const fetchQuestion = async () => {
      try {
        const res = await api.get(`/api/nurse/questions/${questionId}/`);
        setQuestion(res.data);
      } catch (err) {
        console.error("Failed to load question detail:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [questionId]);

  if (!questionId) return null;

return (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <AnimatePresence>
      <motion.div
        key="view-question"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-0 overflow-hidden"
      >
        {/* HEADER */}
        <div className="bg-[#292D96] px-6 py-4">
          <h2 className="text-lg font-semibold text-white tracking-wide">
            Question Details
          </h2>
        </div>

        {/* BODY */}
        <div className="p-6 bg-gray-50">
          {loading ? (
            <p className="text-gray-500 text-center py-6">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

              {/* QUESTION TEXT (Top) */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Question Text
                </p>
                <div className="bg-white border rounded-md p-3 text-gray-800 whitespace-pre-line">
                  {question.ques_question_text}
                </div>
              </div>

              {/* CATEGORY */}
              <InfoBlock
                label="Category"
                value={question.category_name || "Uncategorized"}
              />

              {/* ANSWER TYPE */}
              <InfoBlock
                label="Answer Type"
                value={question.ques_answer_type}
              />

              {/* REQUIRED */}
              <InfoBlock
                label="Required"
                value={question.ques_is_required ? "Yes" : "No"}
              />

              {/* STATUS */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Status
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    question.ques_is_active
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {question.ques_is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              {/* CREATED BY */}
              <InfoBlock
                label="Created By"
                value={question.created_by_name || "Unknown"}
              />

              {/* CREATED AT */}
              <InfoBlock
                label="Created At"
                value={new Date(question.created_at).toLocaleString()}
              />

              {/* SESSION MAPPINGS */}
              {question.mappings?.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Session Mappings
                  </p>
                  <div className="bg-white border rounded-md p-3">
                    <ul className="list-disc ml-5 text-gray-800 leading-6">
                      {question.mappings.map((m, idx) => (
                        <li key={idx}>
                          Session {m.session_number} — {m.session_type}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-white px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#292D96] text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
);


}
const InfoBlock = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
    <div className="bg-white border rounded-md p-2 text-gray-800">{value}</div>
  </div>
);

