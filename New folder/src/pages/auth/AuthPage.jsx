import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentCode: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    // Validate password realtime
    useEffect(() => {
        if (!isLogin) {
            const newErrors = { ...errors };

            // Password validation
            if (formData.password && formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters';
            } else {
                delete newErrors.password;
            }

            // Confirm password validation
            if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            } else {
                delete newErrors.confirmPassword;
            }

            setErrors(newErrors);
        }
    }, [formData.password, formData.confirmPassword, isLogin]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        if (!isLogin) {
            if (formData.password.length < 6) {
                setErrors({ ...errors, password: 'Password must be at least 6 characters' });
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setErrors({ ...errors, confirmPassword: 'Passwords do not match' });
                return;
            }
        }

        setLoading(true);

        let result;
        if (isLogin) {
            result = await login(formData.username.trim(), formData.password);
        } else {
            result = await register({
                ...formData,
                username: formData.username.trim(),
                email: formData.email.trim()
            });
        }

        if (result.success) {
            navigate('/books');
        } else {
            setApiError(result.message);
        }
        setLoading(false);
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setErrors({});
        setApiError('');
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            studentCode: '',
            phone: '',
            address: ''
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-800">Library Management System</h1>
                    <p className="text-slate-500 mt-1">Login or register to continue</p>
                </div>

                {/* Tab Switcher */}
                <div className="bg-slate-200 rounded-full p-1 flex mb-6">
                    <button
                        onClick={() => { if (!isLogin) switchMode(); }}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                            isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                        }`}
                    >
                        Log in
                    </button>
                    <button
                        onClick={() => { if (isLogin) switchMode(); }}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                            !isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                        }`}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">
                        {isLogin ? 'Login' : 'Register'}
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">
                        {isLogin ? 'Enter your credentials to login' : 'Enter your information to create a new account'}
                    </p>

                    {apiError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {isLogin ? 'Email or Username' : 'Username *'}
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder={isLogin ? "example@email.com" : "username"}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                                    errors.password ? 'border-red-300' : 'border-slate-200'
                                }`}
                                required
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                                            errors.confirmPassword ? 'border-red-300' : 'border-slate-200'
                                        }`}
                                        required
                                    />
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>                                    <input
                                        type="text"
                                        name="studentCode"
                                        value={formData.studentCode}
                                        onChange={handleChange}
                                        placeholder="SV001"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0912345678"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="123 ABC Street, District 1, Ho Chi Minh City"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (!isLogin && (errors.password || errors.confirmPassword))}
                            className="w-full bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
};

export default AuthPage;