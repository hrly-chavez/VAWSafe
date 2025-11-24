import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";
import api from "../../../api/axios";

// Heroicons
import {
    ClipboardDocumentListIcon,
    UserIcon,
    BellIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function NurseDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [victimSummary, setVictimSummary] = useState({});
    const [sessionSummary, setSessionSummary] = useState({});
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get(`/api/nurse/dashboard/summary/?year=${selectedYear}`);
                const data = res.data;
                setVictimSummary(data.victim_summary || {});
                setSessionSummary(data.session_summary || {});
                setMonthlyReports(data.monthly_report_rows || []);
                setNotifications(data.upcoming_sessions || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [selectedYear]);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;
    if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

    const kpiCards = [
        {
            label: "Total Assigned Sessions",
            value: sessionSummary.total_assigned_sessions || 0,
            bg: "from-green-400 to-emerald-500",
            icon: <ClipboardDocumentListIcon className="w-6 h-6 text-white" />,
        },
        {
            label: "Sessions This Week",
            value: sessionSummary.sessions_this_week || 0,
            bg: "from-blue-400 to-blue-600",
            icon: <ClipboardDocumentListIcon className="w-6 h-6 text-white" />,
        },
        {
            label: "Pending Sessions",
            value: sessionSummary.pending_sessions || 0,
            bg: "from-yellow-400 to-orange-500",
            icon: <ClipboardDocumentListIcon className="w-6 h-6 text-white" />,
        },
        {
            label: "Ongoing Sessions",
            value: sessionSummary.ongoing_sessions || 0,
            bg: "from-purple-400 to-pink-500",
            icon: <UserIcon className="w-6 h-6 text-white" />,
        },
    ];

    // ✅ Chart uses totalVictims from backend
    const labels = monthlyReports.map(r => r.month);
    const values = monthlyReports.map(r => Number(r.totalVictims) || 0);

    const lineData = {
        labels,
        datasets: [
            {
                label: "Monthly Victims (All Incidents)",
                data: values,
                borderColor: "#F59E0B",
                backgroundColor: "rgba(245, 158, 11, 0.3)",
                pointBackgroundColor: "#B45309",
                pointRadius: 5,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="p-4 md:p-8 space-y-8 font-inter bg-[#f7f9fc]">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-extrabold text-gray-800">Nurse Dashboard</h1>
                <p className="text-gray-500 mt-1">Session monitoring and medical progress overview.</p>
            </header>

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

            {/* Chart + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 p-6 bg-white rounded-xl card-shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Monthly Victims ({selectedYear})
                        </h2>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                            {[2023, 2024, 2025].map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="h-96">
                        <Line
                            data={lineData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { beginAtZero: true },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Notifications */}
                <div className="lg:col-span-1 p-6 bg-amber-50 rounded-xl border-4 border-amber-400 card-shadow transition hover:shadow-lg">
                    <div className="flex items-center mb-4">
                        <BellIcon className="w-6 h-6 text-amber-600 mr-2 animate-pulse" />
                        <h2 className="text-xl font-bold text-amber-800">Upcoming Due Sessions</h2>
                    </div>
                    <p className="text-sm text-amber-700 mb-4 border-b border-amber-200 pb-3">
                        These sessions require immediate medical attention and follow-up.
                    </p>

                    <div className="space-y-4">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className="flex justify-between items-center p-3 bg-amber-100 rounded-lg hover:bg-amber-200 transition"
                                >
                                    <div>
                                        <p className="font-semibold text-amber-900">
                                            Session {n.sess_num} - {n.victim}
                                        </p>
                                        <p className="text-xs text-amber-700">{n.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-amber-800">
                                            {new Date(n.date).toLocaleDateString("en-US")}
                                        </p>
                                        <Link
                                            to={`/nurse/sessions/${n.id}`}
                                            className="text-xs text-amber-600 hover:text-amber-800 underline"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-amber-600">No sessions near due date.</p>
                        )}
                    </div>

                    <Link
                        to="/nurse/sessions"
                        className="block mt-6 text-center text-sm font-semibold text-amber-600 hover:text-amber-900 transition"
                    >
                        View All Due Sessions →
                    </Link>
                </div>
            </div>
        </div>
    );
}
