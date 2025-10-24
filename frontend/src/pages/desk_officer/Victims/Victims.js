import Navbar from "../../Navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchVictim from "./SearchVictim";
import api from "../../../api/axios";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

export default function Victims() {
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVictims = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("api/desk_officer/victims/");
        setVictims(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Error fetching victims:", e);
        setError("Failed to load victims.");
      } finally {
        setLoading(false);
      }
    };

    fetchVictims();
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

  return (
    <>
      <div className="w-full px-6">
        {/* Title */}
        <h2 className="text-xl font-bold text-[#292D96] pt-6 mb-4">
          VAWC Victims
        </h2>

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
            onClick={() => setShowSearchModal(true)}
            className="h-10 bg-[#10b981] px-4 text-white rounded-[10px] transition duration-200 hover:bg-[#059669] flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-white" />
            Advanced Search
          </button>
        </div>

        {/* Table container */}
        <div className="mt-6 bg-white rounded-xl shadow-md border border-neutral-200">
          <div className="overflow-auto max-h-[480px] rounded-xl">
            <table className="min-w-full table-fixed border border-neutral-200">
              <thead className="sticky top-0 z-10 bg-gray-100 text-gray-700 text-sm font-semibold">
                <tr>
                  <th className="border border-neutral-200 px-4 py-3 text-left">Victim No.</th>
                  <th className="border border-neutral-200 px-4 py-3 text-left">Victim Name</th>
                  <th className="border border-neutral-200 px-4 py-3 text-left">Gender</th>
                  <th className="border border-neutral-200 px-4 py-3 text-left">Place / Barangay</th>
                  <th className="border border-neutral-200 px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-neutral-800">
                {loading && (
                  <tr>
                    <td colSpan={5} className="border border-neutral-200 px-4 py-6 text-center text-neutral-500">
                      Loading victims…
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="border border-neutral-200 px-4 py-6 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && filteredVictims.length === 0 && (
                  <tr>
                    <td colSpan={5} className="border border-neutral-200 px-4 py-6 text-center text-neutral-500 italic">
                      No victims found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filteredVictims.map((v) => {
                    const fullName = [
                      v.vic_first_name,
                      v.vic_middle_name || "",
                      v.vic_last_name,
                      v.vic_extension || "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <tr key={v.vic_id} className="hover:bg-gray-50">
                        <td className="border border-neutral-200 px-4 py-3">{v.vic_id}</td>
                        <td className="border border-neutral-200 px-4 py-3">{fullName}</td>
                        <td className="border border-neutral-200 px-4 py-3">{v.vic_sex || "—"}</td>
                        <td className="border border-neutral-200 px-4 py-3">{v.vic_birth_place}</td>
                        <td className="border border-neutral-200 px-4 py-3 text-center">
                          <div className="flex justify-center gap-4">
                            <Link to={`/desk_officer/victims/${v.vic_id}`} className="text-[#10b981] hover:text-[#059669]">
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <button className="text-[#f1c40f] hover:text-[#caa40d]">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button className="text-[#e74c3c] hover:text-[#b33a2d]">
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
      </div>

      {/* Modal injected here */}
      {showSearchModal && (
        <SearchVictim
          onClose={() => setShowSearchModal(false)}
          onFound={(victimId) => {
            setShowSearchModal(false);
            navigate(`/desk_officer/victims/${victimId}`);
          }}
        />
      )}
    </>
  );
}
