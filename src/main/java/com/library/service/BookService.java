package com.library.service;

import com.library.dto.request.BookRequest;
import com.library.dto.response.BookDTO;
import com.library.entity.*;
import com.library.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final PublisherRepository publisherRepository;
    private final AuthorRepository authorRepository;
    private final BookCopyRepository bookCopyRepository;
    private final LibraryRepository libraryRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    private void logActivity(User user, String action) {
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setUsername(user.getUsername());
        log.setUserRole(user.getRole().getName());
        log.setAction(action);
        activityLogRepository.save(log);
    }

    public List<BookDTO> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        return convertToDTO(book);
    }

    public Page<BookDTO> searchBooks(String keyword, Pageable pageable) {
        return bookRepository.searchBooks(keyword, pageable)
                .map(this::convertToDTO);
    }

    public List<BookDTO> getBooksByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookDTO> getAvailableBooks() {
        return bookRepository.findByAvailableQuantityGreaterThan(0).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookDTO createBook(BookRequest request, User staff) {
        Book book = new Book();
        updateBookFromRequest(book, request);
        book.setAvailableQuantity(request.getTotalQuantity());
        book.setStatus("AVAILABLE");

        Book savedBook = bookRepository.save(book);

        createBookCopies(savedBook, request.getTotalQuantity());

        // Log lại
        logActivity(staff, "Add new books: " + savedBook.getTitle());

        return convertToDTO(savedBook);
    }

    private void createBookCopies(Book book, int quantity) {
        Library defaultLibrary = libraryRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No library found. Please create a library first."));

        for (int i = 0; i < quantity; i++) {
            BookCopy copy = new BookCopy();
            copy.setBook(book);
            copy.setLibrary(defaultLibrary);
            copy.setStatus("AVAILABLE");
            bookCopyRepository.save(copy);
        }
    }

    @Transactional
    public BookDTO updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        int oldQuantity = book.getTotalQuantity();
        int newQuantity = request.getTotalQuantity();

        updateBookFromRequest(book, request);

        if (newQuantity > oldQuantity) {
            int additionalCopies = newQuantity - oldQuantity;
            createBookCopies(book, additionalCopies);
            book.setAvailableQuantity(book.getAvailableQuantity() + additionalCopies);
        }

        Book savedBook = bookRepository.save(book);
        return convertToDTO(savedBook);
    }

    @Transactional
    public void deleteBook(Long id, User staff) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No book found"));

        String bookTitle = book.getTitle();

        // Kiểm tra xem có bản copy nào đang được mượn không
        List<BookCopy> copies = bookCopyRepository.findByBookId(id);
        for (BookCopy copy : copies) {
            List<BorrowRecord> activeRecords = borrowRecordRepository.findByBookCopyId(copy.getId()).stream()
                    .filter(br -> "BORROWING".equals(br.getStatus()) || "PENDING".equals(br.getStatus()))
                    .collect(Collectors.toList());
            if (!activeRecords.isEmpty()) {
                throw new RuntimeException("This book cannot be deleted because it is already there. " + activeRecords.size() + " The copy is currently on loan or awaiting approval.");
            }
        }

        // Set bookCopy = null trong các borrow_records đã RETURNED để giữ lịch sử
        for (BookCopy copy : copies) {
            List<BorrowRecord> records = borrowRecordRepository.findByBookCopyId(copy.getId());
            for (BorrowRecord record : records) {
                record.setBookTitle(bookTitle);
                record.setBookCopy(null);
            }
            borrowRecordRepository.saveAll(records);
        }

        bookCopyRepository.deleteByBookId(id);
        bookRepository.deleteById(id);

        // Log lại
        logActivity(staff, "Delete book: " + bookTitle);
    }

    private void updateBookFromRequest(Book book, BookRequest request) {
        book.setTitle(request.getTitle());
        book.setDescription(request.getDescription());
        book.setPublisherDate(request.getPublisherDate());
        book.setIsbn(request.getIsbn());
        book.setTotalQuantity(request.getTotalQuantity());

        if (request.getStatus() != null) {
            book.setStatus(request.getStatus());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            book.setCategory(category);
        } else {
            book.setCategory(null);
        }

        if (request.getPublisherId() != null) {
            Publisher publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new RuntimeException("Publisher not found"));
            book.setPublisher(publisher);
        } else {
            book.setPublisher(null);
        }

        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            Set<Author> authors = new HashSet<>(authorRepository.findAllById(request.getAuthorIds()));
            book.setAuthors(authors);
        } else {
            book.setAuthors(new HashSet<>());
        }
    }

    private BookDTO convertToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setPublisherName(book.getPublisher() != null ? book.getPublisher().getName() : null);
        dto.setPublisherId(book.getPublisher() != null ? book.getPublisher().getId() : null);
        dto.setCategoryName(book.getCategory() != null ? book.getCategory().getName() : null);
        dto.setCategoryId(book.getCategory() != null ? book.getCategory().getId() : null);
        dto.setDescription(book.getDescription());
        dto.setPublisherDate(book.getPublisherDate());
        dto.setIsbn(book.getIsbn());
        dto.setTotalQuantity(book.getTotalQuantity());
        dto.setAvailableQuantity(book.getAvailableQuantity());
        dto.setStatus(book.getStatus());
        dto.setAuthorNames(book.getAuthors().stream().map(Author::getName).collect(Collectors.toList()));
        dto.setAuthorIds(book.getAuthors().stream().map(Author::getId).collect(Collectors.toList()));

        // Lấy danh sách theo chi nhanh (nói chung thì không dùng)
        List<BookCopy> copies = bookCopyRepository.findByBookId(book.getId());
        List<String> libraryNames = copies.stream()
                .map(copy -> copy.getLibrary().getName())
                .distinct()
                .collect(Collectors.toList());
        dto.setLibraryNames(libraryNames);

        return dto;
    }
}