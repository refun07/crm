import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DarkModal from '@/Components/DarkModal';
import EditLeadModal from '@/Components/EditLeadModal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Lead {
    id: number;
    name: string;
    email: string;
    phone: string;
    phone_last_4: string;
    phone_first_4: string;
    status: string;
    source: string;
    notes?: string;
    created_at: string;
    is_online?: boolean;
    assigned_agent?: {
        name: string;
    };
}

interface LeadsPageProps extends PageProps {
    leads: {
        data: Lead[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        status?: string;
        quality_tag?: string;
        search?: string;
        date_range?: string;
    };
}

export default function MyLeads({ auth, leads, filters }: LeadsPageProps) {
    const [showCallModal, setShowCallModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showLeadDrawer, setShowLeadDrawer] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'log-call' | 'message' | 'create-order'>('overview');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [processing, setProcessing] = useState(false);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [currentStatus, setCurrentStatus] = useState(filters.status || 'all');
    const [dateRange, setDateRange] = useState(filters.date_range || 'all');
    const [isFirstRender, setIsFirstRender] = useState(true);

    // Server-side search with debounce
    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get('/leads', {
                search: searchTerm,
                status: currentStatus,
                date_range: dateRange
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, currentStatus, dateRange]);

    // Use real data
    const leadsList = leads.data;

    const { data: callData, setData: setCallData, reset: resetCall } = useForm({
        lead_id: 0,
        outcome: '',
        notes: '',
        duration_seconds: 0,
    });

    const { data: messageData, setData: setMessageData, reset: resetMessage } = useForm({
        lead_id: 0,
        message: '',
    });

    const [leadQuality, setLeadQuality] = useState<'good' | 'medium' | 'poor'>('medium');
    const [activityNote, setActivityNote] = useState('');
    const [messageTemplate, setMessageTemplate] = useState('');

    const handleCallClick = (lead: Lead) => {
        setSelectedLead(lead);
        setCallData('lead_id', lead.id);
        setShowCallModal(true);
    };

    const handleMessageClick = (lead: Lead) => {
        setSelectedLead(lead);
        setShowMessageModal(true);
    };

    const handleEditClick = (lead: Lead) => {
        setSelectedLead(lead);
        setShowEditModal(true);
    };

    const handleViewDetails = (lead: Lead) => {
        setSelectedLead(lead);
        setActiveTab('overview');
        setShowLeadDrawer(true);
    };

    const handleLogCall = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await axios.post('/api/call-logs', callData);
            toast.success('Call logged successfully!');
            setShowCallModal(false);
            resetCall();
        } catch (error) {
            console.error('Error logging call:', error);
            toast.error('Failed to log call');
        } finally {
            setProcessing(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            // You can create an API endpoint for messages or use notes
            await axios.post('/api/lead-notes', messageData);
            toast.success('Message sent successfully!');
            setShowMessageModal(false);
            resetMessage();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setProcessing(false);
        }
    };

