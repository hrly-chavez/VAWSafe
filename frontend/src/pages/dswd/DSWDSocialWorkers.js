// import Navbar from "./Navbar";
// import Sidebar from "./sidebar";
// import './css/DSWDSocialWorker.css';

// export default function DSWDSocialWorkers () {
//     return (
//         <>
//             <Navbar />

//             <div className="main-container">
//                 <Sidebar />

//                 <div className="inside-container">
//                     <h2 className="socialworker">Social Workers</h2>

//                     <p className="list-text">List of Social Workers</p>

//                     <div className="search-add">
//                         <div className="search">
//                                 <input type="text" value="Search" className="searchbar"></input>
//                                 <img src="./images/loupe.png"></img>
//                         </div>

//                         <button className="add-button">
//                             <img src="./images/add (1).png" className="icon"></img>
//                             Add
//                         </button>
//                     </div>

//                     <div className="table-container">
//                         <table className="table-socialworker">
//                             <thead>
//                                 <th>Name</th>
//                                 <th>Position</th>
//                                 <th>Contact Number</th>
//                                 <th>Email Address</th>
//                                 <th>Status</th>
//                                 <th>Forms</th>
//                             </thead>
//                             <tbody>
//                                 <tr>
//                                     <td>Rhodjien Caratao</td>
//                                     <td>DSWD Social Worker</td>
//                                     <td>+63 905 327 3129</td>
//                                     <td>carataojoegie@gmail.com</td>
//                                     <td>Active</td>
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

import Navbar from "./Navbar";
import Sidebar from "./sidebar";

export default function DSWDSocialWorkers() {
  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        <Sidebar />

        <div className="flex-1 px-6 py-6 m-5 bg-white rounded-[20px] h-[400px] shadow-[0_2px_6px_0_rgba(0,0,0,0.1),0_-2px_6px_0_rgba(0,0,0,0.1)]">
          {/* Title */}
          <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">
            Social Workers
          </h2>

          {/* Subtitle + actions */}
          <div className="mt-3">
            <div className="flex flex-col gap-[30px] md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-medium text-[#292D96]">
                List of Social Workers
              </p>

              <div className="flex items-center gap-3">
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

                {/* Add button */}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#292D96] px-4 py-2 text-sm font-medium text-white hover:opacity-95 active:opacity-90"
                >
                  <img
                    src="./images/add (1).png"
                    alt="Add"
                    className="h-4 w-4 object-contain"
                  />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Table container (fixed height + scroll, sticky header) */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
            <div className="max-h-[480px] overflow-auto rounded-xl">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-neutral-50">
                  <tr className="text-left text-sm font-semibold text-neutral-700">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Position</th>
                    <th className="px-4 py-3">Contact Number</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Forms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                  <tr className="hover:bg-neutral-50">
                    <td className="px-4 py-3">Rhodjien Caratao</td>
                    <td className="px-4 py-3">DSWD Social Worker</td>
                    <td className="px-4 py-3">+63 905 327 3129</td>
                    <td className="px-4 py-3">carataojoegie@gmail.com</td>
                    <td className="px-4 py-3">Active</td>
                    <td className="px-4 py-3">
                      <a href="#" className="font-medium text-blue-600 hover:underline">
                        View Form
                      </a>
                    </td>
                  </tr>
                  {/* more rows... */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
