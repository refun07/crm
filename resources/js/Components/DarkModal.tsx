import { PropsWithChildren } from 'react';

export default function DarkModal({ show, onClose, children, title }: PropsWithChildren<{ show: boolean; onClose: () => void; title: string }>) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[#1e293b] shadow-2xl ring-1 ring-white/10">
                <div className="border-b border-gray-700 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">
                        {title}
                    </h2>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
