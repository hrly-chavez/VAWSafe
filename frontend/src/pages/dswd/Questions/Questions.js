// src/pages/dswd/Questions/Questions.js
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import AddQuestion from "./AddQuestion";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/dswd/questions/");
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700">
          Questions Management
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          + Add Question
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow border rounded-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="border p-3 text-left">ID</th>
              <th className="border p-3 text-left">Category</th>
              <th className="border p-3 text-left">Question</th>
              <th className="border p-3 text-left">Answer Type</th>
              <th className="border p-3 text-left">Assigned To</th>
              <th className="border p-3 text-left">Created By</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : questions.length > 0 ? (
              questions.map((q) => (
                <tr key={q.ques_id} className="hover:bg-gray-50">
                  <td className="border p-3">{q.ques_id}</td>
                  <td className="border p-3">{q.ques_category}</td>
                  <td className="border p-3">{q.ques_question_text}</td>
                  <td className="border p-3">{q.ques_answer_type}</td>
                  <td className="border p-3">
                    {q.mappings && q.mappings.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-700">
                        {q.mappings.map((m, idx) => (
                          <li key={idx}>
                            Session {m.session_number} – {m.session_type}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="border p-3">{q.created_by_name || "—"}</td>
                  <td className="border p-3 text-center">
                    <button className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 mr-2">
                      Edit
                    </button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 p-4 italic">
                  No questions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Question Modal */}
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
