// src/pages/psychometrician/Questions/Questions.js
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";
import ChangeLogModal from "./ChangeLogModal";
import ViewQuestion from "./ViewQuestion";
import Select from "react-select";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  const fetchCategories = async () => {
  try {
    const res = await api.get("/api/psychometrician/question-categories/");
    setCategories(res.data.map(c => ({ value: c.id, label: c.name })));
    } catch (err) {
      console.error("Failed to load categories:", err.response?.data || err);
    }
  };

  const fetchQuestions = async (categoryId = null) => {
  try {
    setLoading(true);
    let url = "/api/psychometrician/questions/";
    if (categoryId) url += `?category=${categoryId}`;
    const res = await api.get(url);
    setQuestions(res.data);
  } catch (err) {
    console.error("Failed to load questions:", err.response?.data || err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, []);

  useEffect(() => {
  fetchQuestions(selectedCategory?.value || null);
}, [selectedCategory]);

  const filteredQuestions = questions.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.ques_question_text.toLowerCase().includes(query) ||
      q.ques_category?.toLowerCase().includes(query)
    );
  });

  const handleEditClick = (questionId) => {
    setEditingQuestion(questionId);
    setShowEditModal(true);
  };

  const handleViewLogsClick = (questionId) => {
    setSelectedLogId(questionId);
    setShowLogModal(true);
  };
  const handleViewDetailClick = (questionId) => {
    setSelectedQuestionId(questionId);
    setShowViewModal(true);
  };
  const handleToggleActive = async (id, isActive) => {
    const actionText = isActive ? "deactivate" : "activate";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this question?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/psychometrician/questions/${id}/`);
      alert(`Question ${isActive ? "deactivated" : "activated"} successfully.`);
      fetchQuestions(); // Refresh table
    } catch (err) {
      console.error("Failed to toggle question state:", err.response?.data || err);
      alert("Error updating question state.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#292D96] tracking-tight">
          Q&amp;A Library
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          VAWSAFE | Pyschometrician | Role-specific question library
        </p>
      </div>

      {/* Search & Add */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6 items-center">
        <div className="flex items-center col-span-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <Select
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            isClearable
            placeholder="Filter by Category"
          />
        </div>

        <div className="flex justify-end col-span-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
          >
            + Add Question
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-blue-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="border p-3 text-left">Category</th>
              <th className="border p-3 text-left">Question</th>
              <th className="border p-3 text-left">Answer Type</th>
              <th className="border p-3 text-left">Active</th>
              <th className="border p-3 text-center w-40">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <tr
                  key={q.ques_id}
                  className={`hover:bg-blue-50 border-b transition ${
                    !q.ques_is_active ? "opacity-60 bg-gray-100" : "bg-white"
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
                  {/* Action Button */}
                  <td className="border p-3 text-center">
              <div className="grid grid-cols-2 gap-2 justify-items-center">

                <button
                  onClick={() => handleEditClick(q.ques_id)}
                  className="w-28 px-3 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 text-sm font-medium"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleToggleActive(q.ques_id, q.ques_is_active)}
                  className={`w-28 px-3 py-2 rounded-md text-white text-sm font-medium ${
                    q.ques_is_active
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {q.ques_is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => handleViewDetailClick(q.ques_id)}
                  className="w-28 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium">
                  View Detail
                </button>


                <button
                  onClick={() => handleViewLogsClick(q.ques_id)}
                  className="w-28 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                >
                  Logs
                </button>
              </div>
            </td>


                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
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

      {/* Edit Modal */}
      {showEditModal && (
        <EditQuestion
          show={showEditModal}
          questionId={editingQuestion}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => fetchQuestions()}
        />
      )}

      {/* Log Modal (to be built next) */}
      {showLogModal && (
        <ChangeLogModal
          questionId={selectedLogId}
          onClose={() => setShowLogModal(false)}
        />
      )}
      {/* View Detail */}
      {showViewModal && (
      <ViewQuestion
        questionId={selectedQuestionId}
        onClose={() => setShowViewModal(false)}
      />
    )}
    </div>
  );
}
