// src/pages/psychometrician/Sessions/SessionTypeQuestionPreview.js
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function SessionTypeQuestionPreview({ sessionNum, selectedTypes }) {
  const [questions, setQuestions] = useState([]);
  const [openRoles, setOpenRoles] = useState([]); // collapse by role only

  useEffect(() => {
    if (!sessionNum || !selectedTypes || selectedTypes.length === 0) {
      setQuestions([]);
      return;
    }

    const currentUrl = window.location.pathname;
    const match = currentUrl.match(/\/sessions\/(\d+)/);
    const sessId = match ? match[1] : null;

    const typeIds = selectedTypes.join(",");
    let endpoint = `/api/psychometrician/mapped-questions/?session_num=${sessionNum}&session_types=${typeIds}`;

    if (sessId) {
      endpoint += `&sess_id=${sessId}`;
    }

    api
      .get(endpoint)
      .then((res) => {
        setQuestions(res.data);

        // Auto-open all roles by default
        const rolesSet = new Set();
        res.data.forEach((q) => rolesSet.add(q.question_role || "Unassigned"));
        setOpenRoles([...rolesSet]);
      })
      .catch((err) => console.error("Failed to fetch mapped questions", err));
  }, [sessionNum, selectedTypes]);

  // Group by role → category
  const groupedByRole = questions.reduce((acc, q) => {
    const role = q.question_role || "Unassigned";
    const category = q.question_category_name || "Uncategorized";

    if (!acc[role]) acc[role] = {};
    if (!acc[role][category]) acc[role][category] = [];
    acc[role][category].push(q);
    return acc;
  }, {});

  // Same role colors as SessionDetails.js
  const roleColors = {
    "Social Worker": "border-green-400 bg-green-50",
    Nurse: "border-blue-400 bg-blue-50",
    Psychometrician: "border-purple-400 bg-purple-50",
    "Home Life": "border-orange-400 bg-orange-50",
    Unassigned: "border-gray-300 bg-gray-50",
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-blue-700 mb-4">Mapped Questions</h4>

      {Object.keys(groupedByRole).length === 0 && (
        <p className="text-sm text-gray-500">No mapped questions found for this session.</p>
      )}

      {Object.entries(groupedByRole).map(([role, categories]) => (
        <div
          key={role}
          className="mb-6 border rounded-lg shadow-sm overflow-hidden"
        >
          {/* ROLE HEADER (copied design from SessionDetails.js) */}
          <button
            onClick={() => {
              setOpenRoles((prev) =>
                prev.includes(role)
                  ? prev.filter((r) => r !== role)
                  : [...prev, role]
              );
            }}
            className={`w-full text-left px-5 py-3 font-semibold text-gray-900 flex items-center justify-between border-b ${roleColors[role]}`}
          >
            <span>{role}</span>
            <span className="text-lg">
              {openRoles.includes(role) ? "−" : "+"}
            </span>
          </button>

          {/* Collapsible content */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              openRoles.includes(role)
                ? "max-h-[5000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 bg-white space-y-5">
              {Object.entries(categories).map(([category, qs]) => (
                <div key={category} className="mb-4">
                  {/* Category Header */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 rounded-t-md">
                    <h5 className="text-md font-semibold text-blue-800">{category}</h5>
                  </div>

                  {/* Questions List */}
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
          </div>
        </div>
      ))}
    </div>
  );
}
