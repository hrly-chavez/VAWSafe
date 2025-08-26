// import Navbar from "./Navbar";
// import Sidebar from "./sidebar";
// import './css/DSWDNotification.css';

// export default function DSWDNotification () {
//     return (
//         <>
//             <Navbar />

//             <div className="main-container">
//                 <Sidebar />

//                 <div className="inside-container">
//                     <h2 className="notification">Notifications</h2>

//                     <p className="list-text">Notification Alerts</p>

//                     <div className="table-container">
//                         <table className="table-notification">
//                             <thead>
//                                 <th>Victim No.</th>
//                                 <th>Victim Name</th>
//                                 <th>Time</th>
//                                 <th>Date</th>
//                                 <th>Track Location</th>
//                                 <th>Map View</th>
//                             </thead>
//                             <tbody>
//                                 <tr>
//                                     <td>1</td>
//                                     <td>Rhodjien Caratao</td>
//                                     <td>9:30 am</td>
//                                     <td>7/5/2025</td>
//                                     <td style={{opacity: 0.5}}>Live Location Off</td>
//                                     <td style={{opacity: 0.5}}>None</td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </>
        
//     );
// }

import Navbar from "../Navbar";
import Sidebar from "../sidebar";

export default function DSWDNotification() {
  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        <Sidebar />

        <div className="flex-1 px-6 py-6 m-5 bg-white rounded-[20px] h-[400px] shadow-[0_2px_6px_0_rgba(0,0,0,0.1),0_-2px_6px_0_rgba(0,0,0,0.1)]">
          {/* Title */}
          <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">
            Notifications
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-sm font-medium text-[#292D96]">
            Notification Alerts
          </p>

          {/* Table container (fixed height + scroll, sticky header) */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
            <div className="max-h-[480px] overflow-auto rounded-xl">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-neutral-50">
                  <tr className="text-left text-sm font-semibold text-neutral-700">
                    <th className="px-4 py-3">Victim No.</th>
                    <th className="px-4 py-3">Victim Name</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Track Location</th>
                    <th className="px-4 py-3">Map View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                  <tr className="hover:bg-neutral-50">
                    <td className="px-4 py-3">1</td>
                    <td className="px-4 py-3">Rhodjien Caratao</td>
                    <td className="px-4 py-3">9:30 am</td>
                    <td className="px-4 py-3">7/5/2025</td>
                    <td className="px-4 py-3 opacity-50">Live Location Off</td>
                    <td className="px-4 py-3 opacity-50">None</td>
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
