package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.dto.response.BookCopyDTO;
import com.library.entity.BookCopy;
import com.library.service.BookCopyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/book-copies")
@RequiredArgsConstructor
public class BookCopyController {

    private final BookCopyService bookCopyService;

    private BookCopyDTO convertToDTO(BookCopy copy) {
        BookCopyDTO dto = new BookCopyDTO();
        dto.setId(copy.getId());
        dto.setBookId(copy.getBook().getId());
        dto.setBookTitle(copy.getBook().getTitle());
        dto.setBookIsbn(copy.getBook().getIsbn());
        dto.setLibraryId(copy.getLibrary().getId());
        dto.setLibraryName(copy.getLibrary().getName());
        dto.setStatus(copy.getStatus());
        return dto;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookCopyDTO>>> getAllBookCopies() {
        List<BookCopyDTO> copies = bookCopyService.getAllBookCopies().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(copies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookCopyDTO>> getBookCopyById(@PathVariable Long id) {
        try {
            BookCopy copy = bookCopyService.getBookCopyById(id);
            return ResponseEntity.ok(ApiResponse.success(convertToDTO(copy)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<ApiResponse<List<BookCopyDTO>>> getBookCopiesByBook(@PathVariable Long bookId) {
        List<BookCopyDTO> copies = bookCopyService.getBookCopiesByBook(bookId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(copies));
    }

    @GetMapping("/library/{libraryId}")
    public ResponseEntity<ApiResponse<List<BookCopyDTO>>> getBookCopiesByLibrary(@PathVariable Long libraryId) {
        List<BookCopyDTO> copies = bookCopyService.getBookCopiesByLibrary(libraryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(copies));
    }

    @GetMapping("/book/{bookId}/available")
    public ResponseEntity<ApiResponse<List<BookCopyDTO>>> getAvailableCopies(@PathVariable Long bookId) {
        List<BookCopyDTO> copies = bookCopyService.getAvailableCopies(bookId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(copies));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookCopyDTO>> createBookCopy(@RequestBody Map<String, Long> request) {
        try {
            Long bookId = request.get("bookId");
            Long libraryId = request.get("libraryId");
            BookCopy created = bookCopyService.createBookCopy(bookId, libraryId);
            return ResponseEntity.ok(ApiResponse.success("Book copy created successfully", convertToDTO(created)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookCopyDTO>> updateBookCopyStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            BookCopy updated = bookCopyService.updateBookCopyStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Book copy status updated successfully", convertToDTO(updated)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBookCopy(@PathVariable Long id) {
        try {
            bookCopyService.deleteBookCopy(id);
            return ResponseEntity.ok(ApiResponse.success("Book copy deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}