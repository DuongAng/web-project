import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fineApi } from '../../services/api';
import {
    BookOpen,
    Search,
    BookMarked,
    DollarSign,
    Users,
    Settings,
    ClipboardList,
    Activity
} from 'lucide-react';

const Sidebar = ({ searchValue, onSearchChange }) => {
    const { user, hasRole } = useAuth();
    const [totalFine, setTotalFine] = useState(0);

    useEffect(() => {
        if (hasRole('USER')) {
            fetchTotalFine();
        }
    }, []);

    const fetchTotalFine = async () => {
        try {
            const response = await fineApi.getMyTotal();
            setTotalFine(response.data.data || 0);
        } catch (error) {
            console.error('Error fetching total fine:', error);
        }
    };

    // Menu items cho USER
    const userMenuItems = [
        { path: '/books', icon: BookOpen, label: 'Books' },
        { path: '/my-borrows', icon: BookMarked, label: 'My Borrows' },
        { path: '/my-fines', icon: DollarSign, label: 'My Fines', showBadge: true },
    ];

    // Menu items for STAFF
    const staffMenuItems = [
        { path: '/books', icon: BookOpen, label: 'Books' },
        { path: '/manage-books', icon: Settings, label: 'Manage Books' },
        { path: '/manage-borrows', icon: ClipboardList, label: 'Manage Borrows' },
        { path: '/manage-fines', icon: DollarSign, label: 'Manage Fines' },
    ];

    // Menu items for ADMIN
    const adminMenuItems = [
        { path: '/books', icon: BookOpen, label: 'Books' },
        { path: '/manage-books', icon: Settings, label: 'Manage Books' },
        { path: '/manage-borrows', icon: ClipboardList, label: 'Manage Borrows' },
        { path: '/manage-fines', icon: DollarSign, label: 'Manage Fines' },
        { path: '/manage-users', icon: Users, label: 'Manage Users' },
        { path: '/activity-logs', icon: Activity, label: 'Activity Logs' },
    ];

    const getMenuItems = () => {
        if (hasRole('ADMIN')) return adminMenuItems;
        if (hasRole('STAFF')) return staffMenuItems;
        return userMenuItems;
    };

    const menuItems = getMenuItems();

    return (
        <div className="w-60 bg-white border-r border-slate-200 min-h-screen flex flex-col">
            {/* Search */}
            <div className="p-4 pt-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm sách..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                </div>
            </div>
            {/* Menu */}
            <div className="flex-1 px-3">
                <p className="text-xs text-slate-400 px-3 mb-2">Menu</p>
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-slate-100 text-slate-800'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="flex-1">{item.label}</span>
                            {item.showBadge && totalFine > 0 && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {totalFine.toLocaleString()}$
                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;