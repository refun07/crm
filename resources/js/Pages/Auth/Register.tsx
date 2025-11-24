import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'agent',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-4">
            <Head title="Register" />

            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
                {/* Logo */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500">
                    <span className="text-xl font-bold text-white">KM</span>
                </div>

                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Create Account</h2>

                <form onSubmit={submit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
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
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                            required
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Register As</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setData('role', 'agent')}
                                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${data.role === 'agent'
                                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Agent
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('role', 'manager')}
                                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${data.role === 'manager'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Manager
                            </button>
                        </div>
                        {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                    </div>

                    {/* Password */}
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

                    {/* Confirm Password */}
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

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                    >
                        {processing ? 'Creating Account...' : 'Register'}
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        Already registered?{' '}
                        <Link href={route('login')} className="font-medium text-pink-600 hover:text-pink-500">
                            Log in here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
