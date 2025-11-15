// src/pages/psychometrician/Questions/ViewQuestion.js
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
        const res = await api.get(`/api/psychometrician/questions/${questionId}/`);
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
          className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6"
        >
          <h2 className="text-xl font-semibold text-[#292D96] mb-4">
            Question Details
          </h2>

          {loading ? (
            <p className="text-gray-500 text-center py-6">Loading...</p>
          ) : (
            <>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Category:</p>
                  <p className="text-gray-900">
                    {question.category_name || "Uncategorized"}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Question Text:</p>
                  <p className="text-gray-900 whitespace-pre-line">
                    {question.ques_question_text}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Answer Type:</p>
                  <p className="text-gray-900">{question.ques_answer_type}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Status:</p>
                  <p
                    className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ${
                      question.ques_is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {question.ques_is_active ? "Active" : "Inactive"}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Created By:</p>
                  <p className="text-gray-900">{question.created_by_name || "Unknown"}</p>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Created At:</p>
                  <p className="text-gray-900">
                    {new Date(question.created_at).toLocaleString()}
                  </p>
                </div>

                {question.mappings?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700">Session Mappings:</p>
                    <ul className="list-disc ml-6 text-gray-900">
                      {question.mappings.map((m) => (
                        <li key={`${m.session_type_id}-${m.session_number}`}>
                          Session {m.session_number} — {m.session_type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-6 text-right">
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
