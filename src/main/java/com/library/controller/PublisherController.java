package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.entity.Publisher;
import com.library.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
public class PublisherController {

    private final PublisherService publisherService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Publisher>>> getAllPublishers() {
        List<Publisher> publishers = publisherService.getAllPublishers();
        return ResponseEntity.ok(ApiResponse.success(publishers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Publisher>> getPublisherById(@PathVariable Long id) {
        try {
            Publisher publisher = publisherService.getPublisherById(id);
            return ResponseEntity.ok(ApiResponse.success(publisher));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Publisher>> createPublisher(@RequestBody Publisher publisher) {
        try {
            Publisher created = publisherService.createPublisher(publisher);
            return ResponseEntity.ok(ApiResponse.success("Publisher created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Publisher>> updatePublisher(
            @PathVariable Long id,
            @RequestBody Publisher publisher) {
        try {
            Publisher updated = publisherService.updatePublisher(id, publisher);
            return ResponseEntity.ok(ApiResponse.success("Publisher updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePublisher(@PathVariable Long id) {
        try {
            publisherService.deletePublisher(id);
            return ResponseEntity.ok(ApiResponse.success("Publisher deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}