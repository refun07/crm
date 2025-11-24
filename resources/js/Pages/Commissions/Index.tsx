import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    created_at: string;
    lead: {
        name: string;
    };
    commission: {
        commission_amount: number;
        calculation_type: string;
        status: string;
    } | null;
}

export default function Commissions({ auth }: PageProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({
        total_orders: 0,
        total_sales: 0,
        total_commission: 0,
        pending_commission: 0,
    });
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState({
        from: '',
        to: '',
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (dateFilter.from) params.from_date = dateFilter.from;
            if (dateFilter.to) params.to_date = dateFilter.to;

            const response = await axios.get('/api/orders', { params });
            const ordersData = response.data.orders.data || response.data.orders;
            setOrders(ordersData);

            // Calculate stats
            const totalSales = ordersData.reduce((sum: number, o: Order) => sum + parseFloat(o.total_amount.toString()), 0);
            const totalCommission = ordersData.reduce(
                (sum: number, o: Order) => sum + (o.commission ? parseFloat(o.commission.commission_amount.toString()) : 0),
                0
            );
            const pendingCommission = ordersData
                .filter((o: Order) => o.commission?.status === 'pending')
                .reduce((sum: number, o: Order) => sum + (o.commission ? parseFloat(o.commission.commission_amount.toString()) : 0), 0);

            setStats({
                total_orders: ordersData.length,
                total_sales: totalSales,
                total_commission: totalCommission,
                pending_commission: pendingCommission,
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        fetchOrders();
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Commissions" />

            <div className="mb-6 flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900">
                    My Commissions & Orders
                </h2>
            </div>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="overflow-hidden rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Orders
                            </div>
                            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                {stats.total_orders}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Sales
                            </div>
                            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                ${stats.total_sales.toFixed(2)}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-6 shadow">
                            <div className="text-sm font-medium text-green-100">
                                Total Commission
                            </div>
                            <div className="mt-2 text-3xl font-bold text-white">
                                ${stats.total_commission.toFixed(2)}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 shadow">
                            <div className="text-sm font-medium text-yellow-100">
                                Pending Commission
                            </div>
                            <div className="mt-2 text-3xl font-bold text-white">
                                ${stats.pending_commission.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={dateFilter.from}
                                    onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={dateFilter.to}
                                    onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={handleFilter}
                                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Order History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Order #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Order Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Commission
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.order_number}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {order.lead.name}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                                    ${order.total_amount.toFixed(2)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                                                    ${order.commission?.commission_amount.toFixed(2) || '0.00'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {order.commission?.calculation_type || 'N/A'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {order.commission && (
                                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.commission.status)}`}>
                                                            {order.commission.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
