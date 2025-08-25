import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import axios from "axios";
import { useEffect, useState } from "react";

export default function DSWDVAWCVictims() {
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVictims = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/dswd/victims/");
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
          <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">VAWC Victims</h2>

          <div className="mt-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <p className="text-sm font-medium text-[#292D96]">List of VAWC Victims</p>

              <div className="flex flex-wrap items-end gap-4">
                {/* Gender */}
                <div className="flex flex-col">
                  <label htmlFor="gender" className="mb-1 text-sm font-medium text-neutral-800">
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
                  <label htmlFor="type" className="mb-1 text-sm font-medium text-neutral-800">
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
              <input
                type="text"
                placeholder="Search"
                className="h-10 w-[300px] rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                // disabled
              />
              <img
                src="./images/loupe.png"
                alt="Search"
                className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
              />
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
                          <td className="px-4 py-3">—</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}


// import { useParams } from "react-router-dom";
// import Navbar from "./Navbar";
// import Sidebar from "./sidebar";
// import axios from "axios";
// import { useEffect, useState } from "react";

// export default function DSWDVAWCVictims() {
//   const {victims, setVictims} = useState([])

//   useEffect (() => {
//     axios.get("http://127.0.0.1:8000/api/social_worker/victims/")
//       .then((res) => setVictims(res.data))
//       .catch((err) => console.error(err));
//   }, [])

//   return (
//     <>
//       <Navbar />

//       <div className="flex min-h-screen bg-white">
//         <Sidebar />

//         <div className="flex-1 px-6 py-6 m-5 bg-white rounded-[20px] h-[400px] shadow-[0_2px_6px_0_rgba(0,0,0,0.1),0_-2px_6px_0_rgba(0,0,0,0.1)]">
//           {/* Title + top filters */}
//           <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">VAWC Victims</h2>

//           <div className="mt-3">
//             <div className="flex flex-col md:flex-row md:items-center justify-between">
//               <p className="text-sm font-medium text-[#292D96]">List of VAWC Victims</p>

//               <div className="flex flex-wrap items-end gap-4">
//                 {/* Gender */}
//                 <div className="flex flex-col">
//                   <label htmlFor="gender" className="mb-1 text-sm font-medium text-neutral-800">
//                     Gender
//                   </label>
//                   <select
//                     id="gender"
//                     name="gender"
//                     className="h-10 w-48 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none ring-0 focus:border-neutral-400 focus:outline-none"
//                   >
//                     <option>All</option>
//                     <option>Male</option>
//                     <option>Female</option>
//                     <option>Others</option>
//                   </select>
//                 </div>

//                 {/* Type of Violence */}
//                 <div className="flex flex-col">
//                   <label htmlFor="type" className="mb-1 text-sm font-medium text-neutral-800">
//                     Type of Violence
//                   </label>
//                   <select
//                     id="type"
//                     name="type"
//                     className="h-10 w-56 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none ring-0 focus:border-neutral-400 focus:outline-none"
//                   >
//                     <option>All</option>
//                     <option>Physical</option>
//                     <option>Emotional</option>
//                     <option>Sexual</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Row two: search + perpetrator filter */}
//           <div className="mt-4 flex flex-col items-start gap-[30px] md:flex-row md:items-end justify-between">
//             {/* Search box */}
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search"
//                 className="h-10 w-[300px] rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
//               />
//               <img
//                 src="./images/loupe.png"
//                 alt="Search"
//                 className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
//               />
//             </div>

//             {/* Perpetrator */}
//             <div className="flex flex-col">
//               <label htmlFor="perpetrator" className="mb-1 text-sm font-medium text-neutral-800">
//                 Perpetrator
//               </label>
//               <select
//                 id="perpetrator"
//                 name="perpetrator"
//                 className="h-10 w-56 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400"
//               >
//                 <option>All</option>
//                 <option>Physical</option>
//               </select>
//             </div>
//           </div>

//           {/* Table container (fixed size + scroll, sticky header) */}
//           <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
//             <div className="max-h-[480px] overflow-auto rounded-xl">
//               <table className="w-full table-auto border-collapse">
//                 <thead className="sticky top-0 z-10 bg-neutral-50">
//                   <tr className="text-left text-sm font-semibold text-neutral-700">
//                     <th className="px-4 py-3">Victim No.</th>
//                     <th className="px-4 py-3">Victim Name</th>
//                     <th className="px-4 py-3">Gender</th>
//                     <th className="px-4 py-3">Type of Violence</th>
//                     <th className="px-4 py-3">Perpetrators</th>
//                     <th className="px-4 py-3">Intake Form</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
//                   <tr className="hover:bg-neutral-50">
//                     <td className="px-4 py-3"></td>
//                     <td className="px-4 py-3">Rhodjien Caratao</td>
//                     <td className="px-4 py-3">Female</td>
//                     <td className="px-4 py-3">Type of Violence</td>
//                     <td className="px-4 py-3">Stranger</td>
//                     <td className="px-4 py-3">
//                       <a href="#" className="font-medium text-blue-600 hover:underline">
//                         View Form
//                       </a>
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
