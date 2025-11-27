// src/pages/social_worker/Questions/Questions.js
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";
import ChangeLogModal from "./ChangeLogModal";
import Select from "react-select";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [categories, setCategories] = useState([]);

  // NEW → Required filter state
  const [requiredFilter, setRequiredFilter] = useState("all");

  useEffect(() => {
    api.get("/api/social_worker/question-categories/").then((res) => {
      setCategories(
        res.data.map((cat) => ({ value: cat.id, label: cat.name }))
      );
    });

    loadQuestions();
  }, []);

  const loadQuestions = () => {
    api.get("/api/social_worker/questions/").then((res) => {
      setQuestions(res.data);
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to toggle this question’s active status?"))
      return;

    try {
      await api.delete(`/api/social_worker/questions/${id}/`);
      loadQuestions();
    } catch (err) {
      console.error("Failed to toggle question:", err);
    }
  };

  // =============================
  // FILTERED QUESTIONS (updated)
  // =============================
  const filteredQuestions = questions
    .filter((q) => {
      const query = searchQuery.toLowerCase();
      return (
        q.ques_question_text.toLowerCase().includes(query) ||
        q.category_name?.toLowerCase().includes(query)
      );
    })
    .filter((q) => {
      if (requiredFilter === "required") return q.ques_is_required === true;
      if (requiredFilter === "optional") return q.ques_is_required === false;
      return true;
    });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-green-700 mb-6">Questions</h2>

      {/* FILTERS */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* Search */}
        <div className="col-span-4 flex items-center border rounded px-3 bg-white">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            className="ml-2 w-full outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Dropdown */}
        <div className="col-span-3">
          <Select
            options={[{ value: "", label: "All Categories" }, ...categories]}
            onChange={(opt) => {
              if (!opt.value) loadQuestions();
              else {
                api
                  .get(`/api/social_worker/questions/?category=${opt.value}`)
                  .then((res) => setQuestions(res.data));
              }
            }}
            placeholder="Filter by Category"
          />
        </div>

        {/* NEW → Required Filter Dropdown */}
        <div className="col-span-3">
          <Select
            options={[
              { value: "all", label: "All Questions" },
              { value: "required", label: "Required Only" },
              { value: "optional", label: "Optional Only" },
            ]}
            value={{
              value: requiredFilter,
              label:
                requiredFilter === "all"
                  ? "All Questions"
                  : requiredFilter === "required"
                  ? "Required Only"
                  : "Optional Only",
            }}
            onChange={(opt) => setRequiredFilter(opt.value)}
            placeholder="Filter by Required"
          />
        </div>

        {/* Add Question Button */}
        <div className="col-span-2 flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            Add Question
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full">
          <thead className="bg-green-100">
            <tr>
              <th className="border p-3 text-left">Category</th>
              <th className="border p-3 text-left">Question</th>
              <th className="border p-3 text-left">Answer Type</th>

              {/* NEW → Required Column */}
              <th className="border p-3 text-left">Required</th>

              <th className="border p-3 text-left">Active</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.ques_id}>
                <td className="border p-3">{q.category_name || "—"}</td>
                <td className="border p-3">{q.ques_question_text}</td>
                <td className="border p-3">{q.ques_answer_type}</td>

                {/* NEW → Required Cell */}
                <td className="border p-3">
                  {q.ques_is_required ? (
                    <span className="text-red-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-gray-600">No</span>
                  )}
                </td>

                <td className="border p-3">
                  {q.ques_is_active ? "Yes" : "No"}
                </td>

                <td className="border p-3 text-center">
                  <button
                    className="text-blue-600 hover:underline mr-3"
                    onClick={() => {
                      setSelectedQuestionId(q.ques_id);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="text-yellow-600 hover:underline mr-3"
                    onClick={() => {
                      setSelectedQuestionId(q.ques_id);
                      setShowLogModal(true);
                    }}
                  >
                    Logs
                  </button>

                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(q.ques_id)}
                  >
                    {q.ques_is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {filteredQuestions.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-6 text-gray-500 italic"
                >
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddQuestion
          onClose={() => {
            setShowAddModal(false);
            loadQuestions();
          }}
        />
      )}

      {showEditModal && (
        <EditQuestion
          questionId={selectedQuestionId}
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            loadQuestions();
          }}
          onUpdated={loadQuestions}
        />
      )}

      {showLogModal && (
        <ChangeLogModal
          questionId={selectedQuestionId}
          show={showLogModal}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}
