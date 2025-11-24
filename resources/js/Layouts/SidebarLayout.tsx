import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Toaster, toast } from 'react-hot-toast';

interface SidebarLayoutProps extends PropsWithChildren {
    user: any;
}

export default function SidebarLayout({ user, children }: SidebarLayoutProps) {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { props, url } = usePage<any>();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    if (!user) return null;

    const isAgent = !user.roles?.some((r: any) => ['super_admin', 'manager'].includes(r.name));

    const isActive = (path: string) => url.startsWith(path);

    const linkClasses = (path: string) =>
        isActive(path)
            ? 'flex items-center gap-3 rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 px-4 py-3 text-white shadow-lg shadow-pink-500/50 transition-all hover:shadow-xl'
            : 'flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition-all hover:bg-gray-700/50 hover:text-white';

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white shadow-lg rounded-xl border border-gray-100 dark:border-gray-700',
                    duration: 4000,
                    style: {
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: 'white',
                        },
                        style: {
                            borderLeft: '4px solid #10B981',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: 'white',
                        },
                        style: {
                            borderLeft: '4px solid #EF4444',
                        },
                    },
                    loading: {
                        style: {
                            borderLeft: '4px solid #3B82F6',
                        },
                    },
                }}
            />
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col bg-gradient-to-b from-gray-900 to-gray-800 lg:flex">
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600">
                        <span className="text-lg font-bold text-white">KM</span>
                    </div>
                    <span className="text-lg font-semibold text-white">Klassy Missy</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-6">
                    <Link
                        href="/dashboard"
                        className={linkClasses('/dashboard')}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                        href="/leads"
                        className={linkClasses('/leads')}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium">My Leads</span>
                    </Link>

                    <Link
                        href="/orders"
                        className={linkClasses('/orders')}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="font-medium">Orders</span>
                    </Link>

                    <Link
                        href="/follow-ups"
                        className={linkClasses('/follow-ups')}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Follow Ups</span>
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            1
                        </span>
                    </Link>

                    {!isAgent && (
                        <>
                            <Link
                                href="/admin/imports"
                                className={linkClasses('/admin/imports')}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="font-medium">Import Leads</span>
                            </Link>

                            <Link
                                href="/admin/users"
                                className={linkClasses('/admin/users')}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="font-medium">Team Members</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* User Profile */}
                <div className="border-t border-gray-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-sm font-bold text-white">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-xs text-gray-400">AGENT</div>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-gray-700/50 hover:text-white"
                    >
                        {theme === 'dark' ? (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Light Mode
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                                Dark Mode
                            </>
                        )}
                    </button>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-gray-700/50 hover:text-white"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="fixed right-4 top-4 z-50 rounded-lg bg-gray-900 p-2 text-white lg:hidden"
            >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
