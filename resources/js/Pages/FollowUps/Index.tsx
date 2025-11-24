import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface FollowUp {
    id: number;
    name: string;
    phone: string;
    priority: string;
    dueTime: string;
    notes: string;
}

export default function FollowUps({ auth }: PageProps) {
    const hotPriorityQueue: FollowUp[] = [
        { id: 1, name: 'Karim Chowdhury', phone: '+880 1819-587890', priority: 'GOOD', dueTime: 'Due: 22 Nov, 21:00', notes: '*Interested in the whitening kit, call back today.*' },
    ];

    const upcomingFollowUps: FollowUp[] = [
        { id: 2, name: 'Mishu Sabbir', phone: '+880 1712-334455', priority: 'GOOD', dueTime: 'Due: 23 Nov, 21:00', notes: '*Promised to pay via bKash tomorrow.*' },
    ];

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Follow Ups" />

            <div className="space-y-6">
                {/* Hot Priority Queue */}
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-lg font-bold text-gray-900">Hot Priority Queue</h2>
                    </div>

                    {hotPriorityQueue.map((followUp) => (
                        <div key={followUp.id} className="rounded-xl border-2 border-red-200 bg-red-50 p-6 shadow-sm">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{followUp.name}</h3>
                                    <p className="text-sm text-gray-600">{followUp.phone}</p>
                                </div>
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                    {followUp.priority}
                                </span>
                            </div>

                            <div className="mb-4 flex items-center gap-2 text-sm text-red-600">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {followUp.dueTime}
                            </div>

                            <p className="mb-4 text-sm italic text-gray-700">{followUp.notes}</p>

                            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/50 transition-all hover:shadow-xl">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Call Now
                            </button>
                        </div>
                    ))}
                </div>

                {/* Due Today & Overdue */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">Due Today & Overdue</h3>
                    </div>
                    <p className="text-center py-8 text-sm text-gray-500">No pending regular follow-ups for today.</p>
                </div>

                {/* Upcoming */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">Upcoming</h3>
                    </div>

                    <div className="space-y-4">
                        {upcomingFollowUps.map((followUp) => (
                            <div key={followUp.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                                <div className="mb-2 flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{followUp.name}</h4>
                                        <p className="text-sm text-gray-600">{followUp.phone}</p>
                                    </div>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                        {followUp.priority}
                                    </span>
                                </div>

                                <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {followUp.dueTime}
                                </div>

                                <p className="text-sm italic text-gray-600">{followUp.notes}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
