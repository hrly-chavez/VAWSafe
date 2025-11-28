
// src/pages/nurse/Sessions/MoreSessions/PreviewMappedQuestions.js
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
        Select a Consultation type to view mapped questions for your role.
      </p>
    );
  }

  // Extract roles from question list
  const roles = Array.from(
    new Set(
      (questions || []).map(
        (q) => q.assigned_role || q.question_role || "Unassigned"
      )
    )
  );

  // Build structure: role → category → questions
  const grouped = {};
  roles.forEach((r) => (grouped[r] = {}));

  (questions || []).forEach((q) => {
    const role = q.assigned_role || q.question_role || "Unassigned";
    const category = q.question_category_name || "Uncategorized";

    if (!grouped[role]) grouped[role] = {};
    if (!grouped[role][category]) grouped[role][category] = [];
    grouped[role][category].push(q);
  });

  const roleColors = {
    "Social Worker": "bg-blue-50 border-blue-400",
    Nurse: "bg-blue-50 border-blue-400",
    Psychometrician: "bg-blue-50 border-blue-400",
    "Home Life": "bg-blue-50 border-blue-400",
    Unassigned: "bg-gray-50 border-gray-300",
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-blue-700 mb-4 border-b pb-1">
        Role-based Mapped Questions
      </h4>

      {roles.map((role) => (
        <div key={role} className="mb-6 border rounded-md shadow-sm">
          {/* ROLE HEADER */}
          <div
            className={`px-4 py-2 font-semibold text-blue-800 border-b ${roleColors[role]}`}
          >
            {role}
          </div>

          {/* CATEGORY GROUPS */}
          <div className="p-3 bg-white space-y-4">
            {Object.entries(grouped[role]).map(([category, qs]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 rounded-t-md">
                  <h5 className="text-md font-semibold text-blue-800">
                    {category}
                  </h5>
                </div>

                {/* Question List */}
                <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
                  <AnimatePresence>
                    {qs.map((q, index) => (
                      <motion.div
                        key={q.id || q.sq_id || index}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                        }}
                        className="p-3 border rounded mb-2 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <p className="font-medium text-gray-800">
                          {q.question_text}
                        </p>
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
        </div>
      ))}
    </div>
  );
}
