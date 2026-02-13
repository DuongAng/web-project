import { useState, useEffect } from 'react';
import { borrowApi } from '../../services/api';
import { BookOpen, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const MyBorrows = () => {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBorrows();
    }, []);

    const fetchBorrows = async () => {
        try {
            setLoading(true);
            const response = await borrowApi.getMyBorrows();
            setBorrows(response.data.data || []);
        } catch (error) {
            console.error('Error fetching borrows:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sách chờ duyệt
    const pendingBorrows = borrows.filter(b => b.status === 'PENDING');
    // Sách đang mượn = BORROWING hoặc OVERDUE (chưa trả)
    const currentBorrows = borrows.filter(b => b.status === 'BORROWING' || b.status === 'OVERDUE');
    // Sách quá hạn = những sách đang mượn mà đã quá hạn
    const overdueBorrows = currentBorrows.filter(b => b.isOverdue || b.status === 'OVERDUE');
    // Sách đã trả
    const returnedBorrows = borrows.filter(b => b.status === 'RETURNED');

    const getStatusBadge = (borrow) => {
        if (borrow.status === 'PENDING') {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">Pending Approval</span>;
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

    const getDaysRemaining = (dueDate) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `Overdue by ${Math.abs(diff)} days`;
        if (diff === 0) return 'Due today';
        return `${diff} days remaining`;
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
            <h1 className="text-xl font-semibold text-slate-800 mb-6">Borrowed books</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-yellow-200 p-4">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Pending Approval</span>
                    </div>
                    <p className="text-2xl font-semibold text-yellow-600">{pendingBorrows.length} <span className="text-sm font-normal">books</span></p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">Borrowing</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-800">{currentBorrows.length} <span className="text-sm font-normal text-slate-500">books</span></p>
                </div>
                <div className="bg-white rounded-xl border border-red-200 p-4">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Overdue</span>
                    </div>
                    <p className="text-2xl font-semibold text-red-600">{overdueBorrows.length} <span className="text-sm font-normal">books</span></p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Returned</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-800">{returnedBorrows.length} <span className="text-sm font-normal text-slate-500">books</span></p>
                </div>
            </div>

            {/* Pending Borrows */}
            {pendingBorrows.length > 0 && (
                <div className="bg-yellow-50 rounded-xl border border-yellow-200 mb-6">
                    <div className="p-4 border-b border-yellow-200">
                        <h2 className="font-medium text-yellow-800">Pending Approval Requests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-yellow-200 bg-yellow-100/50">
                                <th className="text-left py-3 px-4 text-sm font-medium text-yellow-700">Book Title</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-yellow-700">Request Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-yellow-700">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pendingBorrows.map((borrow) => (
                                <tr key={borrow.id} className="border-b border-yellow-100">
                                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{borrow.bookTitle}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{borrow.borrowDate}</td>
                                    <td className="py-3 px-4">{getStatusBadge(borrow)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Current Borrows - Hiển thị tất cả sách đang mượn kể cả quá hạn */}
            {currentBorrows.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 mb-6">
                    <div className="p-4 border-b border-slate-200">
                        <h2 className="font-medium text-slate-800">Currently Borrowing</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Book Title</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Borrow Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Due Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Time Left</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentBorrows.map((borrow) => (
                                <tr key={borrow.id} className="border-b border-slate-100">
                                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{borrow.bookTitle}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{borrow.borrowDate}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{borrow.dueDate}</td>
                                    <td className={`py-3 px-4 text-sm font-medium ${(borrow.isOverdue || borrow.status === 'OVERDUE') ? 'text-red-600' : 'text-slate-600'}`}>
                                        {getDaysRemaining(borrow.dueDate)}
                                    </td>
                                    <td className="py-3 px-4">{getStatusBadge(borrow)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Borrow History */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-medium text-slate-800">Borrowing History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Book Title</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Borrow Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Due Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Return Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {borrows.map((borrow) => (
                            <tr key={borrow.id} className="border-b border-slate-100">
                                <td className="py-3 px-4 text-sm font-medium text-slate-800">{borrow.bookTitle}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{borrow.borrowDate}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{borrow.dueDate}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{borrow.returnDate || '-'}</td>
                                <td className="py-3 px-4">{getStatusBadge(borrow)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {borrows.length === 0 && (
                        <p className="text-center py-8 text-slate-500">No borrowing history found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBorrows;