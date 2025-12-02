// src/pages/psychometrician/Sessions/MoreSessions/CreateSession.js
// Creating Session 2+

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import Select from "react-select";
import PreviewMappedQuestions from "./PreviewMappedQuestions";

const CreateSession = () => {
  const { incident_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false); 
  const forbiddenForPsychometrician = [
  "Termination / Discharge Planning",
  "Legal Assistance Session",
  "Intervention Planning / Case Conference",
  "Case Study / Psychosocial Assessment",
  "Family Counseling / Reintegration",
  "Case Closure",

  ];

  // Load top summary & session types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, typeRes] = await Promise.all([
          api.get(`/api/psychometrician/incident/${incident_id}/summary/`),
          api.get(`/api/psychometrician/session-types/`),
        ]);

        setSummary(summaryRes.data);
        setSessionTypes(
        typeRes.data
          .filter((t) => !forbiddenForPsychometrician.includes(t.name))
          .map((t) => ({
            value: t.id,
            label: t.name,
          }))
      );

      } catch (err) {
        console.error("Failed to load data", err);
        setError("Failed to load incident or session types.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [incident_id]);

  // When session type changes → load mapped questions
  useEffect(() => {
    if (!selectedType || !summary) return;

    const loadQuestions = async () => {
      try {
        setFetchingQuestions(true);
        const url = `/api/psychometrician/mapped-questions/?session_num=${summary.next_session_number}&session_types=${selectedType.value}&role_filter=1`;
        const res = await api.get(url);
        setQuestions(res.data || []);
      } catch (err) {
        console.error("Failed to fetch mapped questions", err);
        setQuestions([]);
      } finally {
        setFetchingQuestions(false);
      }
    };

    loadQuestions();
  }, [selectedType, summary]);

  if (loading) return <p className="p-6 text-gray-600">Loading session form...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!summary) return <p className="p-6">No incident found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8">
      <h2 className="text-2xl font-bold text-blue-800 border-b pb-2">
        Psychometrician – Create New Session
      </h2>

      {/* Info Section */}
      <section className="bg-gray-50 p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg mb-3 text-gray-800">
          Session Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard label="Case Number" value={summary.incident_num || "—"} />
          <InfoCard label="Victim Name" value={summary.victim_name || "—"} />
          <InfoCard label="Next Session Number" value={summary.next_session_number || "—"} />
          
        </div>
      </section>

      {/* Session Type Selection */}
      <section className="bg-gray-50 p-4 rounded-lg border shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Session Type
        </label>
        <Select
          options={sessionTypes}
          value={selectedType}
          onChange={(val) => setSelectedType(val)}
          placeholder="Choose session type..."
        />
      </section>

      {/* Preview Questions */}
      <section className="bg-gray-50 p-4 rounded-lg border shadow-sm">
        <PreviewMappedQuestions questions={questions} loading={fetchingQuestions} />
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 border-t pt-4">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
            disabled={!selectedType || starting}
            className={`px-6 py-2 rounded-md font-semibold text-white flex items-center justify-center gap-2 transition ${
              selectedType && !starting
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={async () => {
              if (!selectedType || !summary) return;

              //  Confirmation prompt
              const confirmed = window.confirm(
                "Are you sure you want to start this session?"
              );

              if (!confirmed) return;

              setStarting(true);
              try {
                // Step 1: Create a new session
                const createRes = await api.post("/api/psychometrician/more-sessions/", {
                  incident_id: summary.incident_id,
                  sess_type: [selectedType.value],
                });

                const newSession = createRes.data;
                const sessId = newSession.sess_id;

                // Step 2: Start the session (hydrate role-based questions)
                await api.post(`/api/psychometrician/sessions/${sessId}/start/`);

                // Step 3: Redirect to StartMoreSession
                navigate(`/psychometrician/more-sessions/${sessId}/start`);
              } catch (err) {
                console.error("Failed to start session", err);
                alert("Failed to start session. Please try again.");
              } finally {
                setStarting(false);
              }
            }}

          >
            {starting && (
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
            {starting ? "Starting..." : "Start Session"}
          </button>
      </div>
    </div>
  );
};

export default CreateSession;

const InfoCard = ({ label, value }) => (
  <div className="bg-white rounded-md px-4 py-3 border shadow-sm">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value}</p>
  </div>
);
