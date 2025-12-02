// import Navbar from "../../Navbar";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// // import SearchVictim from "../../social_worker/Victims/SearchVictimFacial";
// import SearchVictim from "./SearchVictim";
// import api from "../../../api/axios";
// import {
//   MagnifyingGlassIcon,
//   EyeIcon,
//   PencilSquareIcon,
//   TrashIcon,
// } from "@heroicons/react/24/solid";

// export default function DSWDVAWCVictims() {
//   const [victims, setVictims] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showSearchModal, setShowSearchModal] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchVictims = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const res = await api.get("/api/dswd/victims/");
//         setVictims(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("Error fetching victims:", e);
//         setError("Failed to load victims.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVictims();
//   }, []);

//   const filteredVictims = victims.filter((v) => {
//     const fullName = [
//       v.vic_first_name,
//       v.vic_middle_name || "",
//       v.vic_last_name,
//       v.vic_extension || "",
//     ]
//       .filter(Boolean)
//       .join(" ")
//       .toLowerCase();

//     return fullName.includes(searchQuery.toLowerCase());
//   });

//   return (
//     <>
//       <div className="w-full px-6">
//         {/* Title */}
//         <h2 className="text-2xl font-bold text-[#292D96] pt-6 mb-6 text-center md:text-left">
//           VAWC Victims
//         </h2>

//         {/* Search Section */}
//         <div className="mt-2 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">

//           {/* Search Bar */}
//           <div className="flex items-center w-full md:w-2/3 border border-neutral-300 rounded-lg px-3 py-2 bg-white shadow-sm">
//             <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
//             <input
//               type="text"
//               placeholder="Search victim by name..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full text-sm text-neutral-900 outline-none"
//             />
//           </div>

//           {/* Button */}
//           <button
//             onClick={() => setShowSearchModal(true)}
//             className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm w-full md:w-auto justify-center"
//           >
//             <MagnifyingGlassIcon className="h-5 w-5" />
//             Advanced Search
//           </button>
//         </div>

//         {/* Table */}
//         <div className="mt-6 bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
//           <div className="overflow-auto max-h-[480px] rounded-xl">
//             <table className="min-w-full table-auto border-collapse">
//               <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 text-sm font-semibold shadow">
//                 <tr>
//                   <th className="px-4 py-3 text-left border">Victim No.</th>
//                   <th className="px-4 py-3 text-left border">Victim Name</th>
//                   <th className="px-4 py-3 text-left border">Age</th>
//                   <th className="px-4 py-3 text-left border">Address</th>
//                   <th className="px-4 py-3 text-left border">Type of Violence</th>
//                   <th className="px-4 py-3 text-left border">Emergency Contact</th>
//                   <th className="px-4 py-3 text-center border">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="text-sm text-neutral-800">
//                 {loading && (
//                   <tr>
//                     <td colSpan={7} className="px-4 py-6 text-center text-neutral-500">
//                       Loading victims…
//                     </td>
//                   </tr>
//                 )}

//                 {!loading && error && (
//                   <tr>
//                     <td colSpan={7} className="px-4 py-6 text-center text-red-600">
//                       {error}
//                     </td>
//                   </tr>
//                 )}

//                 {!loading && !error && filteredVictims.length === 0 && (
//                   <tr>
//                     <td colSpan={7} className="px-4 py-6 text-center text-neutral-500 italic">
//                       No victims found.
//                     </td>
//                   </tr>
//                 )}

//                 {!loading &&
//                   !error &&
//                   filteredVictims.map((v, index) => {
//                     const fullName = [
//                       v.vic_first_name,
//                       v.vic_middle_name || "",
//                       v.vic_last_name,
//                       v.vic_extension || "",
//                     ]
//                       .filter(Boolean)
//                       .join(" ");

//                     const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";

//                     return (
//                       <tr key={v.vic_id} className={`${rowBg} hover:bg-gray-100 transition`}>
//                         <td className="px-4 py-3 border">{v.vic_id}</td>
//                         <td className="px-4 py-3 border">{fullName}</td>
//                         <td className="px-4 py-3 border">{v.age}</td>
//                         <td className="px-4 py-3 border">{v.vic_birth_place}</td>
//                         <td className="px-4 py-3 border">{v.violence_type}</td>
//                         <td className="px-4 py-3 border">{v.vic_contact_number}</td>

//                         <td className="px-4 py-3 border text-center">
//                           <div className="flex justify-center gap-4">

