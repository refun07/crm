import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
    created_at: string;
}

interface Props extends PageProps {
    users: User[];
}

export default function Index({ auth, users }: Props) {
    return (
        <SidebarLayout user={auth.user}>
            <Head title="User Management" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
                    <p className="text-sm text-gray-500">Manage your agents and managers</p>
                </div>
                <Link
                    href="/admin/users/create"
                    className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 font-medium text-white transition-colors hover:bg-pink-700"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Member
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Joined Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.roles.map((role) => (
                                        <span
                                            key={role.name}
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${role.name === 'super_admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : role.name === 'manager'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-pink-100 text-pink-700'
                                                }`}
                                        >
                                            {role.name.replace('_', ' ')}
                                        </span>
                                    ))}
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SidebarLayout>
    );
}
