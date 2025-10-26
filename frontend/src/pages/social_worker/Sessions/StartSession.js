// src/pages/social_worker/Sessions/StartSession.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import NextSessionModal from "./NextSessionModal";
import CaseSessionFollowup from "./CaseSessionFollowup";
import AddCustomQuestions from "./AddCustomQuestions";
import Select from "react-select";

export default function StartSession() {
  const { sess_id } = useParams();
  const navigate = useNavigate();
  const [showNextModal, setShowNextModal] = useState(false);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryServices, setCategoryServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [progress, setProgress] = useState(null);   
  const [role, setRole] = useState("");
  const [isDone, setIsDone] = useState(false);



  useEffect(() => {
    window.scrollTo(0, 0); // always go to the top
  }, []);


// Fetch service categories on load
  useEffect(() => {
    api.get("/api/social_worker/service-categories/")
      .then(res => setServiceCategories(res.data))
      .catch(err => console.error("Failed to fetch service categories", err));
  }, []);

  // Fetch services when category changes
  useEffect(() => {
    if (!selectedCategory) return;
    api.get(`/api/social_worker/services/category/${selectedCategory.value}/`)
      .then(res => setCategoryServices(res.data))
      .catch(err => console.error("Failed to fetch services by category", err));
  }, [selectedCategory]);


  //  Start session & hydrate questions on mount
 useEffect(() => {
  const loadSession = async () => {
    try {
      // First fetch session details
      const detailRes = await api.get(`/api/social_worker/sessions/${sess_id}/`);
      const sess = detailRes.data;

      if (sess.sess_status === "Pending") {
        const response = await api.post(`/api/social_worker/sessions/${sess_id}/start/`);
        setSession(response.data);
        setQuestions(response.data.questions || []);
        setRole(response.data?.my_progress?.official_role || response.data?.my_progress?.role || "");
        setIsDone(response.data?.my_progress?.is_done || false);
      } else if (sess.sess_status === "Ongoing") {
        setQuestions(sess.questions || []);
        setSession(sess);
        setRole(sess?.my_progress?.official_role || sess?.my_progress?.role || "");
        setIsDone(sess?.my_progress?.is_done || false);
      } else {
        alert("This session is already finished.");
        navigate(-1);
      }
    } catch (err) {
      console.error("Failed to load session", err);
      alert("Could not load session.");
    } finally {
      setLoading(false);
    }
  };
  loadSession();
}, [sess_id, navigate]);

  //  Update answer locally
  const handleChange = (sq_id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.sq_id === sq_id ? { ...q, [field]: value } : q))
    );
  };

  //  Finish session
  const handleFinishSession = async () => {
  try {
    const payload = {
      answers: questions.map((q) => ({
        sq_id: q.sq_id,
        value: q.sq_value,
        note: q.sq_note,
      })),
      sess_description: session?.sess_description || "",
      services: selectedServices.map((s) => s.value),
    };
    const response = await api.post(`/api/social_worker/sessions/${sess_id}/finish/`, payload);
    alert("Your part of the session is now marked as completed.");

    // backend returns "all_finished": true/false
    if (response.data.all_finished) {
      setShowFollowupModal(true); // only show when everyone finished
    } else {
      navigate("/social_worker/sessions"); // go back quietly
    }

  } catch (err) {       
    console.error("Failed to finish session", err);
    alert("Failed to finish session.");
  }
};


  if (loading) return <p className="p-6">Loading session...</p>;


  // Group by category and filter questions by role
  const grouped = questions
    .filter(q => {
      // If no category (custom/ad-hoc), allow everyone
      if (!q.question_category) return true;
      // Only include questions that match this official’s role
      return q.question_category.toLowerCase().trim() === role.toLowerCase().trim();
    })
    .reduce((acc, q) => {
      const cat = q.question_category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(q);
      return acc;
    }, {});



  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        Start Session & Answer Questions
      </h2>
      {role && (
        <p className="text-sm text-gray-600 mb-2">
          Showing questions for role: <span className="font-semibold text-green-700">{role}</span>
        </p>
      )}
      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-gray-500">No questions available.</p>
      )}

      {Object.entries(grouped).map(([category, qs]) => (
        <div key={category} className="mb-6">
          {/* Category header */}
          <div className="bg-green-50 border-l-4 border-green-600 px-4 py-2 rounded-t-md">
            <h5 className="text-md font-semibold text-green-800">{category}</h5>
          </div>

          {/* Questions list */}
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

                  {/* Render input by type */}
                  {(q.question_answer_type || q.sq_custom_answer_type) === "Yes/No" && (
                    <select
                      value={q.sq_value || ""}
                      onChange={(e) =>
                        handleChange(q.sq_id, "sq_value", e.target.value)
                      }
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  )}

                 {(q.question_answer_type || q.sq_custom_answer_type) === "Text" && (
                    <>
                      <textarea
                          value={q.sq_value || ""}
                          onChange={(e) => handleChange(q.sq_id, "sq_value", e.target.value)}
                          className="w-full border rounded p-2"
                          rows={3}
                          placeholder="Enter your answer..."
                          disabled={isDone}
                        />

                      {q.answered_by && q.answered_by !== progress.official_id && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Answered by {q.answered_by_name}
                        </p>
                      )}
                    </>
                  )}


                  {(q.question_answer_type || q.sq_custom_answer_type) === "Multiple Choice" && (
                    <input
                      type="text"
                      value={q.sq_value || ""}
                      onChange={(e) =>
                        handleChange(q.sq_id, "sq_value", e.target.value)
                      }
                      className="w-full border rounded p-2"
                      placeholder="Enter selected choice..."
                    />
                  )}
                  

                  {/* Optional note */}
                  <input
                    type="text"
                    value={q.sq_note || ""}
                    onChange={(e) =>
                      handleChange(q.sq_id, "sq_note", e.target.value)
                    }
                    className="w-full border rounded p-2 mt-2"
                    placeholder="Additional notes (if any)..."
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
        {/* CUSTOM QUESTION BUTTON */}
        <div className="flex justify-end">
              <button onClick={() => setShowAddCustomModal(true)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Add Custom Question
              </button>
            </div>

            {/* SERVICE */}
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Services Provided
          </h2>

          <div className="p-4 bg-gray-50 border rounded-md shadow-sm mb-6 space-y-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Service Category 
              </label>
              <Select
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setSelectedServices([]); // reset services when category changes
                }}
                options={serviceCategories.map(c => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder="Choose category..."
              />
            </div>

            {/* Services Dropdown */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Organization(s)
                </label>
                <Select
                  isMulti
                  value={selectedServices}
                  onChange={(val) => setSelectedServices(val)}
                  options={categoryServices.map(s => ({
                    value: s.serv_id,
                    label: `${s.name} – ${s.contact_person} (${s.contact_number})`,
                  }))}
                  placeholder="Select organizations under this category..."
                />
              </div>
            )}
          </div>


          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Session Feedback
          </h2>   
          {/* Session Feedback / Description */}
          <div className="p-4 bg-gray-50 border rounded-md shadow-sm mb-6">
            <textarea value={session?.sess_description || ""}
              onChange={(e) => setSession((prev) => ({ ...prev, sess_description: e.target.value }))}
              className="w-full border rounded-md p-3 text-sm text-gray-800"
              rows={4}
              placeholder="Write your feedback about this session (e.g. progress, issues, observations)..."/>
          </div>

      {/* Actions */}
      {questions.length > 0 && (
        <div className="flex justify-end gap-4 mt-6">
          {!isDone && (
          <button
            onClick={handleFinishSession}
            className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            Finish Session
          </button>
        )}
        {isDone && (
          <p className="text-gray-600 italic mt-2 text-sm">
            You’ve already completed your part of this session.
          </p>
        )}
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      )}

      {/*  Modal for scheduling next session */}
      <NextSessionModal
        show={showNextModal}
        onClose={(success) => {
          setShowNextModal(false);
          if (success) navigate("/social_worker/sessions");
        }}
        session={session}
      />
      <CaseSessionFollowup
        show={showFollowupModal}
        onClose={(success) => {
          setShowFollowupModal(false);
          if (success) navigate("/social_worker/sessions");
        }}
        session={session}
      />
      {/* Modal for Custom Questions */}
    <AddCustomQuestions
        show={showAddCustomModal}
        onClose={() => setShowAddCustomModal(false)}
        sessionId={sess_id}
        onAdded={(newQ) => setQuestions((prev) => [...prev, newQ])}
      />

    </div>
  );
}
