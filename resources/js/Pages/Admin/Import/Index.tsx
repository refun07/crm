import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

interface ImportBatch {
    id: number;
    batch_number: string;
    file_name: string;
    total_rows: number;
    successful_rows: number;
    failed_rows: number;
    duplicate_rows: number;
    status: string;
    created_at: string;
    uploader: {
        name: string;
    };
}

interface ImportPageProps extends PageProps {
    batches: {
        data: ImportBatch[];
        current_page: number;
        last_page: number;
    };
}

export default function Index({ auth, batches: initialBatches }: ImportPageProps) {
    const [batches, setBatches] = useState(initialBatches);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadPromise = axios.post('/admin/imports/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        toast.promise(uploadPromise, {
            loading: 'Uploading and processing file...',
            success: (response) => {
                // Add the new batch to the list
                const newBatch = response.data.batch;
                // Add uploader info since backend might return just ID
                newBatch.uploader = { name: auth.user.name };

                setBatches(prev => ({
                    ...prev,
                    data: [newBatch, ...prev.data]
                }));

                setSelectedFile(null);
                // Reset file input
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

                return 'File uploaded and processed successfully!';
            },
            error: (err) => {
                return err.response?.data?.message || 'Failed to upload file';
            },
        });

        try {
            await uploadPromise;
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-gray-100 text-gray-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <SidebarLayout user={auth.user}>
            <Head title="Import Leads" />

            <div className="mb-6 flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900">
                    Lead Import Management
                </h2>
            </div>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Upload Section */}
                    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Upload New Leads
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select Excel/CSV File
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileSelect}
                                    className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                                />
                                {selectedFile && (
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>

                            <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                    📋 Required Columns:
                                </h4>
                                <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                    <li><strong>Name</strong> (Required)</li>
                                    <li><strong>Phone</strong> (Required)</li>
                                    <li>Email (Optional)</li>
                                    <li>Address (Optional)</li>
                                    <li>City (Optional)</li>
                                    <li>State (Optional)</li>
                                    <li>Zip Code (Optional)</li>
                                    <li>Source (Optional)</li>
                                </ul>
                            </div>

                            <div className="mb-4 flex items-center gap-3 rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
                                <div className="flex-1">
                                    <h4 className="mb-1 font-semibold text-green-900 dark:text-green-100">
                                        📥 Need a template?
                                    </h4>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        Download our sample CSV file with example data to get started
                                    </p>
                                </div>
                                <a
                                    href="/sample_leads_template.csv"
                                    download="sample_leads_template.csv"
                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Template
                                </a>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload & Process'}
                            </button>
                        </div>
                    </div>

                    {/* Import History */}
                    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Import History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Batch #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            File Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Success
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Failed
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Duplicates
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Uploaded By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {batches.data.map((batch) => (
                                        <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                                                <a href={`/admin/imports/${batch.id}`}>
                                                    {batch.batch_number}
                                                </a>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {batch.file_name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {batch.total_rows}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-600">
                                                {batch.successful_rows}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-red-600">
                                                {batch.failed_rows}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-yellow-600">
                                                {batch.duplicate_rows}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(batch.status)}`}>
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {batch.uploader.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(batch.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
