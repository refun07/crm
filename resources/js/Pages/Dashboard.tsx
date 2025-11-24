import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardStats {
    todays_assignments: number;
    todays_calls: number;
    monthly_commission: number;
    monthly_conversions: number;
    user_rank: number;
    total_agents: number;
}

interface Activity {
    type: string;
    message: string;
    time: string;
    ip?: string;
}

export default function Dashboard({ auth }: PageProps) {
    const [stats, setStats] = useState<DashboardStats>({
        todays_assignments: 0,
        todays_calls: 0,
        monthly_commission: 0,
        monthly_conversions: 0,
        user_rank: 2,
        total_agents: 7,
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/dashboard/agent');
            const data = response.data;
            setStats({
                todays_assignments: data?.stats?.todays_assignments ?? 0,
                todays_calls: data?.stats?.todays_calls ?? 0,
                monthly_commission: data?.stats?.monthly_commission ?? 0,
                monthly_conversions: data?.stats?.monthly_orders ?? 0,
                user_rank: data?.user_rank ?? 0,
                total_agents: data?.leaderboard?.length ?? 0,
            });

            // Mock activities
            setActivities([
                { type: 'LOGIN', message: 'Login detected from', time: '23:05', ip: 'IP: 192.168.1.130' },
                { type: 'LOGIN', message: 'Login detected from', time: '21:89', ip: 'IP: 192.168.1.10' },
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!auth.user) return null;

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Dashboard" />

            {/* Greeting */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Hello, {auth.user.name}! 👋
                </h2>
                <p className="text-sm text-gray-500">Here's your performance overview for today.</p>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Assigned Today */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Assigned Today</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.todays_assignments}</p>
                            <p className="mt-1 text-xs text-green-600">7 total active</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Calls Completed */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Calls Completed</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.todays_calls}</p>
                            <p className="mt-1 text-xs text-blue-600">Today's Activity</p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Est. Commission */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Est. Commission</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">৳{stats.monthly_commission}</p>
                        </div>
                        <div className="rounded-lg bg-pink-50 p-3">
                            <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Conversions */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Conversions</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.monthly_conversions}</p>
                        </div>
                        <div className="rounded-lg bg-orange-50 p-3">
                            <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Action Required */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <h3 className="font-semibold text-gray-900">Action Required</h3>
                            </div>
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">1 Due</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Karim Chowdhury</p>
                                    <p className="text-sm text-gray-500">+880 1813-587898</p>
                                    <p className="text-xs text-red-600">21:05</p>
                                </div>
                            </div>
                            <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Call →
                            </button>
                        </div>
                    </div>

                    {/* New Leads Today */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="font-semibold text-gray-900">New Leads Today</h3>
                        </div>

                        <div className="space-y-3">
                            {[
                                { name: 'Tania Sultana', source: 'Facebook Ad', badge: 'NEW' },
                                { name: 'Rina Begum', source: 'Google Ads', badge: 'NEW' },
                                { name: 'Joya Ahsan', source: 'Website', badge: 'NEW' },
                            ].map((lead, index) => (
                                <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                                            {lead.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{lead.name}</p>
                                            <p className="text-xs text-gray-500">{lead.source}</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                                        {lead.badge}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Current Rank */}
                    <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 p-6 shadow-lg">
                        <p className="text-sm font-medium text-purple-200">Current Rank</p>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-5xl font-bold text-white">#{stats.user_rank}</span>
                            <span className="text-2xl text-purple-200">/ {stats.total_agents}</span>
                        </div>
                        <p className="mt-4 text-sm text-purple-100">📈 Keep closing deals to move up!</p>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                        </div>

                        <div className="space-y-4">
                            {activities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{activity.type}</p>
                                                <p className="text-sm text-gray-500">{activity.message}</p>
                                                {activity.ip && (
                                                    <p className="text-xs text-gray-400">{activity.ip}</p>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400">{activity.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
