import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ChevronDown } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // ấn linh tinh ngoài để tắt cái bảng
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-slate-800">Library Management System</h1>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 hover:bg-slate-50 rounded-lg p-1.5 transition-colors"
                >
                    <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                        {getInitials(user?.username)}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                            <p className="font-medium text-slate-800">{user?.username}</p>
                            <p className="text-sm text-slate-500">{user?.email}</p>
                            <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                {user?.role}
              </span>
                        </div>
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                navigate('/profile');
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            <User className="w-4 h-4" />
                            Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;