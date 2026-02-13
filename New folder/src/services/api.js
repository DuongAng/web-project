import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - thêm token vào header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - xử lý lỗi 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authApi = {
    login: (data) => api.post('/api/auth/login', data),
    register: (data) => api.post('/api/auth/register', data),
};

// Book API
export const bookApi = {
    getAll: () => api.get('/api/books'),
    getById: (id) => api.get(`/api/books/${id}`),
    search: (keyword, page = 0, size = 10) =>
        api.get(`/api/books/search?keyword=${keyword}&page=${page}&size=${size}`),
    create: (data) => api.post('/api/books', data),
    update: (id, data) => api.put(`/api/books/${id}`, data),
    delete: (id) => api.delete(`/api/books/${id}`),
};

// Book Copy API
export const bookCopyApi = {
    getByBook: (bookId) => api.get(`/api/book-copies/book/${bookId}`),
    getAvailable: (bookId) => api.get(`/api/book-copies/book/${bookId}/available`),
    create: (data) => api.post('/api/book-copies', data),
};

// Borrow API
export const borrowApi = {
    getAll: () => api.get('/api/borrows'),
    getPending: () => api.get('/api/borrows/pending'),
    getMyBorrows: () => api.get('/api/borrows/my-borrows'),
    getMyCurrent: () => api.get('/api/borrows/my-current'),
    getByUser: (userId) => api.get(`/api/borrows/user/${userId}`),
    borrow: (data) => api.post('/api/borrows', data),
    approve: (id) => api.put(`/api/borrows/${id}/approve`),
    reject: (id) => api.put(`/api/borrows/${id}/reject`),
    return: (id) => api.put(`/api/borrows/${id}/return`),
    getOverdue: () => api.get('/api/borrows/overdue'),
};

// Fine API
export const fineApi = {
    getAll: () => api.get('/api/fines'),
    getPending: () => api.get('/api/fines/pending'),
    getMyFines: () => api.get('/api/fines/my-fines'),
    getMyPending: () => api.get('/api/fines/my-pending'),
    getMyTotal: () => api.get('/api/fines/my-total'),
    pay: (id) => api.put(`/api/fines/${id}/pay`),
    waive: (id, reason) => api.put(`/api/fines/${id}/waive?reason=${reason}`),
};

// User API
export const userApi = {
    getAll: () => api.get('/api/users'),
    getMe: () => api.get('/api/users/me'),
    getById: (id) => api.get(`/api/users/${id}`),
    updateMe: (data) => api.put('/api/users/me', data),
    updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
    delete: (id) => api.delete(`/api/users/${id}`),
};

// Category API
export const categoryApi = {
    getAll: () => api.get('/api/categories'),
};

// Author API
export const authorApi = {
    getAll: () => api.get('/api/authors'),
    search: (name) => api.get('/api/authors/search?name=' + name),
    create: (data) => api.post('/api/authors', data),
};

// Publisher API
export const publisherApi = {
    getAll: () => api.get('/api/publishers'),
    create: (data) => api.post('/api/publishers', data),
};

// Library API
export const libraryApi = {
    getAll: () => api.get('/api/libraries'),
};

// Activity Log API (Admin)
export const activityLogApi = {
    getAll: () => api.get('/api/activity-logs'),
    getByUser: (userId) => api.get(`/api/activity-logs/user/${userId}`),
    search: (keyword) => api.get(`/api/activity-logs/search?keyword=${keyword}`),
    delete: (id) => api.delete(`/api/activity-logs/${id}`),
    deleteAll: () => api.delete('/api/activity-logs/all'),
};