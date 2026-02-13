package com.library.service;

import com.library.entity.Book;
import com.library.entity.BookCopy;
import com.library.entity.Library;
import com.library.repository.BookCopyRepository;
import com.library.repository.BookRepository;
import com.library.repository.LibraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookCopyService {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final LibraryRepository libraryRepository;

    public List<BookCopy> getAllBookCopies() {
        return bookCopyRepository.findAll();
    }

    public BookCopy getBookCopyById(Long id) {
        return bookCopyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book copy not found"));
    }

    public List<BookCopy> getBookCopiesByBook(Long bookId) {
        return bookCopyRepository.findByBookId(bookId);
    }

    public List<BookCopy> getBookCopiesByLibrary(Long libraryId) {
        return bookCopyRepository.findByLibraryId(libraryId);
    }

    public List<BookCopy> getAvailableCopies(Long bookId) {
        return bookCopyRepository.findByBookIdAndStatus(bookId, "AVAILABLE");
    }

    @Transactional
    public BookCopy createBookCopy(Long bookId, Long libraryId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        Library library = libraryRepository.findById(libraryId)
                .orElseThrow(() -> new RuntimeException("Library not found"));

        BookCopy bookCopy = new BookCopy();
        bookCopy.setBook(book);
        bookCopy.setLibrary(library);
        bookCopy.setStatus("AVAILABLE");

//        thêm sách
        book.setTotalQuantity(book.getTotalQuantity() + 1);
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookRepository.save(book);

        return bookCopyRepository.save(bookCopy);
    }

    @Transactional
    public BookCopy updateBookCopyStatus(Long id, String status) {
        BookCopy bookCopy = getBookCopyById(id);
        bookCopy.setStatus(status);
        return bookCopyRepository.save(bookCopy);
    }

    @Transactional
    public void deleteBookCopy(Long id) {
        BookCopy bookCopy = getBookCopyById(id);

        if ("BORROWED".equals(bookCopy.getStatus())) {
            throw new RuntimeException("Cannot delete a borrowed book copy");
        }

        Book book = bookCopy.getBook();
        book.setTotalQuantity(book.getTotalQuantity() - 1);
        if ("AVAILABLE".equals(bookCopy.getStatus())) {

            book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        }
        bookRepository.save(book);

        bookCopyRepository.deleteById(id);
    }
}