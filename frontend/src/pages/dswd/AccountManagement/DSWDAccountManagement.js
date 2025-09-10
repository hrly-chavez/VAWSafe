import Navbar from "../../Navbar";
import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import axios from "axios";

export default function DSWDAccountManagement() {
  const [account, setAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        // Use global axios instance
        const res = await api.get("/api/dswd/desk-officer/", {
          params: search ? { q: search } : {},
        });

        // Handle array or paginated response
        setAccount(Array.isArray(res.data) ? res.data : res.data.results ?? []);
        console.log("Fetched Desk Officer account:", res.data); // optional debug log

      } catch (e) {
        console.error("Error fetching Desk Officer:", e);
        setErr("Failed to load Desk Officer.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search]);

  const rows = useMemo(() => account, [account]);

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 px-6 py-6 m-5 bg-white rounded-[20px] h-[400px] shadow-[0_2px_6px_0_rgba(0,0,0,0.1),0_-2px_6px_0_rgba(0,0,0,0.1)]">
          <h2 className="text-2xl font-semibold font-[Poppins] tracking-tight text-[#292D96]">
            Account Management
          </h2>

          <p className="text-lg font-medium text-[#292D96] mt-5">
            Desk Officer
          </p>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
            <div className="max-h-[480px] overflow-auto rounded-xl">
              <table className="w-full table-auto border-collapse">
                <thead className="sticky top-0 z-10 bg-neutral-50">
                  <tr className="text-left text-sm font-semibold text-neutral-700">
                    <th className="px-4 py-3">Victim No.</th>
                    <th className="px-4 py-3">Victim Name</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm text-neutral-800">
                  <tr className="hover:bg-neutral-50">
                    <td className="px-4 py-3">1</td>
                    <td className="px-4 py-3">Rhodjien Caratao</td>
                    <td className="px-4 py-3">rhodjiencaratao1</td>
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
