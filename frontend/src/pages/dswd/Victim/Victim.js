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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const loadVictims = async () => {
      try {
        const res = await api.get("/api/social_worker/victims/");
        // setVictims(Array.isArray(res.data) ? res.data : []);
        setVictims(
          Array.isArray(res.data)
            ? res.data.sort((a, b) => b.vic_id - a.vic_id)
            : []
        );
      } catch (err) {
        console.error("Error fetching victims:", err);
        setError("Failed to load victims.");
      } finally {
        setLoading(false);
      }
    };

    loadVictims();
  }, []);

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

  const totalPages = Math.ceil(filteredVictims.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentVictims = filteredVictims.slice(startIndex, startIndex + pageSize);

  return (
    <div className="w-full px-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Women Victim-Survivor</h1>
        <p className="text-gray-500 mt-1">
          Accessing all case records for timely intervention.
        </p>
      </header>

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
      <div className="mt-6 bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
        <div className="rounded-xl">
          <table className="min-w-full table-fixed border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 font-semibold shadow">
              <tr>
                <th className="w-24 px-3 py-2 text-left border">Code</th>
                <th className="w-48 px-3 py-2 text-left border">Name</th>
                <th className="w-20 px-3 py-2 text-left border">Age</th>
                <th className="w-48 px-3 py-2 text-left border">Address</th>
                {/* <th className="w-48 px-3 py-2 text-left border">Type of Violence</th> */}
                <th className="w-40 px-3 py-2 text-left border">Contact</th>
                <th className="w-32 px-3 py-2 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-500">
                    Loading victims…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : currentVictims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-neutral-500 italic">
                    No victims found.
                  </td>
                </tr>
              ) : (
                currentVictims.map((v, index) => {
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
                    <tr key={v.vic_id} className={`${rowBg} hover:bg-blue-50 transition`}>
                      <td className="px-3 py-2 border">{v.code}</td>
                      <td className="px-3 py-2 border whitespace-normal break-words">{fullName}</td>
                      <td className="px-3 py-2 border">{v.age || "N/A"}</td>
                      <td className="px-3 py-2 border whitespace-normal break-words">{v.vic_birth_place || "N/A"}</td>
                      {/* <td className="px-3 py-2 border whitespace-normal break-words">{v.violence_type || "N/A"}</td> */}
                      <td className="px-3 py-2 border">{v.vic_contact_number || "N/A"}</td>
                      <td className="px-3 py-2 border text-center">
                        <div className="flex justify-center gap-3">
                          {/* View Detail */}
                          <Link
                            to={`/dswd/victims/${v.vic_id}`}
                            className="text-green-600 hover:text-green-800"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
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

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filteredVictims.length)} of{" "}
            {filteredVictims.length} entries
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

