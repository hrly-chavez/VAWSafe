// src/pages/dswd/Questions/AddQuestion.js
import { useState, useEffect } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios";

export default function AddQuestion({ onClose }) {
  const [questions, setQuestions] = useState([
    { ques_category: "", ques_question_text: "", ques_answer_type: "", ques_is_active: true },
  ]);
  const [step, setStep] = useState(1);
  const [createdQuestions, setCreatedQuestions] = useState([]);

  const [categories, setCategories] = useState([]);
  const [answerTypes, setAnswerTypes] = useState([]);

  const [sessionNumbers, setSessionNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Load categories & answer types
  useEffect(() => {
    api.get("/api/dswd/questions/choices/").then((res) => {
      setCategories(res.data.categories);
      setAnswerTypes(res.data.answer_types);
    });
  }, []);

  // Load session types + define session numbers
  useEffect(() => {
    if (step === 2) {
      const nums = Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: `Session ${i + 1}`,
      }));
      setSessionNumbers(nums);

      api.get("/api/dswd/session-types/").then((res) =>
        setSessionTypes(res.data.map((t) => ({ value: t.id, label: t.name })))
      );
    }
  }, [step]);

  // Handle change for a specific question in the list
  const handleQuestionChange = (index, e) => {
    const newQuestions = [...questions];
    newQuestions[index][e.target.name] = e.target.value;
    setQuestions(newQuestions);
  };

  // Add a new blank question row
  const addQuestionField = () => {
    setQuestions([
      ...questions,
      { ques_category: "", ques_question_text: "", ques_answer_type: "", ques_is_active: true },
    ]);
  };

  // Remove a question row  
  const removeQuestionField = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Submit bulk create
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/api/dswd/questions/bulk/", { questions }); // <-- wrap in object
    setCreatedQuestions(res.data);
    setStep(2);
  } catch (err) {
    console.error("Failed to create questions:", err.response?.data || err);
    alert("Error creating questions");
  }
};

  // Bulk assign all created questions
  const handleAssign = async () => {
    try {
      await api.post("/api/dswd/questions/bulk-assign/", {
        questions: createdQuestions.map((q) => q.ques_id),
        session_numbers: selectedNumbers.map((n) => n.value),
        session_types: selectedTypes.map((t) => t.value),
      });
      alert(" Questions assigned successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to assign questions:", err.response?.data || err);
      alert("Error assigning questions");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <AnimatePresence mode="wait">
          {/* Step 1: Bulk Add Questions */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-blue-700 mb-4">Add Multiple Questions</h2>
              <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-3 bg-gray-50 relative">
                    {/* Remove button (except first row) */}
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestionField(idx)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}

                    {/* Category */}
                    <div>
                      <label className="block text-sm text-gray-600">Category</label>
                      <select
                        name="ques_category"
                        value={q.ques_category}
                        onChange={(e) => handleQuestionChange(idx, e)}
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
                        name="ques_question_text"
                        value={q.ques_question_text}
                        onChange={(e) => handleQuestionChange(idx, e)}
                        className="w-full border rounded p-2"
                        rows="2"
                        placeholder="Enter the question..."
                        required
                      />
                    </div>

                    {/* Answer type */}
                    <div>
                      <label className="block text-sm text-gray-600">Answer Type</label>
                      <select
                        name="ques_answer_type"
                        value={q.ques_answer_type}
                        onChange={(e) => handleQuestionChange(idx, e)}
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
                  </div>
                ))}

                {/* Add more button */}
                <button
                  type="button"
                  onClick={addQuestionField}
                  className="w-full py-2 mt-2 border rounded bg-gray-100 hover:bg-gray-200"
                >
                  + Add Another Question
                </button>

                {/* Actions */}
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save & Continue
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Assign Bulk Questions */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-green-700 mb-4">
                Assign Questions to Sessions
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Session Numbers</label>
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
                  <label className="block text-sm text-gray-600">Session Types</label>
                  <Select
                    options={sessionTypes}
                    isMulti
                    value={selectedTypes}
                    onChange={setSelectedTypes}
                    placeholder="Select session types..."
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Assign
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