//                             <Link
//                               to={`/dswd/victims/${v.vic_id}`}
//                               className="text-green-600 hover:text-green-700 transition"
//                             >
//                               <EyeIcon className="h-5 w-5" />
//                             </Link>

//                             <button className="text-yellow-500 hover:text-yellow-600 transition">
//                               <PencilSquareIcon className="h-5 w-5" />
//                             </button>

//                             <button className="text-red-600 hover:text-red-700 transition">
//                               <TrashIcon className="h-5 w-5" />
//                             </button>

//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {showSearchModal && (
//         <SearchVictim
//           onClose={() => setShowSearchModal(false)}
//           onFound={(victimId) => {
//             setShowSearchModal(false);
//             navigate(`/dswd/victims/${victimId}`);
//           }}
//         />
//       )}
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchVictimFacial from "./SearchVictimFacial";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import api from "../../../api/axios";

export default function SocialWorkerVictims() {
  const [victims, setVictims] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFacialModal, setShowFacialModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadVictims = async () => {
      try {
        const res = await api.get("/api/social_worker/victims/");
        setVictims(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching victims:", err);
        setError("Failed to load victims.");
      } finally {
        setLoading(false);
      }
    };
    loadVictims();
  }, []);

  const handleDelete = async (vic_id) => {
    if (window.confirm("Are you sure you want to delete this victim?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/social_worker/victims/${vic_id}/`);
        setVictims(victims.filter((v) => v.vic_id !== vic_id));
      } catch (err) {
        console.error("Error deleting victim", err);
      }
    }
  };

  const filteredVictims = victims.filter((v) => {
    const fullName = [
      v.vic_first_name,
      v.vic_middle_name || "",
      v.vic_last_name,
      v.vic_extension || "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full px-6">
      {/* Title */}
      <h2 className="text-xl md:text-2xl font-bold text-[#292D96] pt-6 mb-2">
        Women Survivor‑Victims
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-6">
        List of Registered Victims
      </p>

      {/* Search Bar */}
      <div className="mt-4 w-full flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center w-full md:w-2/3 border border-neutral-300 rounded-lg px-3 py-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search victim by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-neutral-900 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFacialModal(true)}
          className="h-10 bg-[#10b981] px-4 text-white rounded-[10px] transition duration-200 hover:bg-[#059669] flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-white" />
          Facial Search
        </button>
      </div>

      {/* Table container */}
      <div className="mt-6 bg-white rounded-xl shadow-md border border-neutral-200">
        <div className="overflow-auto max-h-[480px] rounded-xl">
          <table className="min-w-full table-fixed border border-neutral-200">
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 text-sm font-semibold">
              <tr>
                <th className="border px-4 py-3 text-left">Victim Code</th>
                <th className="border px-4 py-3 text-left">Victim Name</th>
                <th className="border px-4 py-3 text-left">Age</th>
                <th className="border px-4 py-3 text-left">Address</th>
                <th className="border px-4 py-3 text-left">Type of Violence</th>
                <th className="border px-4 py-3 text-left">Emergency Contact</th>
                <th className="border px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm text-neutral-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-500">
                    Loading victims…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredVictims.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-500 italic">
                    No victims found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredVictims.map((v, index) => {
                  const fullName = [
                    v.vic_first_name,
                    v.vic_middle_name || "",
                    v.vic_last_name,
                    v.vic_extension || "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";

                  return (
                    <tr key={v.vic_id} className={rowBg}>
                      <td className="border px-4 py-3">{v.code}</td>
                      <td className="border px-4 py-3">{fullName}</td>
                      <td className="border px-4 py-3">{v.age || "N/A"}</td>
                      <td className="border px-4 py-3">{v.vic_birth_place || "N/A"}</td>
                      <td className="border px-4 py-3">{v.violence_type || "N/A"}</td>
                      <td className="border px-4 py-3">{v.vic_contact_number || "N/A"}</td>
                      <td className="border px-4 py-3 text-center">
                        <div className="flex justify-center gap-4">
                          <Link to={`/dswd/victims/${v.vic_id}`} className="text-[#10b981] hover:text-[#059669]">
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <button className="text-[#f1c40f] hover:text-[#caa40d]">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.vic_id)}
                            className="text-[#e74c3c] hover:text-[#b33a2d]"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal injected here */}
      {showFacialModal && (
        <SearchVictimFacial
          onClose={() => setShowFacialModal(false)}
          onFound={(victimId) => {
            setShowFacialModal(false);
            navigate(`/dswd/victims/${victimId}`);
          }}
        />
      )}
    </div>
  );
}
