//src/pages/social_worker/Questions/EditQuestion.js

import { useEffect, useState } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios";

export default function EditQuestion({ show, onClose, questionId, onUpdated }) {
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState({
    ques_category: "",
    ques_question_text: "",
    ques_answer_type: "",
    mappings: [],
  });

  const [categories, setCategories] = useState([]);
  const [answerTypes, setAnswerTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sessionNumbers, setSessionNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // =============================
  // Fetch question details
  // =============================
  useEffect(() => {
    if (!show || !questionId) return;

    api.get(`/api/social_worker/questions/${questionId}/`)
      .then((res) => {
        setQuestion(res.data);

        // ===== PREFILL MAPPINGS =====
        if (res.data.mappings && res.data.mappings.length > 0) {
          const rawSessionNumbers = [
            ...new Set(res.data.mappings.map((m) => m.session_number)),
          ].sort((a, b) => a - b);

          let prefill = [];

          // If any session >= 4 → use only Session 4+
          if (rawSessionNumbers.some((n) => n >= 4)) {
            prefill.push({ value: "4+", label: "Session 4+" });
          }

          // Add 1–3 normally
          if (rawSessionNumbers.includes(1)) {
            prefill.push({ value: 1, label: "Session 1" });
          }
          if (rawSessionNumbers.includes(2)) {
            prefill.push({ value: 2, label: "Session 2" });
          }
          if (rawSessionNumbers.includes(3)) {
            prefill.push({ value: 3, label: "Session 3" });
          }

          setSelectedNumbers(prefill);

          // ===== PREFILL SESSION TYPES =====
          const typeMap = new Map();
          res.data.mappings.forEach((m) => {
            if (!typeMap.has(m.session_type_id)) {
              typeMap.set(m.session_type_id, m.session_type);
            }
          });

          const types = Array.from(typeMap.entries()).map(([id, name]) => ({
            value: id,
            label: name,
          }));

          setSelectedTypes(types);
        }
      })
      .catch((err) => console.error("Failed to load question:", err));
  }, [questionId, show]);

  // =============================
  // Fetch dropdown data
  // =============================
  useEffect(() => {
    api.get("/api/social_worker/questions/choices/").then((res) => {
      setCategories(res.data.categories);
      setAnswerTypes(res.data.answer_types);
    });
  }, []);

  // =============================
  // Fetch SESSION TYPES + NUMBERS
  // =============================
  useEffect(() => {
    if (step === 2) {
      // New dropdown: 1,2,3,4+
      const nums = [
        { value: 1, label: "Session 1" },
        { value: 2, label: "Session 2" },
        { value: 3, label: "Session 3" },
        { value: "4+", label: "Session 4+" }, // special
      ];
      setSessionNumbers(nums);

      api
        .get("/api/social_worker/session-types/")
        .then((res) =>
          setSessionTypes(res.data.map((t) => ({ value: t.id, label: t.name })))
        )
        .catch((err) => console.error("Failed to fetch session types", err));
    }
  }, [step]);

  // =============================
  // Save QUESTION Edits
  // =============================
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { mappings, created_by_name, ...editableFields } = question;

      const res = await api.patch(
        `/api/social_worker/questions/${questionId}/`,
        editableFields
      );

      if (res.status === 200) {
        alert("Question updated successfully!");

        const updatedRes = await api.get(
          `/api/social_worker/questions/${questionId}/`
        );
        setQuestion(updatedRes.data);

        // Prefill again
        if (updatedRes.data.mappings && updatedRes.data.mappings.length > 0) {
          const rawSessionNumbers = [
            ...new Set(updatedRes.data.mappings.map((m) => m.session_number)),
          ].sort((a, b) => a - b);

          let prefill = [];

          if (rawSessionNumbers.some((n) => n >= 4)) {
            prefill.push({ value: "4+", label: "Session 4+" });
          }
          if (rawSessionNumbers.includes(1))
            prefill.push({ value: 1, label: "Session 1" });
          if (rawSessionNumbers.includes(2))
            prefill.push({ value: 2, label: "Session 2" });
          if (rawSessionNumbers.includes(3))
            prefill.push({ value: 3, label: "Session 3" });

          setSelectedNumbers(prefill);

          const typeMap = new Map();
          updatedRes.data.mappings.forEach((m) => {
            if (!typeMap.has(m.session_type_id)) {
              typeMap.set(m.session_type_id, m.session_type);
            }
          });

          const types = Array.from(typeMap.entries()).map(([id, name]) => ({
            value: id,
            label: name,
          }));

          setSelectedTypes(types);
        }

        setStep(2);
      }
    } catch (err) {
      if (err.response) {
        if (
          err.response.status === 400 &&
          err.response.data?.detail?.includes("No changes")
        ) {
          alert("No changes detected — proceeding to assignments.");
          setStep(2);
        } else {
          alert("Error updating question.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Helper: expand 4+ into 4..15
  // =============================
  const expandSessionNumbers = (selected) => {
    const OUT = new Set();

    selected.forEach((n) => {
      const v = typeof n === "object" ? n.value : n;
      if (v === "4+") {
        for (let i = 4; i <= 15; i++) OUT.add(i);
      } else {
        OUT.add(Number(v));
      }
    });

    return Array.from(OUT).sort((a, b) => a - b);
  };

  // =============================
  // Save ASSIGNMENTS (session numbers & types)
  // =============================
  const handleAssign = async () => {
    const currentNumbers = expandSessionNumbers(selectedNumbers); // expand here
    const currentTypes = selectedTypes.map((t) => t.value).sort();

    const originalNumbers = (question.mappings || [])
      .map((m) => m.session_number)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();

    const originalTypes = (question.mappings || [])
      .map((m) => m.session_type_id)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();

    const numbersChanged =
      JSON.stringify(currentNumbers) !== JSON.stringify(originalNumbers);
    const typesChanged =
      JSON.stringify(currentTypes) !== JSON.stringify(originalTypes);

    if (!numbersChanged && !typesChanged) {
      alert("No changes detected in session assignments.");
      if (onUpdated) onUpdated();
      onClose();
      return;
    }

    try {
      await api.post("/api/social_worker/questions/bulk-assign/", {
        questions: [questionId],
        session_numbers: currentNumbers,
        session_types: currentTypes,
      });

      alert("Assignments updated successfully!");
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("Error assigning question:", err);
      alert("Error updating assignments.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <AnimatePresence mode="wait">
          {/* STEP 1 - Edit Question */}
          {step === 1 && (
            <motion.div
              key="edit-step1"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-blue-700 mb-4">Edit Question</h2>

              <form
                onSubmit={handleSaveQuestion}
                className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
              >
                {/* Category */}
                <div>
                  <label className="block text-sm text-gray-600">Category</label>
                  <select
                    value={question.ques_category || ""}
                    onChange={(e) =>
                      setQuestion({ ...question, ques_category: e.target.value })
                    }
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question text */}
                <div>
                  <label className="block text-sm text-gray-600">Question</label>
                  <textarea
                    value={question.ques_question_text || ""}
                    onChange={(e) =>
                      setQuestion({
                        ...question,
                        ques_question_text: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                    rows="3"
                    required
                  />
                </div>

                {/* Answer type */}
                <div>
                  <label className="block text-sm text-gray-600">Answer Type</label>
                  <select
                    value={question.ques_answer_type || ""}
                    onChange={(e) =>
                      setQuestion({
                        ...question,
                        ques_answer_type: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="">Select type...</option>
                    {answerTypes.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save & Continue"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2 - Assign Sessions */}
          {step === 2 && (
            <motion.div
              key="edit-step2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-green-700 mb-4">
                Assign to Sessions
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    Session Numbers
                  </label>
                  <Select
                    isMulti
                    options={sessionNumbers}
                    value={selectedNumbers}
                    onChange={setSelectedNumbers}
                    placeholder="Select session numbers..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">
                    Session Types
                  </label>
                  <Select
                    isMulti
                    options={sessionTypes}
                    value={selectedTypes}
                    onChange={setSelectedTypes}
                    placeholder="Select session types..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAssign}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save Assignment
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
