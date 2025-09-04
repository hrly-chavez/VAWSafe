import Navbar from "../../Navbar";
import Sidebar from "../../Sidebar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchVictim from "./SearchVictim";

export default function Victims() {
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVictims = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/desk_officer/victims/"
        );
        // Expecting an array like:
        // [{ vic_id, vic_first_name, vic_middle_name, vic_last_name, vic_extension, vic_sex, vic_birth_place, age }, ...]
        setVictims(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setError("Failed to load victims.");
      } finally {
        setLoading(false);
      }
    };
    fetchVictims();
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 px-6 py-6 m-5 bg-white rounded-[20px] h-[400px] shadow-[0_2px_6px_0_rgba(0,0,0,0.1),0_-2px_6px_0_rgba(0,0,0,0.1)]">
          {/* Title + top filters */}
          <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">
            VAWC Victims
          </h2>

          <div className="mt-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <p className="text-sm font-medium text-[#292D96]">
                List of VAWC Victims
              </p>

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
            </div>
          </div>

          {/* Row two: search + perpetrator filter */}
          <div className="mt-4 flex flex-col items-start gap-[30px] md:flex-row md:items-end justify-between">
            {/* Search box */}
            <div className="relative">
              <button
                onClick={() => setShowSearchModal(true)}
                className="bg-[#10b981] px-3 py-2 text-white rounded-[10px] transition duration-200 hover:bg-[#059669]"
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
