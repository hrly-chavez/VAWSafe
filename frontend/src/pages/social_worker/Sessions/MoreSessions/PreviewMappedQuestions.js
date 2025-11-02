// src/pages/social_worker/Sessions/MoreSessions/PreviewMappedQuestions.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreviewMappedQuestions({ questions, loading }) {
  if (loading) {
    return (
      <div className="p-4 text-gray-600 italic animate-pulse">
        Loading mapped questions...
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <p className="text-gray-500 italic">
        Select a session type to view mapped questions for your role.
      </p>
    );
  }

  // Group questions by category
  const grouped = questions.reduce((acc, q) => {
    const cat = q.question_category_name || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-blue-700 mb-4 border-b pb-1">
        Role-based Mapped Questions
      </h4>

      {Object.entries(grouped).map(([category, qs]) => (
        <div key={category} className="mb-6">
          {/* Category Header */}
          <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 rounded-t-md">
            <h5 className="text-md font-semibold text-blue-800">{category}</h5>
          </div>

          {/* Question List */}
          <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
            <AnimatePresence>
              {qs.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className="p-3 border rounded mb-2 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <p className="font-medium text-gray-800">{q.question_text}</p>
                  <p className="text-xs text-gray-500">
                    Answer Type: {q.question_answer_type}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
