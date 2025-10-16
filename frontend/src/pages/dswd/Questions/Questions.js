// // src/pages/dswd/Questions/Questions.js
// import { useState, useEffect } from "react";
// import api from "../../../api/axios";
// import AddQuestion from "./AddQuestion";

// export default function Questions() {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);

//   const fetchQuestions = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/api/dswd/questions/");
//       setQuestions(res.data);
//     } catch (err) {
//       console.error("Failed to load questions:", err.response?.data || err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchQuestions();
//   }, []);

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold text-blue-700">
//           Questions Management
//         </h1>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
//         >
//           + Add Question
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto shadow border rounded-lg">
//         <table className="min-w-full border-collapse bg-white">
//           <thead className="bg-gray-100 text-gray-700 text-sm">
//             <tr>
//               <th className="border p-3 text-left">ID</th>
//               <th className="border p-3 text-left">Category</th>
//               <th className="border p-3 text-left">Question</th>
//               <th className="border p-3 text-left">Answer Type</th>
//               <th className="border p-3 text-left">Assigned To</th>
//               <th className="border p-3 text-left">Created By</th>
//               <th className="border p-3 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="text-sm">
//             {loading ? (
//               <tr>
//                 <td colSpan="7" className="text-center p-4 text-gray-500">
//                   Loading...
//                 </td>
//               </tr>
//             ) : questions.length > 0 ? (
//               questions.map((q) => (
//                 <tr key={q.ques_id} className="hover:bg-gray-50">
//                   <td className="border p-3">{q.ques_id}</td>
//                   <td className="border p-3">{q.ques_category}</td>
//                   <td className="border p-3">{q.ques_question_text}</td>
//                   <td className="border p-3">{q.ques_answer_type}</td>
//                   <td className="border p-3">
//                     {q.mappings && q.mappings.length > 0 ? (
//                       <ul className="list-disc list-inside text-gray-700">
//                         {q.mappings.map((m, idx) => (
//                           <li key={idx}>
//                             Session {m.session_number} – {m.session_type}
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <span className="text-gray-400 italic">Not assigned</span>
//                     )}
//                   </td>
//                   <td className="border p-3">{q.created_by_name || "—"}</td>
//                   <td className="border p-3 text-center">
//                     <button className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 mr-2">
//                       Edit
//                     </button>
//                     <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
//                       Deactivate
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" className="text-center text-gray-500 p-4 italic">
//                   No questions found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Add Question Modal */}
//       {showAddModal && (
//         <AddQuestion
//           onClose={() => {
//             setShowAddModal(false);
//             fetchQuestions();
//           }}
//         />
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { PencilSquareIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";
import ChangeLogModal from "./ChangeLogModal"; 

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false); 
  const [selectedLogId, setSelectedLogId] = useState(null);

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

  const filteredQuestions = questions.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.ques_question_text.toLowerCase().includes(query) ||
      q.ques_category.toLowerCase().includes(query)
    );
  });
const handleToggleActive = async (id, isActive) => {
  const actionText = isActive ? "deactivate" : "activate";

  // Show confirmation dialog
  const confirmed = window.confirm(
    `Are you sure you want to ${actionText} this question?`
  );

  if (!confirmed) return;

  try {
    await api.delete(`/api/dswd/questions/${id}/`);
    alert(`Question ${isActive ? "deactivated" : "activated"} successfully.`);
    fetchQuestions(); // refresh the list
  } catch (err) {
    console.error("Failed to toggle active state:", err.response?.data || err);
    alert("Something went wrong. Please try again.");
  }
};


  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Centered Title with Subtext */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#292D96] tracking-tight">Q&amp;A</h1>
        <p className="text-sm text-gray-600 mt-1">
          VAWSAFE | DSWD Social Worker | VAWC Victims Support
        </p>
      </div>


      {/* Search + Add Question */}
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
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : questions.length > 0 ? (
              questions.map((q) => (
                <tr key={q.ques_id} className={`hover:bg-gray-50 ${ !q.ques_is_active ? "opacity-60 bg-gray-100" : ""}`}>

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
                  {/* Button */}
                  <td className="border p-3 text-center">
                <button onClick={() => { setEditingQuestion(q.ques_id);setShowEditModal(true);}}
                  className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 mr-2">
                  Edit
                </button>

                <button onClick={() => handleToggleActive(q.ques_id, q.ques_is_active)}className={`px-2 py-1 rounded text-white ${
                    q.ques_is_active
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}>
                  {q.ques_is_active ? "Deactivate" : "Activate"}
                </button>

                <button onClick={() => { setSelectedLogId(q.ques_id); setShowLogModal(true);}}
                  className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2">
                  View Logs
                </button>
              </td>

                </tr>

              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 p-4 italic">
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
    {/* Edit Question Modal */}
      {showEditModal && (
      <EditQuestion
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        questionId={editingQuestion}
        onUpdated={() => fetchQuestions()}
      />
    )}
    {/* Change Logs Modal */}
    {showLogModal && (
      <ChangeLogModal
        questionId={selectedLogId}
        onClose={() => setShowLogModal(false)}
      />
    )}


    </div>
  );
}
