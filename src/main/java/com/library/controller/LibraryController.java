package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.entity.Library;
import com.library.service.LibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/libraries")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Library>>> getAllLibraries() {
        List<Library> libraries = libraryService.getAllLibraries();
        return ResponseEntity.ok(ApiResponse.success(libraries));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Library>> getLibraryById(@PathVariable Long id) {
        try {
            Library library = libraryService.getLibraryById(id);
            return ResponseEntity.ok(ApiResponse.success(library));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Library>> createLibrary(@RequestBody Library library) {
        try {
            Library created = libraryService.createLibrary(library);
            return ResponseEntity.ok(ApiResponse.success("Library created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Library>> updateLibrary(
            @PathVariable Long id,
            @RequestBody Library library) {
        try {
            Library updated = libraryService.updateLibrary(id, library);
            return ResponseEntity.ok(ApiResponse.success("Library updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLibrary(@PathVariable Long id) {
        try {
            libraryService.deleteLibrary(id);
            return ResponseEntity.ok(ApiResponse.success("Library deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}