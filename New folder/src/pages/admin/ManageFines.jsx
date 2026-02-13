import { useState, useEffect } from 'react';
import { fineApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, Search } from 'lucide-react';

const ManageFines = () => {
    const { hasRole } = useAuth();
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFines();
    }, []);

    const fetchFines = async () => {
        try {
            setLoading(true);
            const response = await fineApi.getAll();
            setFines(response.data.data || []);
        } catch (error) {
            console.error('Error fetching fines:', error);
        } finally {
            setLoading(false);
        }
    };
    const handlePay = async (id) => {
        if (!confirm('Confirm payment?')) return;
        try {
            await fineApi.pay(id);
            alert('Payment confirmed successfully!');
            fetchFines();
        } catch (error) {
            alert(error.response?.data?.message || 'Cannot confirm payment');
        }
    };

    const handleWaive = async (id) => {
        const reason = prompt('Enter reason for waiving fine:');
        if (!reason) return;
        try {
            await fineApi.waive(id, reason);
            alert('Fine waived successfully!');
            fetchFines();
        } catch (error) {
            alert(error.response?.data?.message || 'Cannot waive fine');
        }
    };

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

    // tìm theo tên user hoặc tên sách
    const filteredFines = fines.filter(f =>
        f.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-slate-800">Fine Management</h1>

                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by borrower or book..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 w-80 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Book Title</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Borrower</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Branch</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Overdue Days</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredFines.map((fine) => (
                            <tr key={fine.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm font-medium text-slate-800">{fine.bookTitle}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{fine.username}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{fine.libraryName || '-'}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{fine.lateDays} days</td>
                                <td className="py-3 px-4 text-sm font-medium text-slate-800">{fine.amount?.toLocaleString()}$</td>
                                <td className="py-3 px-4">{getStatusBadge(fine.status)}</td>
                                <td className="py-3 px-4">
                                    {fine.status === 'PENDING' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePay(fine.id)}
                                                className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                                                title="Confirm payment"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            {hasRole('ADMIN') && (
                                                <button
                                                    onClick={() => handleWaive(fine.id)}
                                                    className="flex items-center gap-1 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
                                                    title="Waive fine"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filteredFines.length === 0 && (
                        <p className="text-center py-8 text-slate-500">
                            {searchTerm ? 'No results found' : 'No fines available'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageFines;