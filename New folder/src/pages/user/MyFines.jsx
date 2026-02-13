import { useState, useEffect } from 'react';
import { fineApi } from '../../services/api';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

const MyFines = () => {
    const [fines, setFines] = useState([]);
    const [totalPending, setTotalPending] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFines();
    }, []);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const [finesRes, totalRes] = await Promise.all([
                fineApi.getMyFines(),
                fineApi.getMyTotal()
            ]);
            setFines(finesRes.data.data || []);
            setTotalPending(totalRes.data.data || 0);
        } catch (error) {
            console.error('Error fetching fines:', error);
        } finally {
            setLoading(false);
        }
    };

    const pendingFines = fines.filter(f => f.status === 'PENDING');
    const paidFines = fines.filter(f => f.status === 'PAID');
    const waivedFines = fines.filter(f => f.status === 'WAIVED');

    const getStatusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-yellow-100 text-yellow-700',
            'PAID': 'bg-green-100 text-green-700',
            'WAIVED': 'bg-slate-100 text-slate-600',
        };
        const labels = {
            'PENDING': 'Pending',
            'PAID': 'Paid',
            'WAIVED': 'Waived',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-xl font-semibold text-slate-800 mb-6">My Fines</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">Pending Fines</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-800">{pendingFines.length} <span className="text-sm font-normal text-slate-500">items</span></p>
                </div>
                <div className={`bg-white rounded-xl border p-4 ${totalPending > 0 ? 'border-red-200' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Total Due</span>
                    </div>
                    <p className="text-2xl font-semibold text-red-600">{totalPending.toLocaleString()} $</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Total Paid</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-800">
                        {paidFines.reduce((sum, f) => sum + (f.amount || 0), 0).toLocaleString()} $
                    </p>
                </div>
            </div>

            {/* Fines Table */}
            <div className="bg-white rounded-xl border border-slate-200 mb-6">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-medium text-slate-800">Fine Details</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Book Title</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Issued Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Overdue Days</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Note</th>
                        </tr>
                        </thead>
                        <tbody>
                        {fines.map((fine) => (
                            <tr key={fine.id} className="border-b border-slate-100">
                                <td className="py-3 px-4 text-sm font-medium text-slate-800">{fine.bookTitle}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{fine.issuedDate}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{fine.lateDays} days</td>
                                <td className="py-3 px-4 text-sm font-medium text-slate-800">{fine.amount?.toLocaleString()}$</td>
                                <td className="py-3 px-4">{getStatusBadge(fine.status)}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{fine.reason || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {fines.length === 0 && (
                        <p className="text-center py-8 text-slate-500">No fines found</p>
                    )}
                </div>
            </div>

            {/* Warning */}
            {totalPending > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-red-800">You have outstanding fines!</h3>
                            <p className="text-sm text-red-600 mt-1">
                                Please visit the library to pay <span className="font-semibold">{totalPending.toLocaleString()}$</span> in fines.
                                Staff will confirm your payment upon settlement.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyFines;