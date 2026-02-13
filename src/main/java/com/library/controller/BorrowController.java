package com.library.controller;

import com.library.dto.request.BorrowRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.BorrowRecordDTO;
import com.library.entity.User;
import com.library.service.BorrowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrows")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowRecordDTO>>> getAllBorrowRecords() {
        List<BorrowRecordDTO> records = borrowService.getAllBorrowRecords();
        return ResponseEntity.ok(ApiResponse.success(records));
    }


    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowRecordDTO>>> getPendingRecords() {
        List<BorrowRecordDTO> records = borrowService.getPendingRecords();
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/my-borrows")
    public ResponseEntity<ApiResponse<List<BorrowRecordDTO>>> getMyBorrowRecords(
            @AuthenticationPrincipal User user) {
        List<BorrowRecordDTO> records = borrowService.getBorrowRecordsByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/my-current")
    public ResponseEntity<ApiResponse<List<BorrowRecordDTO>>> getMyCurrentBorrows(
            @AuthenticationPrincipal User user) {
        List<BorrowRecordDTO> records = borrowService.getCurrentBorrowsByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BorrowRecordDTO>> getBorrowRecordById(@PathVariable Long id) {
        try {
            BorrowRecordDTO record = borrowService.getBorrowRecordById(id);
            return ResponseEntity.ok(ApiResponse.success(record));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowRecordDTO>>> getBorrowRecordsByUser(
            @PathVariable Long userId) {
        List<BorrowRecordDTO> records = borrowService.getBorrowRecordsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    // gửi yêu cầu mượn sách từ user
    @PostMapping
    public ResponseEntity<ApiResponse<BorrowRecordDTO>> borrowBook(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BorrowRequest request) {
        try {
            BorrowRecordDTO record = borrowService.borrowBook(user.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Your book borrowing request has been submitted, please wait for approval.", record));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // duyệt thôi
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BorrowRecordDTO>> approveBorrow(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            BorrowRecordDTO record = borrowService.approveBorrow(id, user);
            return ResponseEntity.ok(ApiResponse.success("Book loan approved", record));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // đéo duyệt -))
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BorrowRecordDTO>> rejectBorrow(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            BorrowRecordDTO record = borrowService.rejectBorrow(id, user);
            return ResponseEntity.ok(ApiResponse.success("The loan request has been denied.", record));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Xác nhận trả sách
    @PutMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<BorrowRecordDTO>> returnBook(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            BorrowRecordDTO record = borrowService.returnBook(id, user);
            return ResponseEntity.ok(ApiResponse.success("Book return confirmed", record));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowRecordDTO>>> getOverdueRecords() {
        List<BorrowRecordDTO> records = borrowService.getOverdueRecords();
        return ResponseEntity.ok(ApiResponse.success(records));
    }
}