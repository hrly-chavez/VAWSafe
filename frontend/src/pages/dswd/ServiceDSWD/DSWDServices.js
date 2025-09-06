// import Navbar from "./Navbar";
// import Sidebar from "./sidebar";
// import './css/DSWDService.css';

// export default function DSWDServices () {
//     return (
//         <>
//             <Navbar />

//             <div className="main-container">
//                 <Sidebar />

//                 <div className="inside-container">
//                     <h2 className="servicetext">Service</h2>

//                     <p className="list-text">List of Services</p>

//                     <div className="row-one">
//                         <div className="search">
//                                 <input type="text" value="Search" className="searchbar"></input>
//                                 <img src="./images/loupe.png"></img>
//                         </div>

//                         <div className="row-one-filter">
//                             <div className="filter-group">
//                                 <label for="service" className="service">Service</label>
//                                 <select id="service" name="service">
//                                     <option value="All">All</option>
//                                     <option value="Male">Financial</option>
//                                 </select>
//                             </div>
                            
//                             <div className="filter-group">
//                                 <label for="type" className="type">Case Type</label>
//                                 <select id="type" name="type">
//                                     <option value="All">All</option>
//                                     <option value="Physical">Physical</option>
//                                     <option value="Emotional">Emotional</option>
//                                     <option value="Sexual">Sexual</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="table-container">
//                         <table className="table-victims">
//                             <thead>
//                                 <th>Victim No.</th>
//                                 <th>Victim Name</th>
//                                 <th>Schedule</th>
//                                 <th>Case Type</th>
//                                 <th>Service</th>
//                                 <th>Intake Form</th>
//                             </thead>
//                             <tbody>
//                                 <tr>
//                                     <td>1</td>
//                                     <td>Rhodjien Caratao</td>
//                                     <td>    </td>
//                                     <td>Pschological Abuse</td>
//                                     <td>In Progress</td>
//                                     <td><a href="#">View Form</a></td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </>
        
//     );
// }

import Navbar from "../../Navbar";

export default function DSWDServices() {
  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-white">

        <div className="flex-1 px-6 py-6 m-5 bg-white rounded-[20px] h-[400px] shadow-[0_2px_6px_0_rgba(0,0,0,0.1),0_-2px_6px_0_rgba(0,0,0,0.1)]">
          {/* Title */}
          <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">
            Service
          </h2>

          {/* Subtitle + search + filters */}
          <div className="mt-3">
            <div className="flex flex-col gap-[30px] md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-medium text-[#292D96]">
                List of Services
              </p>

              <div className="flex flex-wrap items-end gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-10 w-64 rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
                  />
                  <img
                    src="./images/loupe.png"
                    alt="Search"
                    className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-70"
                  />
                </div>

                {/* Service filter */}
                <div className="flex flex-col">
                  <label htmlFor="service" className="mb-1 text-sm font-medium text-neutral-800">
                    Service
                  </label>
                  <select
                    id="service"
                    name="service"
                    className="h-10 w-48 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none ring-0 focus:border-neutral-400 focus:outline-none"
                  >
                    <option>All</option>
                    <option>Financial</option>
                  </select>
                </div>

                {/* Case Type filter */}
                <div className="flex flex-col">
                  <label htmlFor="type" className="mb-1 text-sm font-medium text-neutral-800">
                    Case Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="h-10 w-56 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none ring-0 focus:border-neutral-400 focus:outline-none"
                  >
                    <option>All</option>
                    <option>Physical</option>
                    <option>Emotional</option>
                    <option>Sexual</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table container (fixed height + scroll, sticky header) */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
            <div className="max-h-[480px] overflow-auto rounded-xl">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-neutral-50">
                  <tr className="text-left text-sm font-semibold text-neutral-700">
                    <th className="px-4 py-3">Victim No.</th>
                    <th className="px-4 py-3">Victim Name</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Case Type</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Intake Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                  <tr className="hover:bg-neutral-50">
                    <td className="px-4 py-3">1</td>
                    <td className="px-4 py-3">Rhodjien Caratao</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">Psychological Abuse</td>
                    <td className="px-4 py-3">In Progress</td>
                    <td className="px-4 py-3">
                      <a href="#" className="font-medium text-blue-600 hover:underline">
                        View Form
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
