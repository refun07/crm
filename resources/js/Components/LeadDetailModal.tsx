import { useState } from 'react';

interface LeadDetailModalProps {
    lead: {
        id: number;
        name: string;
        phone: string;
        source: string;
        status: string;
        quality: string;
        assignedTo: string;
    };
    onClose: () => void;
}

export default function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'log-call' | 'message' | 'create-order'>('overview');
    const [messageTemplate, setMessageTemplate] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [note, setNote] = useState('');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'log-call', label: 'Log Call', icon: '📞' },
        { id: 'message', label: 'Message', icon: '💬' },
        { id: 'create-order', label: 'Create Order', icon: '🛒' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-xl font-bold text-gray-900">
                            {lead.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{lead.name}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                <span className="flex items-center gap-1">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {lead.phone}
                                </span>
                                <span>• 📍 {lead.source}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-700">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-white px-6">
                    <div className="flex gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'border-pink-600 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.id === 'message' && activeTab === 'message' ? (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                ) : (
                                    <span>{tab.icon}</span>
                                )}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-3 gap-6">
                            {/* Left Sidebar */}
                            <div className="space-y-4">
                                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-500/50">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Call Now
                                </button>

                                <div className="rounded-lg border border-gray-200 p-4">
                                    <p className="mb-2 text-xs font-medium uppercase text-gray-500">Current Status</p>
                                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                        {lead.status}
                                    </span>
                                </div>

                                <div className="rounded-lg border border-gray-200 p-4">
                                    <p className="mb-3 text-xs font-medium uppercase text-gray-500">Lead Quality</p>
                                    <div className="flex gap-2">
                                        <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                                            Good
                                        </button>
                                        <button className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-medium text-gray-900">
                                            Medium
                                        </button>
                                        <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                                            Poor
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="col-span-2 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Source</p>
                                        <p className="font-medium text-gray-900">{lead.source}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs font-medium uppercase text-gray-500">Assigned To</p>
                                        <p className="flex items-center gap-1 font-medium text-pink-600">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {lead.assignedTo}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium uppercase text-gray-500">Last Interaction</p>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        No interaction yet
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="font-semibold text-gray-900">Activity Log & Notes</h3>
                                    </div>

                                    <div className="mb-3 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type a note here..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                        />
                                        <button className="rounded-lg bg-gray-900 p-2 text-white hover:bg-gray-800">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    </div>

                                    <p className="text-center text-sm italic text-gray-400">No history yet.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'message' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <svg className="h-6 w-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                                <h3 className="text-lg font-bold text-gray-900">Send Message</h3>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium uppercase text-gray-500">
                                    Choose Template
                                </label>
                                <select
                                    value={messageTemplate}
                                    onChange={(e) => setMessageTemplate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                >
                                    <option value="">Select a template...</option>
                                    <option value="welcome">Welcome Message</option>
                                    <option value="followup">Follow-up Message</option>
                                    <option value="offer">Special Offer</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium uppercase text-gray-500">
                                    Message Content
                                </label>
                                <textarea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={6}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-4 font-semibold text-white shadow-lg hover:bg-green-600">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    WhatsApp
                                </button>
                                <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-4 font-semibold text-white shadow-lg hover:bg-blue-600">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                    SMS
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-400">
                                This will open the respective app on your device.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
