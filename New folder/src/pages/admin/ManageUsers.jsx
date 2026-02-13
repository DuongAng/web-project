import { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import { Trash2, Search } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleRoleChange = async (userId, newRole) => {
        try {
            await userApi.updateRole(userId, newRole);
            alert('Role updated successfully!');
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Cannot update role');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await userApi.delete(id);
            alert('User deleted successfully!');
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Cannot delete user');
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            'USER': 'bg-slate-100 text-slate-700',
            'STAFF': 'bg-blue-100 text-blue-700',
            'ADMIN': 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role]}`}>
        {role}
      </span>
        );
    };

    // tìm kiếm
    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-xl font-semibold text-slate-800">User Management</h1>

                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 w-72 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Username</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Email</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Role</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm font-medium text-slate-800">{user.username}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        {getRoleBadge(user.role)}
                                        {user.role !== 'ADMIN' && (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-300"
                                            >
                                                <option value="USER">User</option>
                                                <option value="STAFF">Staff</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    {user.role !== 'ADMIN' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <p className="text-center py-8 text-slate-500">
                            {searchTerm ? 'No results found' : 'No users available'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;