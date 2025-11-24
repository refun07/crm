import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler } from 'react';

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'agent',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/users');
    };

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Add New Member" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-6 flex items-center gap-4">
                    <Link
                        href="/admin/users"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Add New Member</h2>
                        <p className="text-sm text-gray-500">Create account for a new agent or manager</p>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-8 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Role Selection */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Select Role</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['agent', 'manager', 'super_admin'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setData('role', role)}
                                        className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${data.role === role
                                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                                            : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <span className="mb-1 text-lg capitalize font-bold">
                                            {role.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {role === 'agent' ? 'Sales & Calls' : role === 'manager' ? 'Team Lead' : 'Full Access'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                required
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                    required
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                            >
                                {processing ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}
