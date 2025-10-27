import { useState } from "react";
import { Line, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);


// Sample dynamic data
const monthlyVictimData = {
  2023: [3, 5, 2, 4, 6, 7, 5, 3, 4, 6, 2, 1],
  2024: [4, 6, 3, 5, 8, 9, 6, 4, 5, 7, 3, 2],
};

const violenceTypeData = {
  labels: ["Sexual", "Physical", "Psychological", "Economic"],
  datasets: [
    {
      label: "Cases",
      data: [12, 18, 9, 5],
      backgroundColor: ["#F59E0B", "#EF4444", "#10B981", "#6366F1"],
    },
  ],
};

const reportRows = [
  {
    month: "January",
    totalVictims: 6,
    sexual: 2,
    physical: 3,
    psychological: 1,
    economic: 0,
  },
  {
    month: "February",
    totalVictims: 5,
    sexual: 1,
    physical: 2,
    psychological: 1,
    economic: 1,
  },
];

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState("2024");

  const lineData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    datasets: [
      {
        label: "Total Victims",
        data: monthlyVictimData[selectedYear],
        borderColor: "#3B82F6",
        backgroundColor: "#93C5FD",
        pointBackgroundColor: "#1D4ED8",
        fill: true,
        tension: 0.3,
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
  };

  return (
    <div className="px-6 py-8 space-y-10 bg-gray-50 font-sans">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Cases", value: 28 },
          { label: "Resolved This Month", value: 6 },
          { label: "Top Violence Type", value: "Physical (45%)" },
          { label: "Pending Sessions", value: 3 },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-white shadow hover:shadow-md transition"
          >
            <h3 className="text-2xl font-bold text-blue-800">{kpi.value}</h3>
            <p className="text-sm mt-2 font-semibold text-blue-700">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#292D96]">
            Monthly Victim Reports ({selectedYear})
          </h2>
          <div className="h-[300px]">
            <Line
              data={lineData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-[#292D96]">
            Violence Type Breakdown
          </h2>
          <div className="h-[300px]">
            <Bar data={violenceTypeData} options={barOptions} />
          </div>
        </div>
      </div>
      {/* Monthly Report Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-bold text-[#292D96]">
            Monthly Reports – Haven for Women
          </h2>
          <div className="mt-2 sm:mt-0">
            <label htmlFor="year" className="mr-2 text-sm font-medium text-gray-700">
              Year:
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#292D96]"
            >
              {Object.keys(monthlyVictimData).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
