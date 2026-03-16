"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type AdminMetrics = {
    total_users: number;
    total_predictions: number;
    total_feedbacks: number;
};

type UserAccount = {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
};

type PredictionFeedback = {
    id: number;
    prediction_id: number;
    is_correct: boolean;
    actual_risk_level: string | null;
    comments: string | null;
    created_at: string;
    prediction: {
        age_months: number;
        gender: string;
        risk_level: string;
        risk_probability: number;
    };
};

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"metrics" | "users" | "feedback">("feedback");

    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [feedback, setFeedback] = useState<PredictionFeedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        if (!user.is_admin) {
            router.push("/");
            return;
        }

        const fetchAdminData = async () => {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            try {
                const [metricsRes, usersRes, fbRes] = await Promise.all([
                    fetch("http://localhost:8000/api/admin/metrics", { headers }),
                    fetch("http://localhost:8000/api/admin/users", { headers }),
                    fetch("http://localhost:8000/api/admin/feedback", { headers })
                ]);

                if (!metricsRes.ok || !usersRes.ok || !fbRes.ok) {
                    throw new Error("Failed to authenticate with Admin APIs.");
                }

                setMetrics(await metricsRes.json());
                setUsers(await usersRes.json());
                setFeedback(await fbRes.json());
            } catch (err: any) {
                setError(err.message || "Error fetching admin data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [user, router]);

    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/toggle-status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to toggle user status.");
            }

            // Optimistically update the UI to instantly reflect the new status
            setUsers(users.map(u => 
                u.id === userId ? { ...u, is_active: !currentStatus } : u
            ));
            
        } catch (err: any) {
            alert(err.message || "An error occurred while communicating with the server.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-20 p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">System Administration</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage clinical users, supervise system logs, and review ML diagnostics overrides.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px">
                    <button
                        onClick={() => setActiveTab("metrics")}
                        className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "metrics" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                        System Metrics
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "users" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab("feedback")}
                        className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === "feedback" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                        Model Feedback (MLOps)
                    </button>
                </div>

                {/* --- TAB: METRICS --- */}
                {activeTab === "metrics" && metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Registered Clinicians</div>
                            <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">{metrics.total_users}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total API Predictions</div>
                            <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">{metrics.total_predictions}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Disputed Assessments</div>
                            <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{metrics.total_feedbacks}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg> Sourced for next AI tuning cycle</div>
                        </div>
                    </div>
                )}

                {/* --- TAB: USERS --- */}
                {activeTab === "users" && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Username</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono">#{u.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{u.username}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {u.is_active ?
                                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold">Active</span>
                                                :
                                                <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-full text-xs font-bold">Suspended</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                                                className={`font-semibold text-xs hover:underline disabled:opacity-50 ${u.is_active ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                            >
                                                {u.is_active ? "Revoke Access" : "Grant Access"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB: FEEDBACK --- */}
                {activeTab === "feedback" && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        {feedback.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                                No clinical feedback overrides have been submitted yet.
                            </div>
                        ) : (
                            feedback.map((fb) => (
                                <div key={fb.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-start">
                                    <div className="shrink-0 w-full md:w-48">
                                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Observation #{fb.id}</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">{new Date(fb.created_at).toLocaleDateString()}</div>
                                    </div>

                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Original AI Prediction</div>
                                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {fb.prediction.risk_level}
                                                    <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full font-mono">{fb.prediction.risk_probability.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                                <div className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                                    Clinician Override
                                                </div>
                                                <div className="font-semibold text-rose-700 dark:text-rose-300">
                                                    {fb.actual_risk_level || "No specific level recorded"}
                                                </div>
                                            </div>
                                        </div>

                                        {fb.comments && (
                                            <div className="text-sm text-slate-700 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-lg italic border-l-4 border-indigo-300 dark:border-indigo-800">
                                                "{fb.comments}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
