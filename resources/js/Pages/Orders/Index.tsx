import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Order {
    id: string;
    customer: string;
    product: string;
    quantity: number;
    date: string;
    amount: number;
    status: string;
    payment: string;
}

export default function Orders({ auth }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');

    // Mock data
    const orders: Order[] = [
        { id: '#D-1881', customer: 'Sujon Khan', product: 'Klassy Missy Pro Bundle', quantity: 1, date: '15/11/2025', amount: 2560, status: 'Completed', payment: 'COD' },
        { id: '#D-1886', customer: 'Mishu Sabbir', product: 'Sunblock SPF 50', quantity: 1, date: '12/11/2025', amount: 710, status: 'Completed', payment: 'bKash' },
    ];

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Orders" />

            <div className="rounded-xl bg-white p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-pink-100 p-3">
                            <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Orders</h2>
                            <p className="text-sm text-gray-500">Manage and track all customer orders</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">TOTAL REVENUE (VERIFIED)</p>
                        <p className="text-2xl font-bold text-green-600">৳{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search Order ID, Customer, or Product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        >
                            <option>All Status</option>
                            <option>Completed</option>
                            <option>Pending</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                <th className="pb-3">ORDER ID</th>
                                <th className="pb-3">CUSTOMER</th>
                                <th className="pb-3">PRODUCT DETAILS</th>
                                <th className="pb-3">DATE</th>
                                <th className="pb-3">AMOUNT</th>
                                <th className="pb-3">STATUS</th>
                                <th className="pb-3">PAYMENT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="py-4 font-medium text-gray-900">{order.id}</td>
                                    <td className="py-4 text-gray-900">{order.customer}</td>
                                    <td className="py-4">
                                        <div className="text-sm text-gray-900">{order.product}</div>
                                        <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {order.date}
                                        </div>
                                    </td>
                                    <td className="py-4 font-semibold text-gray-900">৳{order.amount.toLocaleString()}</td>
                                    <td className="py-4">
                                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm text-gray-600">{order.payment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State if no orders */}
                {orders.length === 0 && (
                    <div className="py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No orders found</p>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
