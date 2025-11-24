import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import DarkModal from './DarkModal';
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import toast from 'react-hot-toast';

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
}

interface Props {
    show: boolean;
    onClose: () => void;
    lead: Lead | null;
}

export default function EditLeadModal({ show, onClose, lead }: Props) {
    const { data, setData, patch, processing, reset, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        status: '',
        source: '',
        notes: '',
    });

    useEffect(() => {
        if (lead) {
            setData({
                name: lead.name || '',
                phone: lead.phone || '',
                email: lead.email || '',
                status: lead.status || 'new',
                source: lead.source || '',
                notes: lead.notes || '',
            });
        }
    }, [lead]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lead) return;

        patch(`/leads/${lead.id}`, {
            onSuccess: () => {
                toast.success('Lead updated successfully');
                onClose();
                reset();
            },
            onError: () => {
                toast.error('Failed to update lead');
            },
        });
    };

    return (
        <DarkModal show={show} onClose={onClose} title="Edit Lead">
            <form onSubmit={submit} className="space-y-6">
                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value="Name" className="text-gray-300" />
                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full bg-gray-800 text-white border-gray-700 focus:border-pink-500 focus:ring-pink-500"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                </div>

                {/* Phone */}
                <div>
                    <InputLabel htmlFor="phone" value="Phone" className="text-gray-300" />
                    <TextInput
                        id="phone"
                        type="text"
                        className="mt-1 block w-full bg-gray-800 text-white border-gray-700 focus:border-pink-500 focus:ring-pink-500"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-gray-300" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full bg-gray-800 text-white border-gray-700 focus:border-pink-500 focus:ring-pink-500"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                </div>

                {/* Status */}
                <div>
                    <InputLabel htmlFor="status" value="Status" className="text-gray-300" />
                    <select
                        id="status"
                        className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                    >
                        <option value="new">New</option>
                        <option value="assigned">Assigned</option>
                        <option value="called">Called</option>
                        <option value="interested">Interested</option>
                        <option value="follow_up">Follow Up</option>
                        <option value="converted">Converted</option>
                        <option value="invalid">Invalid</option>
                        <option value="not_interested">Not Interested</option>
                    </select>
                    {errors.status && <div className="text-red-500 text-sm mt-1">{errors.status}</div>}
                </div>

                {/* Source */}
                <div>
                    <InputLabel htmlFor="source" value="Source" className="text-gray-300" />
                    <TextInput
                        id="source"
                        type="text"
                        className="mt-1 block w-full bg-gray-800 text-white border-gray-700 focus:border-pink-500 focus:ring-pink-500"
                        value={data.source}
                        onChange={(e) => setData('source', e.target.value)}
                    />
                </div>

                {/* Notes */}
                <div>
                    <InputLabel htmlFor="notes" value="Notes" className="text-gray-300" />
                    <textarea
                        id="notes"
                        className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        rows={3}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton disabled={processing} className="bg-pink-600 hover:bg-pink-700">
                        Save Changes
                    </PrimaryButton>
                </div>
            </form>
        </DarkModal>
    );
}
