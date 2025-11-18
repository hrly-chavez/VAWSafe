// src/pages/nurse/Sessions/SessionTypeQuestionPreview.js
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

    // Retrieve session ID from the current route (for backend filtering by assigned roles)
    const currentUrl = window.location.pathname;
    const match = currentUrl.match(/\/sessions\/(\d+)/);
    const sessId = match ? match[1] : null;

    // Build request parameters
    const typeIds = selectedTypes.join(",");
    let endpoint = `/api/nurse/mapped-questions/?session_num=${sessionNum}&session_types=${typeIds}`;

    // Include session ID if available (important for shared Session 1)
    if (sessId) {
      endpoint += `&sess_id=${sessId}`;
    }

    api
      .get(endpoint)
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error("Failed to fetch mapped questions", err));
  }, [sessionNum, selectedTypes]);


  // Group by role first, then by category
  const groupedByRole = questions.reduce((acc, q) => {
    const role = q.question_role || "Unassigned";
    const category = q.question_category_name || "Uncategorized";

    if (!acc[role]) acc[role] = {};
    if (!acc[role][category]) acc[role][category] = [];
    acc[role][category].push(q);
    return acc;
  }, {});

  return (
     <div className="mt-6">
      <h4 className="text-lg font-semibold text-blue-700 mb-4">Mapped Questions</h4>

      {Object.keys(groupedByRole).length === 0 && (
        <p className="text-sm text-gray-500">No mapped questions found for this session.</p>
      )}

      {Object.entries(groupedByRole).map(([role, categories]) => (
        <div key={role} className="mb-8">
          <h3 className="text-lg font-bold text-[#292D96] mb-3 border-b border-gray-200 pb-1">
            {role}
          </h3>

          {Object.entries(categories).map(([category, qs]) => (
            <div key={category} className="mb-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 rounded-t-md">
                <h5 className="text-md font-semibold text-blue-800">{category}</h5>
              </div>
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
                        delay: index * 0.05,
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
      ))}
    </div>
  );
}
