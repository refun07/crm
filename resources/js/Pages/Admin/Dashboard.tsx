import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface AdminStats {
    total_leads: number;
    new_leads: number;
    assigned_leads: number;
    converted_leads: number;
    todays_assignments: number;
    todays_calls: number;
    todays_conversions: number;
    monthly_conversions: number;
    monthly_revenue: number;
    conversion_rate: number;
}

interface AgentPerformance {
    id: number;
    name: string;
    orders_count: number;
    call_logs_count: number;
}

interface LeadsByStatus {
    status: string;
    count: number;
}

export default function AdminDashboard({ auth }: PageProps) {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
    const [leadsByStatus, setLeadsByStatus] = useState<LeadsByStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/dashboard/admin');
            setStats(response.data.stats);
            setAgentPerformance(response.data.agent_performance);
            setLeadsByStatus(response.data.leads_by_status);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoDistribute = async () => {
        if (!confirm('Auto-distribute new leads to active agents?')) return;

        try {
            const response = await axios.post('/api/admin/assignments/auto-distribute');
            alert(response.data.message);
            fetchDashboardData();
        } catch (error: any) {
            console.error('Error distributing leads:', error);
            alert(error.response?.data?.message || 'Failed to distribute leads');
        }
    };

    const handleRecycleLeads = async () => {
        if (!confirm('Recycle unworked leads back to pool?')) return;

        try {
            const response = await axios.post('/api/admin/assignments/recycle');
            alert(response.data.message);
            fetchDashboardData();
        } catch (error: any) {
            console.error('Error recycling leads:', error);
            alert(error.response?.data?.message || 'Failed to recycle leads');
        }
    };

    if (!auth.user) return null;

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            {/* Header Section */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Admin Overview
                    </h2>
                    <p className="text-sm text-gray-500">System performance and agent tracking</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleAutoDistribute}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Auto-Distribute
                    </button>
                    <button
                        onClick={handleRecycleLeads}
                        className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Recycle Leads
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Leads */}
                <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Leads</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.total_leads || 0}</p>
                        </div>
                        <div className="rounded-lg bg-purple-50 p-3">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">৳{stats?.monthly_revenue?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.conversion_rate?.toFixed(1) || '0.0'}%</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Active Agents */}
                <div className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Agents</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{agentPerformance.length}</p>
                        </div>
                        <div className="rounded-lg bg-pink-50 p-3">
                            <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column - Agent Performance */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Agent Performance</h3>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">This Month</span>
                        </div>

                        <div className="space-y-4">
                            {agentPerformance.map((agent, index) => (
                                <div key={agent.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${index === 0 ? 'bg-yellow-400' :
                                            index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{agent.name}</p>
                                            <p className="text-sm text-gray-500">{agent.call_logs_count} calls made</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">{agent.orders_count}</p>
                                        <p className="text-xs text-gray-500">Orders</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Lead Status */}
                <div className="space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="mb-6 text-lg font-bold text-gray-900">Lead Distribution</h3>

                        <div className="space-y-4">
                            {leadsByStatus.map((item) => (
                                <div key={item.status} className="group">
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-medium capitalize text-gray-700">{item.status.replace('_', ' ')}</span>
                                        <span className="font-bold text-gray-900">{item.count}</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-pink-500 transition-all group-hover:bg-pink-600"
                                            style={{ width: `${(item.count / (stats?.total_leads || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-lg">
                        <h3 className="mb-2 text-lg font-bold">System Status</h3>
                        <div className="mb-4 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                            </span>
                            <span className="text-sm text-gray-300">All systems operational</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
                            <div>
                                <p className="text-xs text-gray-400">Server Time</p>
                                <p className="font-mono text-sm">14:05 UTC</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Database</p>
                                <p className="text-sm text-green-400">Connected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
