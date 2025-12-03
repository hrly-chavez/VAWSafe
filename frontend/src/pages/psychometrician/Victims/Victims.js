import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SearchVictimFacial from "./SearchVictimFacial";
import { MagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/solid";
import api from "../../../api/axios";

export default function PsychometricianVictims() {
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
  const currentVictims = filteredVictims.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="w-full px-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Women Victim-Survivor
        </h1>
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
        {/* <button
          onClick={() => setShowFacialModal(true)}
          className="h-10 bg-[#10b981] px-4 text-white rounded-[10px] transition duration-200 hover:bg-[#059669] flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-white" />
          Facial Search
        </button> */}
      </div>

      {/* Table container */}
      <div className="mt-6 bg-white rounded-xl shadow border border-neutral-200 overflow-hidden">
        <div className="rounded-xl overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 font-semibold shadow">
              <tr>
                <th className="w-24 px-3 py-2 text-left border">Code</th>
                <th className="w-56 px-3 py-2 text-left border">Name</th>
                <th className="w-20 px-3 py-2 text-left border">Age</th>
                <th className="w-64 px-3 py-2 text-left border">Address</th>
                <th className="w-40 px-3 py-2 text-left border">Contact</th>
                <th className="w-32 px-3 py-2 text-center border">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-neutral-500">
                    Loading victims…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : currentVictims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-neutral-500 italic">
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
                      <td className="px-3 py-2 border truncate">{v.code}</td>
                      <td className="px-3 py-2 border break-words">{fullName}</td>
                      <td className="px-3 py-2 border">{v.age || "N/A"}</td>
                      <td className="px-3 py-2 border break-words">{v.full_address || "N/A"}</td>
                      <td className="px-3 py-2 border truncate">{v.vic_contact_number || "N/A"}</td>
                      <td className="px-3 py-2 border text-center">
                        <div className="flex justify-center gap-3">
                          <Link
                            to={`/psychometrician/victims/${v.vic_id}`}
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
            navigate(`/psychometrician/victims/${victimId}`);
          }}
        />
      )}
    </div>
  );
}