    const handleAddNote = async () => {
        if (!activityNote.trim() || !selectedLead) return;

        setProcessing(true);
        try {
            await axios.post('/api/lead-notes', {
                lead_id: selectedLead.id,
                note: activityNote,
            });
            toast.success('Note added successfully!');
            setActivityNote('');
        } catch (error) {
            console.error('Error adding note:', error);
            toast.error('Failed to add note');
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateLeadQuality = async (quality: 'good' | 'medium' | 'poor') => {
        if (!selectedLead) return;

        setLeadQuality(quality);
        try {
            await axios.patch(`/ leads / ${selectedLead.id} `, {
                quality_tag: quality,
            });
            toast.success('Lead quality updated!');
        } catch (error) {
            console.error('Error updating lead quality:', error);
            toast.error('Failed to update lead quality');
        }
    };

    const handleWhatsAppMessage = () => {
        if (!messageData.message) {
            toast.error('Please enter a message first');
            return;
        }

        const phone = selectedLead?.phone_last_4; // TODO: Use full phone number
        // ... WhatsApp logic
    };

    const handleSMSMessage = () => {
        if (!selectedLead || !messageData.message.trim()) {
            alert('Please enter a message first');
            return;
        }

        const phone = `+ 880${selectedLead.phone_last_4} `; // Adjust based on your phone format
        const message = encodeURIComponent(messageData.message);
        window.location.href = `sms:${phone}?body = ${message} `;
    };

    const handleTemplateChange = (template: string) => {
        setMessageTemplate(template);

        // Predefined templates
        const templates: Record<string, string> = {
            'welcome': 'Hello! Thank you for your interest. How can we help you today?',
            'followup': 'Hi! Just following up on our previous conversation. Are you still interested?',
            'offer': 'Special offer just for you! Get 20% off on your first order. Limited time only!',
        };

        if (templates[template]) {
            setMessageData('message', templates[template]);
        }
    };

    const handleDrawerLogCall = async () => {
        if (!callData.outcome) {
            toast.error('Please select a call outcome');
            return;
        }

        setProcessing(true);
        try {
            await axios.post('/api/call-logs', callData);
            toast.success('Call logged successfully!');
            resetCall();
            setActiveTab('overview');
        } catch (error) {
            console.error('Error logging call:', error);
            toast.error('Failed to log call');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
            'Follow-Up': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
            'Called': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
            'Converted': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
            'Interested': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            'Connected': 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    };

    // Client-side filtering removed in favor of server-side filtering
    const filteredLeads = leadsList;

    return (
        <SidebarLayout user={auth.user}>
            <Head title="My Leads" />

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                {/* Search and Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={currentStatus}
                            onChange={(e) => setCurrentStatus(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="New">New</option>
                            <option value="Follow-Up">Follow-Up</option>
                            <option value="Called">Called</option>
                            <option value="Converted">Converted</option>
                        </select>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="this_week">This Week</option>
                            <option value="this_month">This Month</option>
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Showing {leads.from || 0} to {leads.to || 0} of {leads.total} leads
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                <th className="pb-3">NAME ↕</th>
                                <th className="pb-3">STATUS</th>
                                <th className="pb-3">SOURCE</th>
                                <th className="pb-3">CONTACT</th>
                                <th className="pb-3 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        No leads found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-white">{lead.name}</span>
                                                {lead.is_online && (
                                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">📅 {new Date(lead.created_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline - flex rounded - full px - 3 py - 1 text - xs font - medium ${getStatusColor(lead.status)} `}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-gray-600">{lead.source}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                +880 {lead.phone_first_4}******
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Call Button */}
                                                <button
                                                    onClick={() => handleCallClick(lead)}
                                                    title="Call"
                                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </button>

                                                {/* Message Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMessageClick(lead);
                                                    }}
                                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                                    title="Send Message"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(lead);
                                                    }}
                                                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                                    title="Edit Lead"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>

                                                {/* View Details Button */}
                                                <button
                                                    onClick={() => handleViewDetails(lead)}
                                                    title="View Details"
                                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-pink-600"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-1 justify-between sm:hidden">
                        {leads.links.map((link, key) => (
                            link.url && (link.label.includes('Previous') || link.label.includes('Next')) && (
                                <Link
                                    key={key}
                                    href={link.url}
                                    className={`relative inline - flex items - center rounded - md border border - gray - 300 bg - white px - 4 py - 2 text - sm font - medium text - gray - 700 hover: bg - gray - 50 dark: border - gray - 600 dark: bg - gray - 700 dark: text - gray - 300 dark: hover: bg - gray - 600 ${!link.url ? 'pointer-events-none opacity-50' : ''} `}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{leads.from}</span> to <span className="font-medium">{leads.to}</span> of{' '}
                                <span className="font-medium">{leads.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                                {leads.links.map((link, key) => (
                                    link.url ? (
                                        <Link
                                            key={key}
                                            href={link.url}
                                            className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold rounded-md ${link.active
                                                ? 'z-10 bg-pink-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={key}
                                            className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-500 ring-1 ring-inset ring-gray-300 rounded-md dark:text-gray-500 dark:ring-gray-700"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call Modal */}
            <DarkModal show={showCallModal} onClose={() => setShowCallModal(false)} title={`Log Call - ${selectedLead?.name} `}>
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
                            disabled={processing}
                            className="bg-gray-200 text-gray-900 hover:bg-white"
                        >
                            {processing ? 'SAVING...' : 'SAVE CALL LOG'}
                        </PrimaryButton>
                    </div>
                </form>
            </DarkModal>

            {/* Edit Lead Modal */}
            <EditLeadModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                lead={selectedLead}
            />

            {/* Message Modal */}
            <DarkModal show={showMessageModal} onClose={() => setShowMessageModal(false)} title={`Send Message - ${selectedLead?.name} `}>
                <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="message" value="Message *" className="text-gray-300" />
                        <textarea
                            id="message"
                            value={messageData.message}
                            onChange={(e) => setMessageData('message', e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-[#0f172a] text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={5}
                            required
                            placeholder="Type your message here..."
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-700 pt-4">
                        <SecondaryButton
                            onClick={() => setShowMessageModal(false)}
                            className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            CANCEL
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={processing}
                            className="bg-gray-200 text-gray-900 hover:bg-white"
                        >
                            {processing ? 'SENDING...' : 'SEND MESSAGE'}
                        </PrimaryButton>
                    </div>
                </form>
            </DarkModal>

            {/* Lead Details Drawer */}
            {showLeadDrawer && selectedLead && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLeadDrawer(false)}></div>

                    <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 text-white">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-xl font-bold text-gray-900">
                                    {selectedLead.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedLead.name}</h2>
                                    <p className="text-sm text-gray-300">+880 {selectedLead.phone_first_4}****** • {selectedLead.source}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowLeadDrawer(false)} className="text-white hover:text-gray-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 bg-white px-6">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`border - b - 2 px - 4 py - 3 text - sm font - medium transition - colors ${activeTab === 'overview'
                                        ? 'border-pink-600 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        } `}
                                >
                                    📋 Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('log-call')}
                                    className={`border - b - 2 px - 4 py - 3 text - sm font - medium transition - colors ${activeTab === 'log-call'
                                        ? 'border-pink-600 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        } `}
                                >
                                    📞 Log Call
                                </button>
                                <button
                                    onClick={() => setActiveTab('message')}
                                    className={`border - b - 2 px - 4 py - 3 text - sm font - medium transition - colors ${activeTab === 'message'
                                        ? 'border-pink-600 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        } `}
                                >
                                    💬 Message
                                </button>
                                <button
                                    onClick={() => setActiveTab('create-order')}
                                    className={`border - b - 2 px - 4 py - 3 text - sm font - medium transition - colors ${activeTab === 'create-order'
                                        ? 'border-pink-600 text-pink-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        } `}
                                >
                                    🛒 Create Order
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="h-[calc(100vh-140px)] overflow-y-auto p-6">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Current Status */}
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <p className="mb-2 text-sm font-medium text-gray-500">CURRENT STATUS</p>
                                            <span className={`inline - flex rounded - full px - 3 py - 1 text - sm font - semibold ${getStatusColor(selectedLead.status)} `}>
                                                {selectedLead.status}
                                            </span>
                                        </div>

                                        {/* Source */}
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <p className="mb-2 text-sm font-medium text-gray-500">SOURCE</p>
                                            <p className="font-semibold text-gray-900">{selectedLead.source}</p>
                                        </div>

                                        {/* Lead Quality */}
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <p className="mb-2 text-sm font-medium text-gray-500">LEAD QUALITY</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateLeadQuality('good')}
                                                    className={`rounded - lg border - 2 px - 3 py - 1 text - sm font - medium transition - all ${leadQuality === 'good'
                                                        ? 'border-green-500 bg-green-100 text-green-700'
                                                        : 'border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600'
                                                        } `}
                                                >
                                                    Good
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateLeadQuality('medium')}
                                                    className={`rounded - lg border - 2 px - 3 py - 1 text - sm font - medium transition - all ${leadQuality === 'medium'
                                                        ? 'border-yellow-500 bg-yellow-500 text-white font-bold'
                                                        : 'border-gray-300 text-gray-600 hover:border-yellow-500 hover:text-yellow-600'
                                                        } `}
                                                >
                                                    Medium
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateLeadQuality('poor')}
                                                    className={`rounded - lg border - 2 px - 3 py - 1 text - sm font - medium transition - all ${leadQuality === 'poor'
                                                        ? 'border-red-500 bg-red-100 text-red-700'
                                                        : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600'
                                                        } `}
                                                >
                                                    Poor
                                                </button>
                                            </div>
                                        </div>

                                        {/* Last Interaction */}
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <p className="mb-2 text-sm font-medium text-gray-500">LAST INTERACTION</p>
                                            <p className="text-sm text-gray-600">🕐 No interaction yet</p>
                                        </div>
                                    </div>

                                    {/* Activity Log & Notes */}
                                    <div className="rounded-lg border border-gray-200 p-4">
                                        <h3 className="mb-4 font-semibold text-gray-900">📝 Activity Log & Notes</h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={activityNote}
                                                onChange={(e) => setActivityNote(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                                                placeholder="Type a note here..."
                                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                            />
                                            <button
                                                onClick={handleAddNote}
                                                disabled={processing || !activityNote.trim()}
                                                className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                ➤
                                            </button>
                                        </div>
                                        <p className="mt-4 text-center text-sm italic text-gray-400">No history yet.</p>
                                    </div>
                                </div>
                            )}

                            {/* Log Call Tab */}
                            {activeTab === 'log-call' && (
                                <div className="space-y-6">
                                    <div className="rounded-lg border border-pink-200 bg-pink-50 p-6">
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                            <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Log Call Outcome
                                        </h3>

                                        <p className="mb-4 text-sm font-medium text-gray-700">WHAT HAPPENED?</p>
                                        <div className="mb-6 grid grid-cols-3 gap-3">
                                            {[
                                                { label: 'Connected', value: 'connected' },
                                                { label: 'Interested', value: 'interested' },
                                                { label: 'Follow Up', value: 'follow_up_scheduled' },
                                                { label: 'Not Interested', value: 'no_interest' },
                                                { label: 'No Answer / Busy', value: 'not_connected' },
                                                { label: 'Wrong Number', value: 'wrong_number' }
                                            ].map((outcome) => (
                                                <button
                                                    key={outcome.value}
                                                    onClick={() => setCallData('outcome', outcome.value)}
                                                    className={`rounded - lg border - 2 p - 4 text - center transition - all ${callData.outcome === outcome.value
                                                        ? 'border-pink-600 bg-pink-100'
                                                        : 'border-gray-200 hover:border-pink-300'
                                                        } `}
                                                >
                                                    <div className="mb-2 text-2xl">
                                                        {outcome.label === 'Connected' && '🔗'}
                                                        {outcome.label === 'Interested' && '👍'}
                                                        {outcome.label === 'Follow Up' && '🕐'}
                                                        {outcome.label === 'Not Interested' && '👎'}
                                                        {outcome.label === 'No Answer / Busy' && '📞'}
                                                        {outcome.label === 'Wrong Number' && '🚫'}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">{outcome.label}</p>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">CALL SUMMARY / NOTES</label>
                                            <textarea
                                                value={callData.notes}
                                                onChange={(e) => setCallData('notes', e.target.value)}
                                                placeholder="Customer mentioned..."
                                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                                rows={4}
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">UPDATE LEAD QUALITY</label>
                                            <div className="flex gap-3">
                                                <button className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium hover:border-green-500">
                                                    <span className="h-4 w-4 rounded-full border-2 border-gray-400"></span>
                                                    Good
                                                </button>
                                                <button className="flex items-center gap-2 rounded-lg border-2 border-pink-600 bg-pink-100 px-4 py-2 text-sm font-medium">
                                                    <span className="h-4 w-4 rounded-full border-4 border-pink-600"></span>
                                                    Medium
                                                </button>
                                                <button className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium hover:border-red-500">
                                                    <span className="h-4 w-4 rounded-full border-2 border-gray-400"></span>
                                                    Poor
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleDrawerLogCall}
                                            disabled={processing}
                                            className="w-full rounded-lg bg-gradient-to-r from-pink-600 to-pink-500 py-3 font-semibold text-white shadow-lg hover:from-pink-700 hover:to-pink-600 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Save Call Log'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Message Tab */}
                            {activeTab === 'message' && (
                                <div className="space-y-6">
                                    <div className="rounded-lg border border-pink-200 bg-pink-50 p-6">
                                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                            <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            Send Message
                                        </h3>

                                        <div className="mb-4">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">CHOOSE TEMPLATE</label>
                                            <select
                                                value={messageTemplate}
                                                onChange={(e) => handleTemplateChange(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                            >
                                                <option value="">Select a template...</option>
                                                <option value="welcome">Welcome Message</option>
                                                <option value="followup">Follow-up Reminder</option>
                                                <option value="offer">Special Offer</option>
                                            </select>
                                        </div>

                                        <div className="mb-6">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">MESSAGE CONTENT</label>
                                            <textarea
                                                value={messageData.message}
                                                onChange={(e) => setMessageData('message', e.target.value)}
                                                placeholder="Type your message here..."
                                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                                rows={6}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={handleWhatsAppMessage}
                                                className="flex items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-white shadow-lg hover:bg-green-600"
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                </svg>
                                                WhatsApp
                                            </button>
                                            <button
                                                onClick={handleSMSMessage}
                                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 py-3 font-semibold text-white shadow-lg hover:bg-blue-600"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                SMS
                                            </button>
                                        </div>
                                        <p className="mt-3 text-center text-xs text-gray-500">This will open the respective app on your device.</p>
                                    </div>
                                </div>
                            )}

                            {/* Create Order Tab */}
                            {activeTab === 'create-order' && (
                                <div className="space-y-6">
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                                        <h3 className="mb-4 text-lg font-bold text-gray-900">🛒 Create Order</h3>
                                        <p className="text-sm text-gray-600">Order creation form will be displayed here...</p>
                                        <button className="mt-4 w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 py-3 font-semibold text-white shadow-lg hover:from-green-700 hover:to-green-600">
                                            Create Order
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
