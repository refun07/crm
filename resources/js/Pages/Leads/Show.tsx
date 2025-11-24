import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import axios from 'axios';
import OrderForm from '@/Components/OrderForm';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Lead {
    id: number;
    name: string;
    email: string | null;
    phone_last_4: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    status: string;
    quality_tag: string | null;
    notes: string | null;
    call_count: number;
    last_called_at: string | null;
    is_locked: boolean;
    created_at: string;
    call_logs?: CallLog[];
    follow_ups?: FollowUp[];
    order?: Order | null;
}

interface CallLog {
    id: number;
    outcome: string;
    notes: string | null;
    duration_seconds: number | null;
    called_at: string;
    agent: {
        name: string;
    };
}

interface FollowUp {
    id: number;
    scheduled_at: string;
    priority: string;
    status: string;
    notes: string | null;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    created_at: string;
}

interface ShowPageProps extends PageProps {
    lead: Lead;
}

export default function Show({ auth, lead: initialLead }: ShowPageProps) {
    const [lead, setLead] = useState(initialLead);
    const [showCallModal, setShowCallModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [showOrderForm, setShowOrderForm] = useState(false);

    if (!auth.user) return null;

    const { data: callData, setData: setCallData, post: postCall, processing: processingCall, reset: resetCall } = useForm({
        lead_id: lead.id,
        outcome: '',
        notes: '',
        duration_seconds: 0,
    });

    const { data: followUpData, setData: setFollowUpData, post: postFollowUp, processing: processingFollowUp, reset: resetFollowUp } = useForm({
        lead_id: lead.id,
        scheduled_at: '',
        priority: 'medium',
        notes: '',
    });

    const handleLogCall = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/call-logs', callData);
            alert('Call logged successfully!');
            setShowCallModal(false);
            resetCall();
            window.location.reload();
        } catch (error) {
            console.error('Error logging call:', error);
            alert('Failed to log call');
        }
    };

    const handleScheduleFollowUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/follow-ups', followUpData);
            alert('Follow-up scheduled successfully!');
            setShowFollowUpModal(false);
            resetFollowUp();
            window.location.reload();
        } catch (error) {
            console.error('Error scheduling follow-up:', error);
            alert('Failed to schedule follow-up');
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            new: 'bg-gray-100 text-gray-800',
            assigned: 'bg-blue-100 text-blue-800',
            called: 'bg-yellow-100 text-yellow-800',
            interested: 'bg-green-100 text-green-800',
            follow_up: 'bg-purple-100 text-purple-800',
            converted: 'bg-emerald-100 text-emerald-800',
            invalid: 'bg-red-100 text-red-800',
            not_interested: 'bg-gray-100 text-gray-600',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <SidebarLayout user={auth.user}>
            <Head title={`Lead: ${lead.name}`} />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900">
                    Lead Details: {lead.name}
                </h2>
                <span className={`rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${getStatusColor(lead.status)}`}>
                    {lead.status.replace('_', ' ')}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Contact Information */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="mt-1 text-base font-medium text-gray-900">{lead.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-base font-medium text-gray-900">{lead.email || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                    <dd className="mt-1 text-base font-medium text-gray-900">***{lead.phone_last_4 || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Quality Tag</dt>
                                    <dd className="mt-1">
                                        {lead.quality_tag ? (
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${lead.quality_tag === 'good' ? 'bg-green-100 text-green-800' :
                                                lead.quality_tag === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {lead.quality_tag.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">Not set</span>
                                        )}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                                    <dd className="mt-1 text-base text-gray-900">
                                        {[lead.address, lead.city, lead.state, lead.zip_code].filter(Boolean).join(', ') || 'N/A'}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                    <dd className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                                        {lead.notes || 'No notes available.'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Call History */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Call History ({lead.call_count})</h3>
                            <button
                                onClick={() => setShowCallModal(true)}
                                className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
                            >
                                Log Call
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {lead.call_logs && lead.call_logs.length > 0 ? (
                                    lead.call_logs.map((log) => (
                                        <div key={log.id} className="flex items-start gap-4 rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900">{log.outcome.replace('_', ' ')}</p>
                                                    <span className="text-xs text-gray-500">{new Date(log.called_at).toLocaleString()}</span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">{log.notes || 'No notes'}</p>
                                                {log.duration_seconds && (
                                                    <p className="mt-1 text-xs text-gray-400">Duration: {log.duration_seconds}s</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No calls logged yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Quick Actions */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <button
                                onClick={() => setShowCallModal(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 shadow-sm hover:shadow"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Log Call
                            </button>
                            <button
                                onClick={() => setShowFollowUpModal(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition-all hover:bg-purple-700 shadow-sm hover:shadow"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Schedule Follow-up
                            </button>
                            {lead.status !== 'converted' && (
                                <button
                                    onClick={() => setShowOrderForm(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-all hover:bg-green-700 shadow-sm hover:shadow"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Convert to Order
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Stats</h3>
                        </div>
                        <div className="p-6">
                            <dl className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <dt className="text-sm text-gray-500">Total Calls</dt>
                                    <dd className="text-lg font-bold text-gray-900">{lead.call_count}</dd>
                                </div>
                                <div className="flex justify-between items-center">
                                    <dt className="text-sm text-gray-500">Last Called</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {lead.last_called_at ? new Date(lead.last_called_at).toLocaleDateString() : 'Never'}
                                    </dd>
                                </div>
                                <div className="flex justify-between items-center">
                                    <dt className="text-sm text-gray-500">Locked</dt>
                                    <dd className="text-sm font-medium text-gray-900">
                                        {lead.is_locked ? (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                </svg>
                                                No
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Order Info */}
                    {lead.order && (
                        <div className="rounded-xl bg-green-50 border border-green-100 shadow-sm">
                            <div className="border-b border-green-100 px-6 py-4">
                                <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Converted
                                </h3>
                            </div>
                            <div className="p-6">
                                <dl className="space-y-2">
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-green-600">Order #</dt>
                                        <dd className="font-medium text-green-900">{lead.order.order_number}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-green-600">Amount</dt>
                                        <dd className="font-bold text-green-900">${lead.order.total_amount.toFixed(2)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Log Call Modal */}
            <DarkModal show={showCallModal} onClose={() => setShowCallModal(false)} title="Log Call">
                <form onSubmit={handleLogCall} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="outcome" value="Outcome *" className="text-gray-300" />
                        <select
                            id="outcome"
                            value={callData.outcome}
                            onChange={(e) => setCallData('outcome', e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-[#0f172a] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select outcome...</option>
                            <option value="connected">Connected</option>
                            <option value="not_connected">Not Connected</option>
                            <option value="wrong_number">Wrong Number</option>
                            <option value="no_interest">No Interest</option>
                            <option value="interested">Interested</option>
                            <option value="follow_up_scheduled">Follow-up Scheduled</option>
                            <option value="converted">Converted</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="duration" value="Duration (seconds)" className="text-gray-300" />
                        <TextInput
                            id="duration"
                            type="number"
                            value={callData.duration_seconds}
                            onChange={(e) => setCallData('duration_seconds', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-[#0f172a] text-white focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="notes" value="Notes" className="text-gray-300" />
                        <textarea
                            id="notes"
                            value={callData.notes}
                            onChange={(e) => setCallData('notes', e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-[#0f172a] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-700 pt-4">
                        <SecondaryButton
                            onClick={() => setShowCallModal(false)}
                            className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            CANCEL
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={processingCall}
                            className="bg-gray-200 text-gray-900 hover:bg-white"
                        >
                            {processingCall ? 'SAVING...' : 'SAVE CALL LOG'}
                        </PrimaryButton>
                    </div>
                </form>
            </DarkModal>

            {/* Follow Up Modal */}
            <DarkModal show={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} title="Schedule Follow-up">
                <form onSubmit={handleScheduleFollowUp} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="scheduled_at" value="Date & Time *" className="text-gray-300" />
                        <TextInput
                            id="scheduled_at"
                            type="datetime-local"
                            value={followUpData.scheduled_at}
                            onChange={(e) => setFollowUpData('scheduled_at', e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-[#0f172a] text-white focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="priority" value="Priority" className="text-gray-300" />
                        <select
                            id="priority"
                            value={followUpData.priority}
                            onChange={(e) => setFollowUpData('priority', e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-[#0f172a] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="notes" value="Notes" className="text-gray-300" />
                        <textarea
                            id="notes"
                            value={followUpData.notes}
                            onChange={(e) => setFollowUpData('notes', e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-[#0f172a] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-700 pt-4">
                        <SecondaryButton
                            onClick={() => setShowFollowUpModal(false)}
                            className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            CANCEL
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={processingFollowUp}
                            className="bg-gray-200 text-gray-900 hover:bg-white"
                        >
                            {processingFollowUp ? 'SCHEDULING...' : 'SCHEDULE FOLLOW-UP'}
                        </PrimaryButton>
                    </div>
                </form>
            </DarkModal>

            {/* Order Form Modal */}
            {showOrderForm && (
                <OrderForm
                    leadId={lead.id}
                    leadName={lead.name}
                    onSuccess={() => {
                        setShowOrderForm(false);
                        window.location.reload();
                    }}
                    onCancel={() => setShowOrderForm(false)}
                />
            )}
        </SidebarLayout>
    );
}
