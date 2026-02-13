import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi, borrowApi, fineApi } from '../services/api';
import { User, BookOpen, Clock, AlertCircle } from 'lucide-react';

const Profile = () => {
    const { user: authUser, hasRole } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState(null);
    const [borrows, setBorrows] = useState([]);
    const [fines, setFines] = useState([]);
    const [totalFine, setTotalFine] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    const isUser = hasRole('USER');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const userRes = await userApi.getMe();
            setUser(userRes.data.data);
            setFormData(userRes.data.data);

            if (isUser) {
                const [borrowRes, fineRes, totalRes] = await Promise.all([
                    borrowApi.getMyBorrows(),
                    fineApi.getMyFines(),
                    fineApi.getMyTotal()
                ]);
                setBorrows(borrowRes.data.data || []);
                setFines(fineRes.data.data || []);
                setTotalFine(totalRes.data.data || 0);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            await userApi.updateMe(formData);
            setUser(formData);
            setEditing(false);
            alert('Update successful!');
        } catch (error) {
            alert('Unable to update information');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'BORROWING': 'bg-slate-100 text-slate-700',
            'RETURNED': 'bg-green-100 text-green-700',
            'OVERDUE': 'bg-red-100 text-red-700',
            'PENDING': 'bg-yellow-100 text-yellow-700',
            'PAID': 'bg-green-100 text-green-700',
        };
        const labels = {
            'BORROWING': 'Borrowing',
            'RETURNED': 'Returned',
            'OVERDUE': 'Overdue',
            'PENDING': 'Pending',
            'PAID': 'Paid',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || 'bg-slate-100'}`}>
        {labels[status] || status}
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

    // Tabs for USER
    const userTabs = [
        { id: 'info', label: 'Profile Information', icon: User },
        { id: 'borrows', label: 'Borrowing History', icon: BookOpen },
        { id: 'fines', label: `Fines (${fines.filter(f => f.status === 'PENDING').length})`, icon: Clock },
    ];

    // Tabs for STAFF/ADMIN
    const staffTabs = [
        { id: 'info', label: 'Information', icon: User },
    ];

    const tabs = isUser ? userTabs : staffTabs;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-slate-800">Personal Information</h1>
                {isUser && totalFine > 0 && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Total fines: {totalFine.toLocaleString()}đ</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex border-b border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                                activeTab === tab.id
                                    ? 'border-slate-800 text-slate-800'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <div>
                            <h3 className="font-medium text-slate-800 mb-4">Basic Information</h3>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                                    <input
                                        type="text"
                                        value={formData.username || ''}
                                        disabled
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        disabled={!editing}
                                        className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg ${editing ? 'bg-white' : 'bg-slate-50 text-slate-600'}`}
                                    />
                                </div>
                                {isUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                                        <input
                                            type="text"
                                            value={formData.studentCode || ''}
                                            onChange={(e) => setFormData({...formData, studentCode: e.target.value})}
                                            disabled={!editing}
                                            className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg ${editing ? 'bg-white' : 'bg-slate-50 text-slate-600'}`}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        disabled={!editing}
                                        className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg ${editing ? 'bg-white' : 'bg-slate-50 text-slate-600'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={formData.address || ''}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        disabled={!editing}
                                        className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg ${editing ? 'bg-white' : 'bg-slate-50 text-slate-600'}`}
                                    />
                                </div>

                                {editing ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setFormData(user);
                                                setEditing(false);
                                            }}
                                            className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Borrows Tab - chỉ USER */}
                    {activeTab === 'borrows' && isUser && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-slate-200">
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
                                        <td className="py-3 px-4 text-sm text-slate-800">{borrow.bookTitle}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{borrow.borrowDate}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{borrow.dueDate}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{borrow.returnDate || '-'}</td>
                                        <td className="py-3 px-4">{getStatusBadge(borrow.status)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {borrows.length === 0 && (
                                <p className="text-center py-8 text-slate-500">No borrowing history found</p>
                            )}
                        </div>
                    )}

                    {/* Fines Tab - chỉ USER */}
                    {activeTab === 'fines' && isUser && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Book Title</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Created Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Overdue Days</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {fines.map((fine) => (
                                    <tr key={fine.id} className="border-b border-slate-100">
                                        <td className="py-3 px-4 text-sm text-slate-800">{fine.bookTitle}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{fine.issuedDate}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{fine.lateDays} days</td>
                                        <td className="py-3 px-4 text-sm text-slate-800 font-medium">{fine.amount?.toLocaleString()}đ</td>
                                        <td className="py-3 px-4">{getStatusBadge(fine.status)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {fines.length === 0 && (
                                <p className="text-center py-8 text-slate-500">No fines found</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;