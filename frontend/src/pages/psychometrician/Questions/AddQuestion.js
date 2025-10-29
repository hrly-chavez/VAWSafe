// src/pages/psychometrician/Questions/AddQuestion.js
import { useState, useEffect } from "react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios";

export default function AddQuestion({ onClose }) {
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState([
    { ques_category: "", ques_question_text: "", ques_answer_type: "", ques_is_active: true },
  ]);

  const [categories, setCategories] = useState([]);
  const [answerTypes, setAnswerTypes] = useState([]);
  const [createdQuestions, setCreatedQuestions] = useState([]);

  const [sessionNumbers, setSessionNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Load categories & answer types
  useEffect(() => {
    api.get("/api/psychometrician/questions/choices/").then((res) => {
      setCategories(res.data.categories);
      setAnswerTypes(res.data.answer_types);
    });
  }, []);

  // Load session types
  useEffect(() => {
    if (step === 2) {
      const nums = Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: `Session ${i + 1}`,
      }));
      setSessionNumbers(nums);

      api.get("/api/psychometrician/session-types/").then((res) =>
        setSessionTypes(res.data.map((t) => ({ value: t.id, label: t.name })))
      );
    }
  }, [step]);

  // Handle input change
  const handleQuestionChange = (index, e) => {
    const newQuestions = [...questions];
    newQuestions[index][e.target.name] = e.target.value;
    setQuestions(newQuestions);
  };

  const addQuestionField = () => {
    setQuestions([
      ...questions,
      { ques_category: "", ques_question_text: "", ques_answer_type: "", ques_is_active: true },
    ]);
  };

  const removeQuestionField = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Submit questions
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/psychometrician/questions/", questions[0]); // single add for now
      setCreatedQuestions([res.data]);
      setStep(2);
    } catch (err) {
      console.error("Error creating question:", err.response?.data || err);
      alert("Error creating question");
    }
  };

  // Assign sessions
  const handleAssign = async () => {
    try {
      await api.post("/api/psychometrician/session-type-questions/", {
        session_number: selectedNumbers[0]?.value,
        session_type: selectedTypes[0]?.value,
        question: createdQuestions[0]?.ques_id,
      });
      alert("Question assigned successfully!");
      onClose();
    } catch (err) {
      console.error("Error assigning question:", err.response?.data || err);
      alert("Error assigning question");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                Add Question
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Category</label>
                  <select
                    name="ques_category"
                    value={questions[0].ques_category}
                    onChange={(e) => handleQuestionChange(0, e)}
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

                <div>
                  <label className="block text-sm text-gray-600">Question Text</label>
                  <textarea
                    name="ques_question_text"
                    value={questions[0].ques_question_text}
                    onChange={(e) => handleQuestionChange(0, e)}
                    className="w-full border rounded p-2"
                    rows="2"
                    placeholder="Enter question text..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Answer Type</label>
                  <select
                    name="ques_answer_type"
                    value={questions[0].ques_answer_type}
                    onChange={(e) => handleQuestionChange(0, e)}
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save & Continue
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-green-700 mb-4">
                Assign Question
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    Session Number
                  </label>
                  <Select
                    options={sessionNumbers}
                    value={selectedNumbers}
                    onChange={(val) => setSelectedNumbers([val])}
                    placeholder="Select session number..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">
                    Session Type
                  </label>
                  <Select
                    options={sessionTypes}
                    value={selectedTypes}
                    onChange={(val) => setSelectedTypes([val])}
                    placeholder="Select session type..."
                  />
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
