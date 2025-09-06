import Navbar from "../../Navbar";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

export default function DSWDSocialWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        // Use global axios instance
        const res = await api.get("/api/dswd/social_worker/", {
          params: search ? { q: search } : {},
        });

        // Handle array or paginated response
        setWorkers(Array.isArray(res.data) ? res.data : res.data.results ?? []);
        console.log("Fetched social workers:", res.data); // optional debug log

      } catch (e) {
        console.error("Error fetching social workers:", e);
        setErr("Failed to load social workers.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search]);

  const rows = useMemo(() => workers, [workers]);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 px-6 py-6 m-5 bg-white rounded-[20px] shadow-[0_2px_6px_0_rgba(0,0,0,0.1),0_-2px_6px_0_rgba(0,0,0,0.1)]">
          <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">
            Social Workers
          </h2>

          <div className="mt-3">
            <div className="flex flex-col gap-[30px] md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-medium text-[#292D96]">
                List of Social Workers
              </p>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, barangay, specialization..."
                    className="h-10 w-64 rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                  />
                  <img
                    src="/images/search-interface-symbol.png"
                    alt="Search"
                    className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
                  />
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#292D96] px-4 py-2 text-sm font-medium text-white hover:opacity-95 active:opacity-90"
                >
                  <img
                    src="/images/add (1).png"
                    alt="Add"
                    className="h-4 w-4 object-contain"
                  />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
            {loading ? (
              <div className="p-6 text-sm text-neutral-600">Loading…</div>
            ) : err ? (
              <div className="p-6 text-sm text-red-600">{err}</div>
            ) : (
              <div className="max-h-[480px] overflow-auto rounded-xl">
                <table className="w-full table-auto border-collapse">
                  <thead className="sticky top-0 z-10 bg-neutral-50">
                    <tr className="text-left text-sm font-semibold text-neutral-700">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Position</th>
                      <th className="px-4 py-3">Contact Number</th>
                      <th className="px-4 py-3">Specialization</th>
                      <th className="px-4 py-3">Barangay Assigned</th>
                      <th className="px-4 py-3">Forms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                    {rows.map((w) => (
                      <tr className="hover:bg-neutral-50" key={w.of_id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {w.photo ? (
                              <img
                                src={w.photo}
                                alt={w.full_name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-neutral-200" />
                            )}
                            <span>{w.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{w.of_role || "Social Worker"}</td>
                        <td className="px-4 py-3">{w.of_contact || "—"}</td>
                        <td className="px-4 py-3">{w.of_specialization || "—"}</td>
                        <td className="px-4 py-3">{w.of_brgy_assigned || "—"}</td>
                        <td className="px-4 py-3">
                          <a
                            href={`/dswd/social-workers/${w.of_id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            View Form
                          </a>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-sm text-neutral-500" colSpan={6}>
                          No social workers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// import Navbar from "../Navbar";
// import Sidebar from "../sidebar";

// export default function DSWDSocialWorkers() {
//   return (
//     <>
//       <Navbar />

//       <div className="flex min-h-screen bg-white">
//         <Sidebar />

//         <div className="flex-1 px-6 py-6 m-5 bg-white rounded-[20px] h-[400px] shadow-[0_2px_6px_0_rgba(0,0,0,0.1),0_-2px_6px_0_rgba(0,0,0,0.1)]">
//           {/* Title */}
//           <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">
//             Social Workers
//           </h2>

//           {/* Subtitle + actions */}
//           <div className="mt-3">
//             <div className="flex flex-col gap-[30px] md:flex-row md:items-center md:justify-between">
//               <p className="text-sm font-medium text-[#292D96]">
//                 List of Social Workers
//               </p>

//               <div className="flex items-center gap-3">
//                 {/* Search */}
//                 <div className="relative">
//                   <input
//                     type="text"
//                     placeholder="Search"
//                     className="h-10 w-64 rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
//                   />
//                   <img
//                     src="/images/search-interface-symbol.png"
//                     alt="Search"
//                     className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
//                   />
//                 </div>

//                 {/* Add button */}
//                 <button
//                   type="button"
//                   className="inline-flex items-center gap-2 rounded-xl bg-[#292D96] px-4 py-2 text-sm font-medium text-white hover:opacity-95 active:opacity-90"
//                 >
//                   <img
//                     src="/images/add (1).png"
//                     alt="Add"
//                     className="h-4 w-4 object-contain"
//                   />
//                   Add
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Table container (fixed height + scroll, sticky header) */}
//           <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
//             <div className="max-h-[480px] overflow-auto rounded-xl">
//               <table className="w-full table-auto border-collapse">
//                 <thead className="sticky top-0 z-10 bg-neutral-50">
//                   <tr className="text-left text-sm font-semibold text-neutral-700">
//                     <th className="px-4 py-3">Name</th>
//                     <th className="px-4 py-3">Position</th>
//                     <th className="px-4 py-3">Contact Number</th>
//                     <th className="px-4 py-3">Email Address</th>
//                     <th className="px-4 py-3">Status</th>
//                     <th className="px-4 py-3">Forms</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
//                   <tr className="hover:bg-neutral-50">
//                     <td className="px-4 py-3">Rhodjien Caratao</td>
//                     <td className="px-4 py-3">DSWD Social Worker</td>
//                     <td className="px-4 py-3">+63 905 327 3129</td>
//                     <td className="px-4 py-3">carataojoegie@gmail.com</td>
//                     <td className="px-4 py-3">Active</td>
//                     <td className="px-4 py-3">
//                       <a href="#" className="font-medium text-blue-600 hover:underline">
//                         View Form
//                       </a>
//                     </td>
//                   </tr>
//                   {/* more rows... */}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
