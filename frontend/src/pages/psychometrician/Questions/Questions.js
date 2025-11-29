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
  const [requiredFilter, setRequiredFilter] = useState(null);
  const [sessionFilter, setSessionFilter] = useState(null);

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

 const filteredQuestions = questions
  .filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.ques_question_text.toLowerCase().includes(query) ||
      (q.category_name || "").toLowerCase().includes(query)
    );
  })
  .filter((q) => {
    if (!requiredFilter || requiredFilter === "all") return true;
    if (requiredFilter === "required") return q.ques_is_required === true;
    if (requiredFilter === "not_required") return q.ques_is_required === false;
    return true;
  })
  .filter((q) => {
    if (!sessionFilter) return true;
    const sessionNumbers = q.mappings?.map((m) => m.session_number) || [];
    if (sessionFilter === "4plus") return sessionNumbers.some((n) => n >= 4);
    return sessionNumbers.includes(sessionFilter);
  })
  
  .sort((a, b) => b.ques_id - a.ques_id);


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
  <div className="w-full px-6">

    {/* ================= PAGE HEADER ================= */}
      <div className="mt-4 mb-4">
        <h1 className="text-2xl font-semibold text-[#292D96]">
          Q&A Library
        </h1>
        <p className="text-sm text-gray-600">
          VAWSAFE | Psychometrician | Question Management
        </p>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap items-center gap-3 mb-4">

        {/* Search */}
        <div className="flex items-center w-full md:w-1/3 border border-gray-300 rounded-md px-3 py-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-gray-800 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-1/4">
          <Select
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            isClearable
            placeholder="Filter by Category"
            menuPortalTarget={null}
            menuPosition="absolute"
            menuPlacement="auto"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999, width: "100%" }),
              container: (base) => ({ ...base, width: "100%" }),
            }}
          />

        </div>

        {/* Required Filter */}
        <div className="w-full md:w-1/4">
          <Select
          options={[
            { value: "required", label: "Required Only" },
            { value: "not_required", label: "Not Required Only" },
            { value: "all", label: "All" },
          ]}
          value={
              requiredFilter
                ? {
                    value: requiredFilter,
                    label:
                      requiredFilter === "required"
                        ? "Required Only"
                        : requiredFilter === "not_required"
                        ? "Not Required Only"
                        : "All",
                  }
                : null
            }
          onChange={(opt) => setRequiredFilter(opt?.value || null)}
          isClearable
          placeholder="Filter by Required"
          menuPortalTarget={null}
          menuPosition="absolute"
          menuPlacement="auto"
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            menu: (base) => ({ ...base, zIndex: 9999, width: "100%" }),
            container: (base) => ({ ...base, width: "100%" }),
          }}
        />
        </div>

        {/* Session Number Filter */}
        <div className="w-full md:w-1/4">
          <Select
            options={[
              { value: 1, label: "Session 1" },
              { value: 2, label: "Session 2" },
              { value: 3, label: "Session 3" },
              { value: "4plus", label: "Session 4+" },
            ]}
           value={
              sessionFilter
                ? {
                    value: sessionFilter,
                    label:
                      sessionFilter === "4plus"
                        ? "Session 4+"
                        : `Session ${sessionFilter}`,
                  }
                : null
            }
            onChange={(opt) => setSessionFilter(opt?.value || null)}
            isClearable
            placeholder="Filter by Session"
            menuPortalTarget={null}
            menuPosition="absolute"
            menuPlacement="auto"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999, width: "100%" }),
              container: (base) => ({ ...base, width: "100%" }),
            }}
          />

        </div>

        {/* Add Question Button */}
        <div className="w-full md:w-auto ml-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700"
          >
            + Add Question
          </button>
        </div>

      </div>


      {/* Table */}
      <div className="mt-6 bg-white rounded-xl shadow-md border border-neutral-200">
        <div className="overflow-x-auto rounded-xl">

      <table className="min-w-full text-sm text-left">
        <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 text-sm font-semibold">

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
                  <td className="border px-4 py-3">
                    {q.category_name || "Uncategorized"}
                  </td>
                  <td className="border px-4 py-3">{q.ques_question_text}</td>
                  <td className="border px-4 py-3">{q.ques_answer_type}</td>
                  <td className="border px-4 py-3">
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
