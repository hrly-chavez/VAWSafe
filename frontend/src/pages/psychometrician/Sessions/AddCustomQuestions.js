// src/pages/social_worker/Sessions/AddCustomQuestions.js
import React, { useState } from "react";
import api from "../../../api/axios";

export default function AddCustomQuestions({ show, onClose, sessionId, onAdded }) {
  const [questions, setQuestions] = useState([{ text: "", type: "Text" }]);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addNewField = () => {
    setQuestions([...questions, { text: "", type: "Text" }]);
  };

  const removeField = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const payload = {
      questions: questions
        .filter((q) => q.text.trim())
        .map((q) => ({
          sq_custom_text: q.text,
          sq_custom_answer_type: q.type,
        })),
    };

    if (payload.questions.length === 0) {
      alert("Please add at least one valid question.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        `/api/psychometrician/sessions/${sessionId}/add-custom-question/`,
        payload
      );

      if (onAdded) {
        // Backend returns an array of created questions
        res.data.forEach((q) => onAdded(q));
      }
      onClose();
      setQuestions([{ text: "", type: "Text" }]); // reset
    } catch (err) {
      console.error("Failed to add custom questions:", err);
      alert("Could not add custom questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-xl font-bold text-[#292D96] mb-4">
          Add Custom Questions
        </h2>

        {/* Dynamic Question Fields */}
        {questions.map((q, index) => (
          <div
            key={index}
            className="mb-4 border p-3 rounded-md bg-gray-50 relative"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question {index + 1}
            </label>
            <textarea
              value={q.text}
              onChange={(e) => handleChange(index, "text", e.target.value)}
              className="w-full border rounded-md p-2 text-sm mb-2"
              rows={2}
              placeholder="Enter your custom question..."
            />

            <select
              value={q.type}
              onChange={(e) => handleChange(index, "type", e.target.value)}
              className="w-full border rounded-md p-2 mb-2"
            >
              <option value="Text">Text</option>
              <option value="Yes/No">Yes/No</option>
              <option value="Multiple Choice">Multiple Choice</option>
            </select>

            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeField(index)}
                className="absolute top-2 right-2 text-red-600 text-sm hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {/* Add new field button */}
        <button
          onClick={addNewField}
          type="button"
          className="mb-6 px-3 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300"
        >
          + Add Another Question
        </button>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Questions"}
          </button>
        </div>
      </div>
    </div>
  );
}
