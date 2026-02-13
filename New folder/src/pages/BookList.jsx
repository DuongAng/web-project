import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookApi, bookCopyApi, borrowApi } from '../services/api';
import { X } from 'lucide-react';

const BookList = () => {
    const { searchValue } = useOutletContext();
    const { hasRole } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowDays, setBorrowDays] = useState(14);
    const [borrowing, setBorrowing] = useState(false);
    const [availableCopies, setAvailableCopies] = useState([]);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await bookApi.getAll();
            setBooks(response.data.data || []);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter books based on search
    const filteredBooks = books.filter(book => {
        if (!searchValue) return true;
        const search = searchValue.toLowerCase();
        return (
            book.title?.toLowerCase().includes(search) ||
            book.authorNames?.some(author => author.toLowerCase().includes(search))
        );
    });

    const handleBorrowClick = async (book) => {
        setSelectedBook(book);
        setBorrowDays(14);
        try {
            const response = await bookCopyApi.getAvailable(book.id);
            setAvailableCopies(response.data.data || []);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching available copies:', error);
            alert('Unable to retrieve book information');
        }
    };

    const handleBorrow = async () => {
        if (availableCopies.length === 0) {
            alert('No copies are available.');
            return;
        }

        setBorrowing(true);
        try {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + borrowDays);

            await borrowApi.borrow({
                bookCopyId: availableCopies[0].id,
                dueDate: dueDate.toISOString().split('T')[0]
            });

            alert('The book borrowing request has been submitted!\n' +
                'Please wait for the library staff to approve your request..');
            setShowModal(false);
            fetchBooks();
        } catch (error) {
            console.error('Error borrowing book:', error);
            alert(error.response?.data?.message || 'Unable to submit a book borrowing request.');
        } finally {
            setBorrowing(false);
        }
    };

    const getDueDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + borrowDays);
        return date.toISOString().split('T')[0];
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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-slate-800">Book List</h1>
                <p className="text-slate-500">{filteredBooks.length} books found</p>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBooks.map((book) => (
                    <div key={book.id} className="bg-white rounded-xl border border-slate-200 p-5">
                        <h3 className="font-semibold text-slate-800 mb-1">{book.title}</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            {book.authorNames?.join(', ') || 'No author yet.'}
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
                                <span className="text-slate-800 text-right">
                  {book.libraryNames?.length > 0 ? book.libraryNames.join(', ') : '-'}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Quantity:</span>
                                <span className="text-slate-800">
                  {book.availableQuantity}/{book.totalQuantity}
                </span>
                            </div>
                        </div>

                        {/* Borrow Button - chỉ dành cho USER */}
                        {hasRole('USER') && (
                            <button
                                onClick={() => handleBorrowClick(book)}
                                disabled={book.availableQuantity === 0}
                                className={`w-full mt-4 py-2.5 rounded-lg font-medium transition-colors ${
                                    book.availableQuantity > 0
                                        ? 'bg-slate-800 text-white hover:bg-slate-700'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {book.availableQuantity > 0 ? 'Borrow' : 'Out of Stock'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {filteredBooks.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No books found
                </div>
            )}

            {/* Borrow Modal */}
            {showModal && selectedBook && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">Request to borrow books</h2>
                                <p className="text-slate-500 text-sm">
                                    Submit a book borrowing request. "{selectedBook.title}"
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                                Your book borrowing request will be sent to the library staff. Once approved, you can pick up the book..
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Number of days borrowed</label>
                            <input
                                type="number"
                                value={borrowDays}
                                onChange={(e) => setBorrowDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                                min="1"
                                max="30"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />
                        </div>

                        <div className="space-y-2 text-sm text-slate-600 mb-6">
                            <p>Expected payment deadline: <span className="font-medium text-slate-800">{getDueDate()}</span></p>
                            <p>fine: <span className="font-medium text-slate-800">$5/day for late payments.</span></p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBorrow}
                                disabled={borrowing || availableCopies.length === 0}
                                className="flex-1 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                            >
                                {borrowing ? 'Processing...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookList;