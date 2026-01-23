// src/pages/social_worker/Questions/Questions.js
import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
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
  const [yearFilter, setYearFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Generate year options dynamically (future-proof)
  const generateYearOptions = (startYear = 2022) => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let y = currentYear + 1; y >= startYear; y--) {
      years.push({ value: y, label: String(y) });
    }

    return years;
  };


  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/social_worker/question-categories/");
      setCategories(res.data.map(c => ({ value: c.id, label: c.name })));
    } catch (err) {
      console.error("Failed to load categories:", err.response?.data || err);
    }
  };

  const fetchQuestions = async (categoryId = null, year = null) => {
    try {
      setLoading(true);
      let params = [];

      if (categoryId) params.push(`category=${categoryId}`);
      if (year) params.push(`year=${year}`);

      const url =
        "/api/social_worker/questions/" +
        (params.length ? `?${params.join("&")}` : "");

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
    fetchQuestions(
      selectedCategory?.value || null,
      yearFilter
    );
  }, [selectedCategory, yearFilter]);


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

  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);



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
      await api.delete(`/api/social_worker/questions/${id}/`);
      alert(`Question ${isActive ? "deactivated" : "activated"} successfully.`);
      fetchQuestions(); // Refresh table
    } catch (err) {
      console.error("Failed to toggle question state:", err.response?.data || err);
      alert("Error updating question state.");
    }
  };

  return (
    <div className="w-full px-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Q&A Library</h1>
        <p className="text-gray-500 mt-1">
          VAWSAFE | Social Worker | Question Management
        </p>
      </header>

      {/* ================= FILTERS ================= */}
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        {/* Search Bar */}
        <div className="flex items-center w-full md:w-1/3 border border-neutral-300 rounded-lg px-3 py-2 bg-white shadow-sm">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-neutral-900 outline-none"
          />
        </div>

        {/* Filters aligned right */}
        <div className="flex flex-row flex-wrap md:flex-nowrap items-end gap-6 w-full md:w-auto">

          {/* Category Filter */}
          <div className="flex flex-col text-sm w-full md:w-40">
            <label className="text-gray-600 mb-1">Category</label>
            <Select
              options={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              isClearable
              placeholder="All"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
              }}
            />
          </div>

          {/* Required Filter */}
          <div className="flex flex-col text-sm w-full md:w-40">
            <label className="text-gray-600 mb-1">Required</label>
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
              placeholder="All"
              menuPortalTarget={document.body}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          {/* Session Filter */}
          <div className="flex flex-col text-sm w-full md:w-40">
            <label className="text-gray-600 mb-1">Session</label>
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
              placeholder="All"
              menuPortalTarget={document.body}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          {/* FILTER BY YEAR */}
          <div className="flex flex-col text-sm w-full md:w-32">
            <label className="text-gray-600 mb-1">Year</label>
            <Select
              options={generateYearOptions(2022)}
              value={
                yearFilter
                  ? { value: yearFilter, label: String(yearFilter) }
                  : null
              }
              onChange={(opt) => setYearFilter(opt?.value || null)}
              isClearable
              placeholder="All"
              menuPortalTarget={document.body}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />

          </div>


          {/* Add Question Button */}
          <div className="w-full md:w-auto ml-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#292D96] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
            >
              + Add Question
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
        <div className="rounded-xl">
          <table className="min-w-full table-fixed border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 font-semibold shadow">
              <tr>
                <th className="w-40 px-3 py-2 text-left border">Category</th>
                <th className="px-3 py-2 text-left border">Question</th>
                <th className="w-32 px-3 py-2 text-left border">Answer Type</th>
                <th className="w-20 px-3 py-2 text-left border">Active</th>
                <th className="w-40 px-3 py-2 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-neutral-500">
                    Loading…
                  </td>
                </tr>
              ) : currentQuestions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-neutral-500 italic">
                    No questions found.
                  </td>
                </tr>
              ) : (
                currentQuestions.map((q, index) => {
                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";
                  return (
                    <tr
                      key={q.ques_id}
                      className={`${rowBg} hover:bg-blue-50 transition`}
                    >
                      <td className="px-3 py-2 border">{q.category_name || "Uncategorized"}</td>
                      <td className="px-3 py-2 border whitespace-normal break-words">
                        {q.ques_question_text}
                      </td>
                      <td className="px-3 py-2 border">{q.ques_answer_type}</td>
                      <td className="px-3 py-2 border">{q.ques_is_active ? "Yes" : "No"}</td>
                      <td className="px-3 py-2 border text-center">

                        {/* Action Button */}
                        <div className="flex justify-center gap-3">
                          {/* Edit */}
                          <button
                            onClick={() => handleEditClick(q.ques_id)}
                            className="text-[#f1c40f] hover:text-[#caa40d]"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            onClick={() => handleToggleActive(q.ques_id, q.ques_is_active)}
                            className={`${q.ques_is_active
                              ? "text-[#e74c3c] hover:text-[#b33a2d]" // deactivate (red)
                              : "text-green-500 hover:text-green-700" // activate (green)
                              }`}
                            title={q.ques_is_active ? "Deactivate" : "Restore"}
                          >
                            {q.ques_is_active ? (
                              <TrashIcon className="h-5 w-5" />   // show trash when active
                            ) : (
                              <ArrowPathIcon className="h-5 w-5" />   // show restore when inactive
                            )}
                          </button>

                          {/* View Detail */}
                          <button
                            onClick={() => handleViewDetailClick(q.ques_id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View Detail"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          {/* Logs */}
                          <button
                            onClick={() => handleViewLogsClick(q.ques_id)}
                            className="text-gray-600 hover:text-gray-800"
                            title="Logs"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Summary + Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filteredQuestions.length)} of{" "}
            {filteredQuestions.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded ${currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#292D96] text-white hover:bg-blue-700"
                }`}
            >
              &laquo;
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2 py-1 rounded ${currentPage === i + 1
                    ? "bg-[#292D96] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded ${currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#292D96] text-white hover:bg-blue-700"
                }`}
            >
              &raquo;
            </button>
          </div>
        </div>
      )}

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
