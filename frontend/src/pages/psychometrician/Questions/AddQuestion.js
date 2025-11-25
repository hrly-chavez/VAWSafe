// src/pages/psychometrician/Questions/AddQuestion.js
import { useState, useEffect } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios";

export default function AddQuestion({ onClose }) {
  const [step, setStep] = useState(1);

  // Step 1: category
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Step 2: questions
  const [questions, setQuestions] = useState([
    {
      ques_question_text: "",
      ques_answer_type: "",
      ques_is_required: true,   
      ques_is_active: true,
    },
  ]);

  const [answerTypes, setAnswerTypes] = useState([]);

  // Step 3: session assignment
  const [sessionNumbers, setSessionNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Load category + answer type
  useEffect(() => {
    api.get("/api/psychometrician/questions/choices/").then((res) => {
      setCategories(res.data.categories);
      setAnswerTypes(res.data.answer_types);
    });
  }, []);

  // ========= NEW SESSION NUMBER LOGIC =========
  // Load session numbers + session types when step === 3
  useEffect(() => {
    if (step === 3) {
      // Only show 1, 2, 3, and 4+ (auto expands to 4..15)
      const nums = [
        { value: 1, label: "Session 1" },
        { value: 2, label: "Session 2" },
        { value: 3, label: "Session 3" },
        { value: "4+", label: "Session 4+" }, // special option
      ];
      setSessionNumbers(nums);

      // Load session types
      api.get("/api/psychometrician/session-types/").then((res) => {
      const forbiddenForPsychometrician = [
      "Termination / Discharge Planning",
      "Legal Assistance Session",
      "Intervention Planning / Case Conference",
      "Case Study / Psychosocial Assessment",
      "Family Counseling / Reintegration",
      ];

      const filtered = res.data
        .filter((t) => !forbiddenForPsychometrician.includes(t.name))
        .map((t) => ({
          value: t.id,
          label: t.name,
        }));

      setSessionTypes(filtered);
    });

    }
  }, [step]);

  // Helper: expand "4+" into integers [4..15]
  const expandSessionNumbers = (selectedNumbers) => {
    const OUT = new Set();

    (selectedNumbers || []).forEach((n) => {
      const sessionValue = typeof n === "object" ? n.value : n;

      if (sessionValue === "4+") {
        for (let i = 4; i <= 15; i++) OUT.add(i);
      } else {
        const iv = Number(sessionValue);
        if (!isNaN(iv)) OUT.add(iv);
      }
    });

    return Array.from(OUT).sort((a, b) => a - b);
  };

  // Handle question change
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  // Add/Remove question field
  const addQuestionField = () => {
   setQuestions([
      ...questions,
      {
        ques_question_text: "",
        ques_answer_type: "",
        ques_is_required: true,   // NEW
        ques_is_active: true
      }
    ]);
  };

  const removeQuestionField = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Step 1 → Step 2
  const handleCategoryContinue = () => {
    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }
    setStep(2);
  };

  // Step 2 → Step 3
  const handleQuestionsContinue = () => {
    if (questions.some((q) => !q.ques_question_text || !q.ques_answer_type)) {
      alert("Please fill in all question fields.");
      return;
    }
    setStep(3);
  };

  // Step 3: bulk create + assign
  const handleBulkSubmit = async () => {
    if (!selectedNumbers.length || !selectedTypes.length) {
      alert("Please select session numbers and session types.");
      return;
    }

    try {
      // Expand "4+" into [4..15]
      const finalSessionNumbers = expandSessionNumbers(selectedNumbers);

      const payload = {
        category_id: selectedCategory.value,
        questions: questions.map((q) => ({
          ques_question_text: q.ques_question_text,
          ques_answer_type: q.ques_answer_type,
          ques_is_required: q.ques_is_required,
        })),
        session_numbers: finalSessionNumbers, // <= already unrolled
        session_types: selectedTypes.map((t) => t.value),
      };

      await api.post("/api/psychometrician/questions/bulk-create/", payload);
      alert("Questions created and assigned successfully!");
      onClose();
    } catch (err) {
      console.error("Bulk creation failed:", err.response?.data || err);
      alert("Error creating and assigning questions.");
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <AnimatePresence mode="wait">
          {/* STEP 1 - Select Category */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                Choose Category
              </h2>

              <div className="space-y-4">
                <label className="block text-sm text-gray-600">Category</label>
                <Select
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Select category..."
                />

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCategoryContinue}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2 - Add Multiple Questions */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold text-blue-700 mb-2">
                Add Questions
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Category: <strong>{selectedCategory?.label}</strong>
              </p>

              <form className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="border p-3 rounded bg-gray-50 relative"
                  >
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestionField(idx)}
                        className="absolute top-1 right-2 text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    )}

                    <label className="block text-sm text-gray-600 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={q.ques_question_text}
                      onChange={(e) =>
                        handleQuestionChange(idx, "ques_question_text", e.target.value)
                      }
                      className="w-full border rounded p-2 mb-2"
                      rows="2"
                      required
                    />

                    <label className="block text-sm text-gray-600 mb-1">
                      Answer Type
                    </label>
                    <select
                      value={q.ques_answer_type}
                      onChange={(e) =>
                        handleQuestionChange(idx, "ques_answer_type", e.target.value)
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
                    
                    <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={q.ques_is_required}
                      onChange={(e) =>
                        handleQuestionChange(idx, "ques_is_required", e.target.checked)
                      }
                    />
                    <label className="text-sm text-gray-700">
                      Required Question?
                    </label>
                  </div>
                  </div>
                ))}
              </form>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={addQuestionField}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Add Another Question
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleQuestionsContinue}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 - Assign Sessions */}
          {step === 3 && (
            <motion.div
              key="step3"
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
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleBulkSubmit}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save All
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
