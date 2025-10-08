// src/pages/dswd/Questions/EditQuestion.js
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
    mappings: [], //  store mappings for prefill
  });
  const [categories, setCategories] = useState([]);
  const [answerTypes, setAnswerTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sessionNumbers, setSessionNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Fetch question details (including mappings)
  useEffect(() => {
    if (!show || !questionId) return;
    api
      .get(`/api/dswd/questions/${questionId}/`)
      .then((res) => {
        setQuestion(res.data);
        //  Preload existing mappings (numbers & types)
        if (res.data.mappings && res.data.mappings.length > 0) {
          const numbers = [
            ...new Set(res.data.mappings.map((m) => m.session_number)),
          ].map((num) => ({
            value: num,
            label: `Session ${num}`,
          }));

        //  Deduplicate session types by ID
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

          setSelectedNumbers(numbers);
          setSelectedTypes(types);
        }
      })
      .catch((err) => console.error("Failed to load question:", err));
  }, [questionId, show]);

  // Fetch dropdown data
  useEffect(() => {
    api
      .get("/api/dswd/questions/choices/")
      .then((res) => {
        setCategories(res.data.categories);
        setAnswerTypes(res.data.answer_types);
      })
      .catch((err) => console.error("Failed to load choices:", err));
  }, []);

  // Fetch session types + numbers
  useEffect(() => {
    if (step === 2) {
      const nums = Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: `Session ${i + 1}`,
      }));
      setSessionNumbers(nums);

      api
        .get("/api/dswd/session-types/")
        .then((res) =>
          setSessionTypes(res.data.map((t) => ({ value: t.id, label: t.name })))
        )
        .catch((err) => console.error("Failed to fetch session types", err));
    }
  }, [step]);

  // Save question edits
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const { mappings, created_by_name, ...editableFields } = question;
        const res = await api.patch(`/api/dswd/questions/${questionId}/`, editableFields);

        alert("Question updated successfully!");
        setStep(2);
      } catch (err) {
        if (err.response?.data?.detail === "No changes detected — update skipped.") {
          alert("No changes detected — nothing to update. Proceeding to assignments...");
          setStep(2); // ✅ allow continuing to session assignment
        } else {
          console.error("Failed to update question:", err);
          alert("Could not update question.");
        }
      } finally {
        setLoading(false);
      }


  };

  
// Save assignment
const handleAssign = async () => {
  // Compare current selections vs original mappings
  const currentNumbers = selectedNumbers.map((n) => n.value).sort();
  const currentTypes = selectedTypes.map((t) => t.value).sort();

  const originalNumbers = (question.mappings || [])
    .map((m) => m.session_number)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();

  const originalTypes = (question.mappings || [])
    .map((m) => m.session_type_id)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();

  // Check if something changed
  const numbersChanged =
    JSON.stringify(currentNumbers) !== JSON.stringify(originalNumbers);
  const typesChanged =
    JSON.stringify(currentTypes) !== JSON.stringify(originalTypes);

  if (!numbersChanged && !typesChanged) {
  alert("No changes detected in session assignments. Closing editor...");
  if (onUpdated) onUpdated(); // refresh parent if needed
  onClose(); // close the modal automatically
  return;
}

  try {
    await api.post("/api/dswd/questions/bulk-assign/", {
      questions: [questionId],
      session_numbers: currentNumbers,
      session_types: currentTypes,
    });
    alert("Question assignment updated successfully!");
    if (onUpdated) onUpdated();
    onClose();
  } catch (err) {
    console.error("Failed to assign question:", err);
    alert("Error updating question assignment.");
  }
};


  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <AnimatePresence mode="wait">
          {/* Step 1 */}
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
                      <option key={c} value={c}>
                        {c}
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

          {/* Step 2 */}
          {step === 2 && (
            <motion.div
              key="edit-step2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-green-700 mb-4">
                Assign Question to Sessions
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    Session Numbers
                  </label>
                  <Select
                    options={sessionNumbers}
                    isMulti
                    value={selectedNumbers}
                    onChange={setSelectedNumbers}
                    placeholder="Select session numbers..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">
                    Session Types
                  </label>
                  <Select
                    options={sessionTypes}
                    isMulti
                    value={selectedTypes}
                    onChange={setSelectedTypes}
                    placeholder="Select session types..."
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
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
