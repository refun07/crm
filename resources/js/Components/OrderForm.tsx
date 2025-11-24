import { useState } from 'react';
import axios from 'axios';

interface OrderFormProps {
    leadId: number;
    leadName: string;
    onSuccess: () => void;
    onCancel: () => void;
}

interface Product {
    name: string;
    quantity: number;
    price: number;
}

export default function OrderForm({ leadId, leadName, onSuccess, onCancel }: OrderFormProps) {
    const [products, setProducts] = useState<Product[]>([
        { name: '', quantity: 1, price: 0 },
    ]);
    const [customerAddress, setCustomerAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [offerApplied, setOfferApplied] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const addProduct = () => {
        setProducts([...products, { name: '', quantity: 1, price: 0 }]);
    };

    const removeProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const updateProduct = (index: number, field: keyof Product, value: any) => {
        const updated = [...products];
        updated[index] = { ...updated[index], [field]: value };
        setProducts(updated);
    };

    const calculateTotal = () => {
        return products.reduce((sum, p) => sum + p.quantity * p.price, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await axios.post('/api/orders', {
                lead_id: leadId,
                products,
                customer_address: customerAddress,
                payment_method: paymentMethod,
                offer_applied: offerApplied || null,
                notes: notes || null,
            });

            alert('Order created successfully!');
            onSuccess();
        } catch (error: any) {
            console.error('Error creating order:', error);
            alert(error.response?.data?.message || 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-[#1e293b] shadow-2xl ring-1 ring-white/10">
                <div className="border-b border-gray-700 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">
                        Create Order for {leadName}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Products */}
                    <div className="mb-6">
                        <div className="mb-3 flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-300">
                                Products *
                            </label>
                            <button
                                type="button"
                                onClick={addProduct}
                                className="text-sm font-medium text-blue-400 hover:text-blue-300"
                            >
                                + Add Product
                            </button>
                        </div>
                        <div className="space-y-3">
                            {products.map((product, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Product name"
                                        value={product.name}
                                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                                        className="flex-1 rounded-lg border-gray-600 bg-[#0f172a] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        value={product.quantity}
                                        onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                                        className="w-20 rounded-lg border-gray-600 bg-[#0f172a] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                        min="1"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={product.price}
                                        onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value))}
                                        className="w-32 rounded-lg border-gray-600 bg-[#0f172a] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                    {products.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-right">
                            <span className="text-lg font-bold text-white">
                                Total: ${calculateTotal().toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Customer Address */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Customer Address *
                        </label>
                        <textarea
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border-gray-600 bg-[#0f172a] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Payment Method *
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full rounded-lg border-gray-600 bg-[#0f172a] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select payment method...</option>
                            <option value="cash">Cash on Delivery</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="mobile_payment">Mobile Payment</option>
                        </select>
                    </div>

                    {/* Offer Applied */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Offer/Discount Code
                        </label>
                        <input
                            type="text"
                            value={offerApplied}
                            onChange={(e) => setOfferApplied(e.target.value)}
                            className="w-full rounded-lg border-gray-600 bg-[#0f172a] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="e.g., SUMMER2025"
                        />
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-300">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border-gray-600 bg-[#0f172a] text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Additional notes or special instructions..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t border-gray-700 pt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-white disabled:opacity-50"
                        >
                            {submitting ? 'CREATING...' : 'CREATE ORDER'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
