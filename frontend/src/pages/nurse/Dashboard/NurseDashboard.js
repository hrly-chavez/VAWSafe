import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import api from "../../../api/axios";

// Heroicons
import {
    ClipboardDocumentListIcon,
    UserIcon,
    BellIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export default function NurseDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [victimSummary, setVictimSummary] = useState({});
    const [sessionSummary, setSessionSummary] = useState({});
    const [monthlyReports, setMonthlyReports] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [overdueSessions, setOverdueSessions] = useState([]);
    const [violenceTypes, setViolenceTypes] = useState({});
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
                setOverdueSessions(data.overdue_sessions || []);
                setViolenceTypes(data.incident_summary?.violence_types || {});
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

    // Line chart (Monthly Victims)
    const labels = monthlyReports.map(r => r.month);
    const values = monthlyReports.map(r => Number(r.totalVictims) || 0);

    const lineData = {
        labels,
        datasets: [
            {
                label: "Monthly Victims (All Incidents)",
                data: values,
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.3)",
                pointBackgroundColor: "#1E40AF",
                pointRadius: 5,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Violence Type Breakdown (Bar chart)
    const violenceLabels = [
        "Physical Violence",
        "Physical Abused",
        "Psychological Violence",
        "Psychological Abuse",
        "Economic Abused",
        "Strandee",
        "Sexually Abused",
        "Sexually Exploited",
    ];
    const violenceValues = violenceLabels.map(label => violenceTypes[label] || 0);

    const violenceData = {
        labels: violenceLabels,
        datasets: [
            {
                label: "Cases",
                data: violenceValues,
                backgroundColor: [
                    "#F87171", "#FBBF24", "#60A5FA", "#A78BFA",
                    "#34D399", "#F472B6", "#F59E0B", "#3B82F6",
                ],
                borderColor: [
                    "#DC2626", "#D97706", "#2563EB", "#7C3AED",
                    "#059669", "#BE185D", "#B45309", "#1D4ED8",
                ],
                borderWidth: 2,
                borderRadius: 6,
            },
        ],
    };

    const barOptions = {
        indexAxis: "y",
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1, color: "#374151" }, grid: { color: "rgba(209,213,219,0.4)" } },
            y: { ticks: { color: "#374151" }, grid: { color: "rgba(209,213,219,0.4)" } },
        },
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

            {/* Middle Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Victims */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-[#292D96]">
                        Monthly Victims ({selectedYear})
                    </h2>
                    <div className="h-[340px]">
                        <Line
                            data={lineData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1,   
                                            precision: 0, 
                                        },
                                    },
                                    x: {
                                        ticks: {
                                            stepSize: 1,   
                                            precision: 0,  
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Violence Type Breakdown */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-lg font-semibold mb-4 text-[#292D96]">Violence Type Breakdown</h2>
                    <div className="h-[340px] flex justify-center items-center">
                        <Bar data={violenceData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Sessions */}
                <div className="p-6 bg-blue-50 rounded-xl border-4 border-blue-400 card-shadow transition hover:shadow-lg">
                    <div className="flex items-center mb-4">
                        <BellIcon className="w-6 h-6 text-blue-600 mr-2 animate-pulse" />
                        <h2 className="text-xl font-bold text-blue-800">Upcoming Due Sessions</h2>
                    </div>
                    <p className="text-sm text-blue-700 mb-4 border-b border-blue-200 pb-3">
                        These sessions require immediate medical attention and follow-up.
                    </p>
                    <div className="max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                        <div className="space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className="flex justify-between items-start p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                                    >
                                        <div className="flex flex-col">
                                            <p className="text-xs font-semibold text-blue-900">
                                                Session {n.sess_num} – {n.victim}
                                            </p>
                                            <p className="text-[11px] text-blue-700">{n.type}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-[11px] font-medium text-blue-800">
                                                {new Date(n.date).toLocaleDateString("en-US")}{" "}
                                                {new Date(n.date).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                            <Link
                                                to={`/nurse/sessions/${n.id}`}
                                                className="text-[11px] text-blue-600 hover:text-blue-800 underline"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-blue-600">No upcoming sessions.</p>
                            )}
                        </div>
                    </div>

                    <Link
                        to="/nurse/sessions"
                        className="block mt-6 text-center text-sm font-semibold text-blue-600 hover:text-blue-900 transition"
                    >
                        View All Upcoming Sessions →
                    </Link>
                </div>

                {/* Overdue Sessions (same styling as upcoming) */}
                <div className="p-6 bg-blue-50 rounded-xl border-4 border-blue-400 card-shadow transition hover:shadow-lg">
                    <div className="flex items-center mb-4">
                        <BellIcon className="w-6 h-6 text-blue-600 mr-2 animate-pulse" />
                        <h2 className="text-xl font-bold text-blue-800">Overdue Sessions</h2>
                    </div>
                    <p className="text-sm text-blue-700 mb-4 border-b border-blue-200 pb-3">
                        These sessions are past their due date and still incomplete.
                    </p>

                    <div className="max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                        <div className="space-y-4">
                            {overdueSessions.length > 0 ? (
                                overdueSessions.map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex justify-between items-start p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                                    >
                                        <div className="flex flex-col">
                                            <p className="text-xs font-semibold text-blue-900">
                                                Session {s.sess_num} – {s.victim}
                                            </p>
                                            <p className="text-[11px] text-blue-700">{s.type}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-[11px] font-medium text-blue-800">
                                                {new Date(s.date).toLocaleDateString("en-US")}{" "}
                                                {new Date(s.date).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                            <Link
                                                to={`/nurse/sessions/${s.id}`}
                                                className="text-[11px] text-blue-600 hover:text-blue-800 underline"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-blue-600">No overdue sessions.</p>
                            )}
                        </div>
                    </div>

                    <Link
                        to="/nurse/sessions"
                        className="block mt-6 text-center text-sm font-semibold text-blue-600 hover:text-blue-900 transition"
                    >
                        View All Overdue Sessions →
                    </Link>
                </div>
            </div>
        </div>
    );
}