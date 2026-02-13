package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.dto.response.FineDTO;
import com.library.entity.User;
import com.library.service.FineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/fines")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getAllFines() {
        List<FineDTO> fines = fineService.getAllFines();
        return ResponseEntity.ok(ApiResponse.success(fines));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getPendingFines() {
        List<FineDTO> fines = fineService.getPendingFines();
        return ResponseEntity.ok(ApiResponse.success(fines));
    }

    @GetMapping("/my-fines")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getMyFines(@AuthenticationPrincipal User user) {
        List<FineDTO> fines = fineService.getFinesByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success(fines));
    }

    @GetMapping("/my-pending")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getMyPendingFines(@AuthenticationPrincipal User user) {
        List<FineDTO> fines = fineService.getPendingFinesByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success(fines));
    }

    @GetMapping("/my-total")
    public ResponseEntity<ApiResponse<BigDecimal>> getMyTotalPendingFines(@AuthenticationPrincipal User user) {
        BigDecimal total = fineService.getTotalPendingFines(user.getId());
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FineDTO>> getFineById(@PathVariable Long id) {
        try {
            FineDTO fine = fineService.getFineById(id);
            return ResponseEntity.ok(ApiResponse.success(fine));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<FineDTO>>> getFinesByUser(@PathVariable Long userId) {
        List<FineDTO> fines = fineService.getFinesByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(fines));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<FineDTO>> payFine(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            FineDTO fine = fineService.payFine(id, user);
            return ResponseEntity.ok(ApiResponse.success("Penalty payment successful.", fine));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/waive")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<FineDTO>> waiveFine(
            @PathVariable Long id,
            @RequestParam String reason,
            @AuthenticationPrincipal User user) {
        try {
            FineDTO fine = fineService.waiveFine(id, reason, user);
            return ResponseEntity.ok(ApiResponse.success("Penalty waived successfully.", fine));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}