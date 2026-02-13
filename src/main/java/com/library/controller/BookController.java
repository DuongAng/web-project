package com.library.controller;

import com.library.dto.request.BookRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.BookDTO;
import com.library.entity.User;
import com.library.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookDTO>>> getAllBooks() {
        List<BookDTO> books = bookService.getAllBooks();
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDTO>> getBookById(@PathVariable Long id) {
        try {
            BookDTO book = bookService.getBookById(id);
            return ResponseEntity.ok(ApiResponse.success(book));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<BookDTO>>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> books = bookService.searchBooks(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getBooksByCategory(@PathVariable Long categoryId) {
        List<BookDTO> books = bookService.getBooksByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getAvailableBooks() {
        List<BookDTO> books = bookService.getAvailableBooks();
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookDTO>> createBook(
            @Valid @RequestBody BookRequest request,
            @AuthenticationPrincipal User user) {
        try {
            BookDTO book = bookService.createBook(request, user);
            return ResponseEntity.ok(ApiResponse.success("Successfully added more books.", book));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookDTO>> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request) {
        try {
            BookDTO book = bookService.updateBook(id, request);
            return ResponseEntity.ok(ApiResponse.success("Book update successful", book));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBook(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            bookService.deleteBook(id, user);
            return ResponseEntity.ok(ApiResponse.success("Book deletion successful", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}