import { useState, useEffect } from 'react';
import { borrowApi } from '../../services/api';
import { CheckCircle, XCircle, Search, Clock } from 'lucide-react';

const ManageBorrows = () => {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, borrowing, returned

    useEffect(() => {
        fetchBorrows();
    }, []);

    const fetchBorrows = async () => {
        try {
            setLoading(true);
            const response = await borrowApi.getAll();
            setBorrows(response.data.data || []);
        } catch (error) {
            console.error('Error fetching borrows:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleApprove = async (id) => {
        if (!confirm('Approve this borrow request?')) return;
        try {
            await borrowApi.approve(id);
            alert('Borrow request approved!');
            fetchBorrows();
        } catch (error) {
            alert(error.response?.data?.message || 'Cannot approve request');
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Reject this borrow request?')) return;
        try {
            await borrowApi.reject(id);
            alert('Borrow request rejected!');
            fetchBorrows();
        } catch (error) {
            alert(error.response?.data?.message || 'Cannot reject request');
        }
    };

    const handleReturn = async (id) => {
        if (!confirm('Confirm book return?')) return;
        try {
            await borrowApi.return(id);
            alert('Book return confirmed!');
            fetchBorrows();
        } catch (error) {
            alert(error.response?.data?.message || 'Cannot confirm return');
        }
    };

    const getStatusBadge = (borrow) => {
        if (borrow.status === 'PENDING') {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">Pending</span>;
        }
        if (borrow.status === 'REJECTED') {
            return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">Rejected</span>;
        }
        if (borrow.status === 'RETURNED') {
            return <span className="px-2 py-1 bg-slate-800 text-white text-xs rounded">Returned</span>;
        }
        if (borrow.isOverdue || borrow.status === 'OVERDUE') {
            return <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Overdue</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">Borrowing</span>;
    };

    const filteredBorrows = borrows
        .filter(b =>
            b.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(b => {
            if (filter === 'all') return true;
            if (filter === 'pending') return b.status === 'PENDING';
            if (filter === 'borrowing') return b.status === 'BORROWING' || b.status === 'OVERDUE';
            if (filter === 'returned') return b.status === 'RETURNED';
            return true;
        });

    // Đếm số lượng theo trạng thái
    const pendingCount = borrows.filter(b => b.status === 'PENDING').length;
    const borrowingCount = borrows.filter(b => b.status === 'BORROWING' || b.status === 'OVERDUE').length;

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
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold text-slate-800">Borrow Management</h1>
                    {pendingCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
              <Clock className="w-3.5 h-3.5" />
                            {pendingCount} pending
            </span>
                    )}
                </div>

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

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm rounded-lg ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    All ({borrows.length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 text-sm rounded-lg ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
                >
                    Pending ({pendingCount})
                </button>
                <button
                    onClick={() => setFilter('borrowing')}
                    className={`px-4 py-2 text-sm rounded-lg ${filter === 'borrowing' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                    Borrowing ({borrowingCount})
                </button>
                <button
                    onClick={() => setFilter('returned')}
                    className={`px-4 py-2 text-sm rounded-lg ${filter === 'returned' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    Returned
                </button>
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
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Request Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Due Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredBorrows.map((borrow) => (
                            <tr key={borrow.id} className={`border-b border-slate-100 hover:bg-slate-50 ${borrow.status === 'PENDING' ? 'bg-yellow-50/50' : ''}`}>
                                <td className="py-3 px-4 text-sm font-medium text-slate-800">{borrow.bookTitle}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{borrow.username}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{borrow.libraryName || '-'}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{borrow.borrowDate}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{borrow.dueDate}</td>
                                <td className="py-3 px-4">{getStatusBadge(borrow)}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1">
                                        {/* Approve/Reject buttons for PENDING */}
                                        {borrow.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(borrow.id)}
                                                    className="flex items-center gap-1 px-2 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(borrow.id)}
                                                    className="flex items-center gap-1 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {/* Return button for BORROWING/OVERDUE */}
                                        {(borrow.status === 'BORROWING' || borrow.status === 'OVERDUE') && (
                                            <button
                                                onClick={() => handleReturn(borrow.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Confirm Return
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filteredBorrows.length === 0 && (
                        <p className="text-center py-8 text-slate-500">
                            {searchTerm ? 'No results found' : 'No borrow records available'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageBorrows;