import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './pages/auth/AuthPage';
import BookList from './pages/BookList';
import Profile from './pages/Profile';
import MyBorrows from './pages/user/MyBorrows';
import MyFines from './pages/user/MyFines';
import ManageBooks from './pages/admin/ManageBooks';
import ManageBorrows from './pages/admin/ManageBorrows';
import ManageFines from './pages/admin/ManageFines';
import ManageUsers from './pages/admin/ManageUsers';
import ActivityLogs from './pages/admin/ActivityLogs';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<AuthPage />} />

                    {/* Protected Routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }>
                        {/* Common Routes - All authenticated users */}
                        <Route index element={<Navigate to="/books" replace />} />
                        <Route path="books" element={<BookList />} />
                        <Route path="profile" element={<Profile />} />

                        {/* User Only Routes */}
                        <Route path="my-borrows" element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <MyBorrows />
                            </ProtectedRoute>
                        } />
                        <Route path="my-fines" element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <MyFines />
                            </ProtectedRoute>
                        } />

                        {/* Staff & Admin Routes */}
                        <Route path="manage-books" element={
                            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                                <ManageBooks />
                            </ProtectedRoute>
                        } />
                        <Route path="manage-borrows" element={
                            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                                <ManageBorrows />
                            </ProtectedRoute>
                        } />
                        <Route path="manage-fines" element={
                            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                                <ManageFines />
                            </ProtectedRoute>
                        } />

                        {/* Admin Only Routes */}
                        <Route path="manage-users" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <ManageUsers />
                            </ProtectedRoute>
                        } />
                        <Route path="activity-logs" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <ActivityLogs />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Catch all - redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;