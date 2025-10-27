import React, { useEffect, useState } from "react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  FolderIcon,
  CheckCircleIcon,
  ChartBarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../../api/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function DSWDDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [victimStats, setVictimStats] = useState({});
  const [incidentStats, setIncidentStats] = useState({});
  const [reportRows, setReportRows] = useState([]);
  const [monthlyVictimData, setMonthlyVictimData] = useState([]);
  const [violenceTypeData, setViolenceTypeData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/api/dswd/dswddashboard/summary");
        const data = res.data;

        setVictimStats(data.victim_summary);
        setIncidentStats(data.incident_summary);
        setReportRows(data.monthly_report_rows);
        setMonthlyVictimData(
          data.monthly_report_rows.map((row) => row.totalVictims)
        );

        setViolenceTypeData({
          labels: Object.keys(data.incident_summary.violence_types),
          datasets: [
            {
              label: "Cases",
              data: Object.values(data.incident_summary.violence_types),
              backgroundColor: [
                "rgba(245, 158, 11, 0.7)", // yellow 
                "rgba(16, 185, 129, 0.7)", // green 
                "rgba(59, 130, 246, 0.7)", // blue 
                "rgba(139, 92, 246, 0.7)", // purple 
              ],
              borderColor: [
                "#F59E0B",
                "#10B981",
                "#3B82F6",
                "#8B5CF6",
              ],
              borderWidth: 2,
              borderRadius: 6,
            },
          ],
        });
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ Line chart (Monthly Victim Reports)
  const lineData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    datasets: [
      {
        label: "Total Victims",
        data: monthlyVictimData,
        borderColor: "#6366F1",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "#6366F1";
          const gradient = ctx.createLinearGradient(0, 0, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(99,102,241,0.4)");
          gradient.addColorStop(1, "rgba(99,102,241,0.05)");
          return gradient;
        },
        pointBackgroundColor: "#4338CA",
        pointRadius: 5,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { color: "rgba(209, 213, 219, 0.4)" },
        ticks: { color: "#374151" },
      },
      y: {
        grid: { color: "rgba(209, 213, 219, 0.4)" },
        ticks: { color: "#374151" },
      },
    },
  };

  // ✅ Pie chart (Case Status)
  const pieData = {
    labels: ["Active", "Resolved"],
    datasets: [
      {
        data: [
          incidentStats.active_cases || 0,
          incidentStats.status_types?.Done || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.85)",
          "rgba(156, 163, 175, 0.85)",
        ],
        borderColor: ["#2563EB", "#6B7280"],
        hoverOffset: 10,
        borderWidth: 3,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    cutout: "55%", // donut style
  };

  // ✅ Doughnut chart (Age Groups)
  const ageGroupData = {
    labels: ["Minors", "Adults"],
    datasets: [
      {
        data: [victimStats.minors || 0, victimStats.adults || 0],
        backgroundColor: ["rgba(16,185,129,0.85)", "rgba(139,92,246,0.85)"],
        borderColor: ["#059669", "#7C3AED"],
        hoverOffset: 10,
        borderWidth: 3,
      },
    ],
  };

  const kpiCards = [
    {
      label: "Active Cases",
      value: incidentStats.active_cases || 0,
      bg: "from-yellow-400 to-orange-500",
      icon: <FolderIcon className="w-6 h-6 text-white" />,
    },
    {
      label: "Resolved This Month",
      value: incidentStats.status_types?.Done || 0,
      bg: "from-blue-400 to-blue-600",
      icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
    },
    {
      label: "Top Violence Type",
      value: incidentStats.top_violence_type || "N/A",
      bg: "from-green-400 to-emerald-500",
      icon: <ChartBarIcon className="w-6 h-6 text-white" />,
    },
    {
      label: "Female Victims (Minors)",
      value: victimStats.minors || 0,
      bg: "from-purple-400 to-pink-500",
      icon: <UserIcon className="w-6 h-6 text-white" />,
    },
  ];

  if (loading)
    return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;
  if (error)
    return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="px-6 py-8 space-y-10 bg-gray-50 font-sans">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl shadow-md text-white bg-gradient-to-r ${kpi.bg} transform hover:scale-105 transition`}
          >
            <h3 className="text-3xl font-bold flex items-center gap-3">
              {kpi.icon} {kpi.value}
            </h3>
            <p className="text-sm mt-2 font-semibold opacity-90">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* MIDDLE CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Violence Type */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#292D96]">
            Violence Type Breakdown
          </h2>
          <div className="h-[340px] flex justify-center items-center">
            <Bar data={violenceTypeData} options={barOptions} />
          </div>
        </div>

        {/* Case Status */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-center items-center">
          <h2 className="text-lg font-semibold mb-4 text-[#292D96]">Case Status</h2>
          <div className="w-[320px] h-[320px] flex justify-center items-center">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* BOTTOM CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Victims */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#292D96]">
            Monthly Victim Reports
          </h2>
          <div className="h-[340px]">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        {/* Age Group */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-center items-center">
          <h2 className="text-lg font-semibold mb-4 text-[#292D96]">
            Minors vs Adults
          </h2>
          <div className="w-[320px] h-[320px] flex justify-center items-center">
            <Doughnut data={ageGroupData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* MONTHLY REPORT TABLE */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-bold text-[#292D96] mb-4">
          Monthly Reports – Haven for Women
        </h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
            <thead className="text-[#292D96] font-semibold">
              <tr>
                <th className="px-4 py-2 border bg-blue-100">Month</th>
                <th className="px-4 py-2 border bg-blue-200">Total</th>
                <th className="px-4 py-2 border bg-yellow-200 text-yellow-800">Sexual</th>
                <th className="px-4 py-2 border bg-red-200 text-red-800">Physical</th>
                <th className="px-4 py-2 border bg-green-200 text-green-800">Psychological</th>
                <th className="px-4 py-2 border bg-indigo-200 text-indigo-800">Economic</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50`}
                >
                  <td className="px-4 py-2 border font-medium">{row.month}</td>
                  <td className="px-4 py-2 border bg-blue-50 font-semibold text-blue-800">{row.totalVictims}</td>
                  <td className="px-4 py-2 border bg-yellow-50 text-yellow-700 font-semibold">{row.sexual}</td>
                  <td className="px-4 py-2 border bg-red-50 text-red-700 font-semibold">{row.physical}</td>
                  <td className="px-4 py-2 border bg-green-50 text-green-700 font-semibold">{row.psychological}</td>
                  <td className="px-4 py-2 border bg-indigo-50 text-indigo-700 font-semibold">{row.economic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
