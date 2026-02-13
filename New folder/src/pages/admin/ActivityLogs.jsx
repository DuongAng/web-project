import { useState, useEffect } from 'react';
import { activityLogApi } from '../../services/api';
import { Search, Clock, User, Activity, Trash2 } from 'lucide-react';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await activityLogApi.getAll();
            setLogs(response.data.data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this log?')) return;
        try {
            await activityLogApi.delete(id);
            fetchLogs();
        } catch (error) {
            alert('Cannot delete log');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Delete ALL logs? This action cannot be undone!')) return;
        try {
            await activityLogApi.deleteAll();
            fetchLogs();
            alert('All logs deleted!');
        } catch (error) {
            alert('Cannot delete logs');
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            'USER': 'bg-slate-100 text-slate-700',
            'STAFF': 'bg-blue-100 text-blue-700',
            'ADMIN': 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[role] || 'bg-slate-100 text-slate-700'}`}>
        {role}
      </span>
        );
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Filter logs
    const filteredLogs = logs.filter(log => {
        const matchSearch =
            log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchRole = filterRole === 'all' || log.userRole === filterRole;

        return matchSearch && matchRole;
    });

    // Thống kê
    const todayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp).toDateString();
        const today = new Date().toDateString();
        return logDate === today;
    });

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
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Activity Logs</h1>
                    <span className="text-sm text-slate-500">({logs.length} records)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">Total Activities</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-800">{logs.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Today</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-800">{todayLogs.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Users</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-800">
                        {new Set(logs.map(l => l.userId)).size}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by user or activity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                </div>

                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                    <option value="all">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="USER">User</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 w-44">Timestamp</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 w-36">User</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 w-24">Role</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Activity</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm text-slate-600 font-mono">
                                    {formatDateTime(log.timestamp)}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium text-slate-800">
                                    {log.username}
                                </td>
                                <td className="py-3 px-4">
                                    {getRoleBadge(log.userRole)}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600">
                                    {log.action}
                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => handleDelete(log.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filteredLogs.length === 0 && (
                        <p className="text-center py-8 text-slate-500">
                            {searchTerm || filterRole !== 'all' ? 'No results found' : 'No activity logs available'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;