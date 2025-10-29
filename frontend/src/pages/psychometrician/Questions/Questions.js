// src/pages/psychometrician/Questions/Questions.js
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";
import AddQuestion from "./AddQuestion";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/psychometrician/questions/");
      setQuestions(res.data);
    } catch (err) {
      console.error("Failed to load questions:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.ques_question_text.toLowerCase().includes(query) ||
      q.ques_category?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#292D96] tracking-tight">
          Q&amp;A Library
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          VAWSAFE | Psychometrician | Role-specific question library
        </p>
      </div>

      {/* Search & Add */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 items-center">
        <div className="flex items-center col-span-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search questions by text or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
          >
            + Add Question
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow border rounded-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="border p-3 text-left">Category</th>
              <th className="border p-3 text-left">Question</th>
              <th className="border p-3 text-left">Answer Type</th>
              <th className="border p-3 text-left">Active</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <tr
                  key={q.ques_id}
                  className={`hover:bg-gray-50 ${
                    !q.ques_is_active ? "opacity-60 bg-gray-100" : ""
                  }`}
                >
                  <td className="border p-3">
                    {q.category_name || "Uncategorized"}
                  </td>
                  <td className="border p-3">{q.ques_question_text}</td>
                  <td className="border p-3">{q.ques_answer_type}</td>
                  <td className="border p-3">
                    {q.ques_is_active ? "Yes" : "No"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="text-center text-gray-500 p-4 italic"
                >
                  No questions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddQuestion
          onClose={() => {
            setShowAddModal(false);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}
