import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login() {
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleQuickLogin = (role: 'agent' | 'manager' | 'admin') => {
        let email = '';

        switch (role) {
            case 'agent':
                email = 'agent1@klassymissy.com';
                break;
            case 'manager':
                email = 'manager@klassymissy.com';
                break;
            case 'admin':
                email = 'admin@klassymissy.com';
                break;
        }

        // Set data and submit immediately
        data.email = email;
        data.password = 'password';

        post(route('login'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-4">
            <Head title="Log in" />

            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-xl">
                {/* Logo */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500">
                    <span className="text-xl font-bold text-white">KM</span>
                </div>

                {/* Title */}
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Klassy Missy CRM</h1>
                <p className="mb-8 text-sm text-gray-500">BD Telesales System</p>

                {/* Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={() => handleQuickLogin('agent')}
                        disabled={processing}
                        className="w-full rounded-lg bg-pink-600 px-4 py-3 font-semibold text-white transition-all hover:bg-pink-700 hover:shadow-lg disabled:opacity-50"
                    >
                        {processing && data.email === 'agent1@klassymissy.com' ? 'Logging in...' : 'Login as Agent'}
                    </button>

                    <button
                        onClick={() => handleQuickLogin('manager')}
                        disabled={processing}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50"
                    >
                        {processing && data.email === 'manager@klassymissy.com' ? 'Logging in...' : 'Login as Manager'}
                    </button>

                    <button
                        onClick={() => handleQuickLogin('admin')}
                        disabled={processing}
                        className="w-full rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50"
                    >
                        {processing && data.email === 'admin@klassymissy.com' ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="h-5 w-5 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </div>
                    <p className="text-xs text-gray-400">Secure System v1.0</p>
                </div>
            </div>
        </div>
    );
}
