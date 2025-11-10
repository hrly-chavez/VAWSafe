// src/pages/social_worker/Sessions/MoreSessions/StartMoreSession.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";

const StartMoreSession = () => {
  const { sess_id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryServices, setCategoryServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  // Fetch session data and service categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessRes, catRes] = await Promise.all([
          api.get(`/api/social_worker/sessions/${sess_id}/`),
          api.get(`/api/social_worker/service-categories/`),
        ]);
        setSession(sessRes.data);
        setQuestions(sessRes.data.questions || []);
        setFeedback(sessRes.data.sess_description || "");
        setServiceCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load session data", err);
        setError("Failed to load session information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sess_id]);

  // Fetch services under a selected category
  useEffect(() => {
    if (!selectedCategory) return;
    const fetchServices = async () => {
      try {
        const res = await api.get(
          `/api/social_worker/services/category/${selectedCategory.value}/`
        );
        setCategoryServices(res.data);
      } catch (err) {
        console.error("Failed to load services by category", err);
      }
    };
    fetchServices();
  }, [selectedCategory]);

  const handleAnswerChange = (sq_id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.sq_id === sq_id ? { ...q, [field]: value } : q))
    );
  };

  const handleFinishSession = async () => {
    setFinishing(true);
    try {
      const answersPayload = questions
        .filter((q) => q.assigned_role && q.sq_value !== undefined)
        .map((q) => ({
          sq_id: q.sq_id,
          value: q.sq_value,
          note: q.sq_note,
        }));

      const payload = {
        answers: answersPayload,
        sess_description: feedback,
        services: selectedServices.map((s) => s.value),
      };

      await api.post(`/api/social_worker/sessions/${sess_id}/finish/`, payload);
      alert("Session completed successfully!");

      // Redirect back to the victim's detail page
      if (session?.incident?.vic_id?.vic_id) {
        navigate(`/social_worker/victims/${session.incident.vic_id.vic_id}`);
      } else {
        navigate("/social_worker/victims");
      }
    } catch (err) {
      console.error("Failed to finish session", err);
      alert("Failed to finish session. Please try again.");
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading session...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!session) return <p className="p-6">No session found.</p>;

  // Group questions by category
  const grouped = questions.reduce((acc, q) => {
    const cat = q.question_category_name || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
      <h2 className="text-2xl font-bold text-green-700 border-b pb-2">
        Start Session – Role-Based Questions
      </h2>

      {/* Questions */}
      {Object.entries(grouped).map(([category, qs]) => (
        <div key={category} className="mb-6">
          <div className="bg-green-50 border-l-4 border-green-600 px-4 py-2 rounded-t-md">
            <h5 className="text-md font-semibold text-green-800">{category}</h5>
          </div>
          <div className="border border-t-0 rounded-b-md p-3 bg-white shadow-sm">
            <AnimatePresence>
              {qs.map((q, index) => (
                <motion.div
                  key={q.sq_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-3 border rounded mb-3 bg-gray-50"
                >
                  <p className="font-medium text-gray-800 mb-2">
                    {q.question_text || q.sq_custom_text}
                  </p>

                  {(q.question_answer_type || q.sq_custom_answer_type) === "Yes/No" && (
                    <select
                      value={q.sq_value || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.sq_id, "sq_value", e.target.value)
                      }
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  )}

                  {(q.question_answer_type || q.sq_custom_answer_type) === "Text" && (
                    <textarea
                      value={q.sq_value || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.sq_id, "sq_value", e.target.value)
                      }
                      className="w-full border rounded p-2"
                      rows={3}
                      placeholder="Enter your answer..."
                    />
                  )}

                  {/* Show notes only if the question type is not Text */}
                  {(q.question_answer_type || q.sq_custom_answer_type) !== "Text" && (
                    <input
                      type="text"
                      value={q.sq_note || ""}
                      onChange={(e) =>
                        handleAnswerChange(q.sq_id, "sq_note", e.target.value)
                      }
                      className="w-full border rounded p-2 mt-2"
                      placeholder="Additional notes (if any)..."
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}

      


      {/* Feedback */}
      <div className="p-4 bg-gray-50 border rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-green-800">Session Feedback</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border rounded-md p-3 text-sm text-gray-800"
          rows={4}
          placeholder="Write your feedback about this session..."
        />
      </div>

      {/* Finish Button */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Back
        </button>
        <button
          onClick={handleFinishSession}
          disabled={finishing}
          className={`px-6 py-2 rounded-md font-semibold text-white flex items-center justify-center gap-2 transition ${
            finishing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {finishing && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {finishing ? "Finishing..." : "Finish Session"}
        </button>
      </div>
    </div>
  );
};

export default StartMoreSession;
