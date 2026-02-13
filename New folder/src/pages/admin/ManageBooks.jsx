import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { bookApi, categoryApi, authorApi, publisherApi } from '../../services/api';
import { Plus, Pencil, Trash2, X, List, Grid, RefreshCw, ChevronDown } from 'lucide-react';

const ManageBooks = () => {
    const { searchValue } = useOutletContext();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('card');
    const [showModal, setShowModal] = useState(false);
    const [showPublisherModal, setShowPublisherModal] = useState(false);
    const [showAuthorModal, setShowAuthorModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [newPublisher, setNewPublisher] = useState({ name: '', address: '' });
    const [newAuthor, setNewAuthor] = useState({ name: '', biography: '' });

    // Author search
    const [authorSearch, setAuthorSearch] = useState('');
    const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const authorDropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        publisherId: '',
        authorIds: [],
        isbn: '',
        publisherDate: '',
        totalQuantity: 1,
        description: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching data...');

            const [booksRes, catsRes, authorsRes, pubsRes] = await Promise.all([
                bookApi.getAll(),
                categoryApi.getAll(),
                authorApi.getAll(),
                publisherApi.getAll()
            ]);

            console.log('Books response:', booksRes.data);
            console.log('Categories response:', catsRes.data);

            setBooks(booksRes.data.data || []);
            setCategories(catsRes.data.data || []);
            setAuthors(authorsRes.data.data || []);
            setPublishers(pubsRes.data.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Error loading data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
                setShowAuthorDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            categoryId: '',
            publisherId: '',
            authorIds: [],
            isbn: '',
            publisherDate: '',
            totalQuantity: 1,
            description: ''
        });
        setSelectedAuthors([]);
        setAuthorSearch('');
    };

    const handleOpenModal = (book = null) => {
        if (book) {
            setEditingBook(book);
            setFormData({
                title: book.title || '',
                categoryId: book.categoryId || '',
                publisherId: book.publisherId || '',
                authorIds: book.authorIds || [],
                isbn: book.isbn || '',
                publisherDate: book.publisherDate || '',
                totalQuantity: book.totalQuantity || 1,
                description: book.description || ''
            });
            // Set selected authors
            const bookAuthors = authors.filter(a => book.authorIds?.includes(a.id));
            setSelectedAuthors(bookAuthors);
        } else {
            setEditingBook(null);
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBook(null);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                authorIds: selectedAuthors.map(a => a.id),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
            };

            console.log('Submitting:', submitData);

            if (editingBook) {
                await bookApi.update(editingBook.id, submitData);
                alert('Book updated successfully!');
            } else {
                await bookApi.create(submitData);
                alert('Book added successfully!');
            }
            handleCloseModal();
            await fetchData(); // Refetch data after submit
        } catch (err) {
            console.error('Submit error:', err);
            alert(err.response?.data?.message || 'An error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this book?')) return;
        try {
            await bookApi.delete(id);
            alert('Book deleted successfully!');
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Cannot delete book');
        }
    };

    const handleAddPublisher = async (e) => {
        e.preventDefault();
        try {
            const response = await publisherApi.create(newPublisher);
            const createdPublisher = response.data.data;
            setPublishers(prev => [...prev, createdPublisher]);
            setFormData(prev => ({ ...prev, publisherId: createdPublisher.id }));
            setShowPublisherModal(false);
            setNewPublisher({ name: '', address: '' });
            alert('Publisher added successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Cannot add publisher');
        }
    };

    const handleAddAuthor = async (e) => {
        e.preventDefault();
        try {
            const response = await authorApi.create(newAuthor);
            const createdAuthor = response.data.data;
            setAuthors(prev => [...prev, createdAuthor]);
            setSelectedAuthors(prev => [...prev, createdAuthor]);
            setShowAuthorModal(false);
            setNewAuthor({ name: '', biography: '' });
            setAuthorSearch('');
            alert('Author added successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Cannot add author');
        }
    };

    const filteredAuthors = authors.filter(author =>
        author.name.toLowerCase().includes(authorSearch.toLowerCase()) &&
        !selectedAuthors.find(a => a.id === author.id)
    );

    const handleSelectAuthor = (author) => {
        setSelectedAuthors(prev => [...prev, author]);
        setAuthorSearch('');
        setShowAuthorDropdown(false);
    };

    const handleRemoveAuthor = (authorId) => {
        setSelectedAuthors(prev => prev.filter(a => a.id !== authorId));
    };

    const handleIsbnChange = (e) => {
        const value = e.target.value.replace(/[^0-9-]/g, '');
        setFormData(prev => ({ ...prev, isbn: value }));
    };

    const combinedSearch = (searchValue || '').toLowerCase();

    const filteredBooks = books.filter(book =>
        !combinedSearch ||
        book.title?.toLowerCase().includes(combinedSearch) ||
        book.authorNames?.some(name => name.toLowerCase().includes(combinedSearch)) ||
        book.categoryName?.toLowerCase().includes(combinedSearch) ||
        book.isbn?.toLowerCase().includes(combinedSearch)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Book Management</h1>
                    <span className="text-sm text-slate-500">({filteredBooks.length} books)</span>
                    <button
                        onClick={fetchData}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-2 rounded ${viewMode === 'card' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Book
                    </button>
                </div>
            </div>

            {/* Card View */}
            {viewMode === 'card' && filteredBooks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBooks.map((book) => (
                        <div key={book.id} className="bg-white rounded-xl border border-slate-200 p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-800">{book.title}</h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenModal(book)}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(book.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm mb-4">
                                {book.authorNames?.join(', ') || 'No author'}
                            </p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Category:</span>
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                    {book.categoryName || 'Uncategorized'}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Branch:</span>
                                    <span className="text-slate-800 text-right text-xs">
                    {book.libraryNames?.length > 0 ? book.libraryNames.join(', ') : '-'}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">ISBN:</span>
                                    <span className="text-slate-800">{book.isbn || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Quantity:</span>
                                    <span className="text-slate-800">
                    {book.availableQuantity}/{book.totalQuantity}
                  </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    book.availableQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {book.availableQuantity > 0 ? 'Available' : 'Out of Stock'}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && filteredBooks.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Book Title</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Author</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Category</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Branch</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Quantity</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredBooks.map((book) => (
                                <tr key={book.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{book.title}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{book.authorNames?.join(', ') || '-'}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{book.categoryName || '-'}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{book.libraryNames?.join(', ') || '-'}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{book.availableQuantity}/{book.totalQuantity}</td>
                                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                          book.availableQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {book.availableQuantity > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(book)}
                                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {filteredBooks.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    {searchValue ? 'No books found' : 'No books yet. Click "Add New Book" to get started.'}
                </div>
            )}

            {/* Book Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">
                                {editingBook ? 'Edit Book' : 'Add New Book'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Book Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    required
                                />
                            </div>

                            {/* Category Single-select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData(prev => ({...prev, categoryId: e.target.value}))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Publisher */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Publisher</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.publisherId}
                                        onChange={(e) => setFormData(prev => ({...prev, publisherId: e.target.value}))}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    >
                                        <option value="">Select publisher</option>
                                        {publishers.map(pub => (
                                            <option key={pub.id} value={pub.id}>{pub.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowPublisherModal(true)}
                                        className="px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Author Search & Select */}
                            <div ref={authorDropdownRef}>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>

                                {/* Selected authors */}
                                {selectedAuthors.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {selectedAuthors.map(author => (
                                            <span key={author.id} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-sm">
                        {author.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAuthor(author.id)}
                                                    className="hover:text-red-500"
                                                >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                                        ))}
                                    </div>
                                )}

                                <div className="relative flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={authorSearch}
                                            onChange={(e) => {
                                                setAuthorSearch(e.target.value);
                                                setShowAuthorDropdown(true);
                                            }}
                                            onFocus={() => setShowAuthorDropdown(true)}
                                            placeholder="Search or add author..."
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                        <ChevronDown
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 cursor-pointer"
                                            onClick={() => setShowAuthorDropdown(!showAuthorDropdown)}
                                        />

                                        {showAuthorDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredAuthors.length > 0 ? (
                                                    filteredAuthors.map(author => (
                                                        <div
                                                            key={author.id}
                                                            onClick={() => handleSelectAuthor(author)}
                                                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                                                        >
                                                            {author.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-2 text-sm text-slate-500">
                                                        {authorSearch ? 'No results found. Click + to add new.' : 'No authors available'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewAuthor({ name: authorSearch, biography: '' });
                                            setShowAuthorModal(true);
                                        }}
                                        className="px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ISBN</label>
                                    <input
                                        type="text"
                                        value={formData.isbn}
                                        onChange={handleIsbnChange}
                                        placeholder="978-0123456789"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Publication Year</label>
                                    <input
                                        type="date"
                                        value={formData.publisherDate}
                                        onChange={(e) => setFormData(prev => ({...prev, publisherDate: e.target.value}))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                                <input
                                    type="number"
                                    value={formData.totalQuantity}
                                    onChange={(e) => setFormData(prev => ({...prev, totalQuantity: parseInt(e.target.value) || 1}))}
                                    min="1"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                                >
                                    {editingBook ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Publisher Modal */}
            {showPublisherModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">Add New Publisher</h2>
                            <button onClick={() => setShowPublisherModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddPublisher} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Publisher Name *</label>
                                <input
                                    type="text"
                                    value={newPublisher.name}
                                    onChange={(e) => setNewPublisher({...newPublisher, name: e.target.value})}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={newPublisher.address}
                                    onChange={(e) => setNewPublisher({...newPublisher, address: e.target.value})}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowPublisherModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Author Modal */}
            {showAuthorModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">Add New Author</h2>
                            <button onClick={() => setShowAuthorModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddAuthor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Author Name *</label>
                                <input
                                    type="text"
                                    value={newAuthor.name}
                                    onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Biography</label>
                                <textarea
                                    value={newAuthor.biography}
                                    onChange={(e) => setNewAuthor({...newAuthor, biography: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAuthorModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBooks;