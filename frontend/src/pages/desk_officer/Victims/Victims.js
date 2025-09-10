import Navbar from "../../Navbar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchVictim from "./SearchVictim";
import api from "../../../api/axios";

export default function Victims() {
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  return (
    <>
      <div className="w-full px-6">
        {/* Title */}
        <h2 className="text-xl font-bold text-[#292D96] pt-6">
          VAWC Victims
        </h2>

        <div className="mt-6 w-full flex justify-between items-end flex-wrap gap-4">
          {/* Left side: filters */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Gender */}
            <div className="flex flex-col">
              <label
                htmlFor="gender"
                className="mb-1 text-sm font-medium text-neutral-800"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="h-10 w-48 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none ring-0 focus:border-neutral-400 focus:outline-none"
                defaultValue="All"
              // disabled
              >
                <option>All</option>
                <option>Male</option>
                <option>Female</option>
                <option>Others</option>
              </select>
            </div>

            {/* Type of Violence */}
            <div className="flex flex-col">
              <label
                htmlFor="type"
                className="mb-1 text-sm font-medium text-neutral-800"
              >
                Place / Barangay
              </label>
              <select
                id="type"
                name="type"
                className="h-10 w-56 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none ring-0 focus:border-neutral-400 focus:outline-none"
                defaultValue="All"
              // disabled
              >
                <option>All</option>
              </select>
            </div>
          </div>

          {/* Right side: search button */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-transparent">Search</label>
            <button
              onClick={() => setShowSearchModal(true)}
              className="h-10 bg-[#10b981] px-4 text-white rounded-[10px] transition duration-200 hover:bg-[#059669]"
            >
              Search Victim
            </button>
          </div>
        </div>


        {/* Table container (fixed size + scroll, sticky header) */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
          <div className="max-h-[480px] overflow-auto rounded-xl">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 z-10 bg-neutral-50">
                <tr className="text-left text-sm font-semibold text-neutral-700">
                  <th className="px-4 py-3">Victim No.</th>
                  <th className="px-4 py-3">Victim Name</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Place / Barangay</th>
                  <th className="px-4 py-3">Intake Form</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                {loading && (
                  <tr>
                    <td className="px-4 py-6 text-neutral-500" colSpan={6}>
                      Loading victims…
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td className="px-4 py-6 text-red-600" colSpan={6}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && victims.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-neutral-500" colSpan={6}>
                      No victims found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  victims.map((v) => {
                    const fullName = [
                      v.vic_first_name,
                      v.vic_middle_name || "",
                      v.vic_last_name,
                      v.vic_extension || "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <tr key={v.vic_id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">{v.vic_id}</td>
                        <td className="px-4 py-3">{fullName}</td>
                        <td className="px-4 py-3">{v.vic_sex || "—"}</td>
                        <td className="px-4 py-3">{v.vic_birth_place}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/desk_officer/victims/${v.vic_id}`}
                            className="bg-[#10b981] px-2 py-1 rounded-[10px] text-white transition duration-200 hover:bg-[#059669] mr-2"
                          >
                            View
                          </Link>
                          <button className="bg-[#f1c40f] px-2 py-1 rounded-[10px] text-white transition duration-200 hover:bg-[#caa40d] mr-2">
                            Edit
                          </button>
                          <button className="bg-[#e74c3c] px-2 py-1 rounded-[10px] text-white transition duration-200 hover:bg-[#b33a2d]">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div >

      {/* Modal injected here */}
      {
        showSearchModal && (
          <SearchVictim
            onClose={() => setShowSearchModal(false)}
            onFound={(victimId) => {
              setShowSearchModal(false);
              navigate(`/desk_officer/victims/${victimId}`);
            }}
          />
        )
      }
    </>
  );
}
