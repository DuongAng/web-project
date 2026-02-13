package com.library.service;

import com.library.dto.response.FineDTO;
import com.library.entity.ActivityLog;
import com.library.entity.BorrowRecord;
import com.library.entity.Fine;
import com.library.entity.User;
import com.library.repository.ActivityLogRepository;
import com.library.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FineService {

    private final FineRepository fineRepository;
    private final ActivityLogRepository activityLogRepository;

    private void logActivity(User user, String action) {
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setUsername(user.getUsername());
        log.setUserRole(user.getRole().getName());
        log.setAction(action);
        activityLogRepository.save(log);
    }

    public List<FineDTO> getAllFines() {
        return fineRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<FineDTO> getFinesByUser(Long userId) {
        return fineRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<FineDTO> getPendingFinesByUser(Long userId) {
        return fineRepository.findByUserIdAndStatus(userId, "PENDING").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalPendingFines(Long userId) {
        BigDecimal total = fineRepository.getTotalPendingFinesByUser(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public FineDTO getFineById(Long id) {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        return convertToDTO(fine);
    }

    @Transactional
    public FineDTO payFine(Long fineId, User staff) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("No penalties found."));

        if (!"PENDING".equals(fine.getStatus())) {
            throw new RuntimeException("This fine has already been processed.");
        }

        fine.setStatus("PAID");
        Fine savedFine = fineRepository.save(fine);

        // Log
        String bookTitle = fine.getBorrowRecord().getBookCopy().getBook().getTitle();
        String borrower = fine.getBorrowRecord().getUser().getUsername();
        logActivity(staff, "Confirm payment of fine " + fine.getAmount() + "$  " + borrower + " (book: " + bookTitle + ")");

        return convertToDTO(savedFine);
    }

    @Transactional
    public FineDTO waiveFine(Long fineId, String reason, User staff) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("No penalties found."));

        if (!"PENDING".equals(fine.getStatus())) {
            throw new RuntimeException("This fine has already been processed.");
        }

        fine.setStatus("WAIVED");
        fine.setReason(fine.getReason() + " | No penalty: " + reason);
        Fine savedFine = fineRepository.save(fine);

        // Log activity
        String bookTitle = fine.getBorrowRecord().getBookCopy().getBook().getTitle();
        String borrower = fine.getBorrowRecord().getUser().getUsername();
        logActivity(staff, "No penalty " + fine.getAmount() + "$ for " + borrower + " (book: " + bookTitle + ", reason: " + reason + ")");

        return convertToDTO(savedFine);
    }

    public List<FineDTO> getPendingFines() {
        return fineRepository.findByStatus("PENDING").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private FineDTO convertToDTO(Fine fine) {
        FineDTO dto = new FineDTO();
        dto.setId(fine.getId());
        dto.setBorrowRecordId(fine.getBorrowRecord().getId());

        BorrowRecord br = fine.getBorrowRecord();

        // Xử lý bookCopy có thể null
        if (br.getBookCopy() != null) {
            dto.setBookTitle(br.getBookCopy().getBook().getTitle());
            dto.setLibraryName(br.getBookCopy().getLibrary().getName());
        } else {
            dto.setBookTitle(br.getBookTitle());
            dto.setLibraryName(null);
        }

        // Xử lý user có thể null
        if (br.getUser() != null) {
            dto.setUsername(br.getUser().getUsername());
        } else {
            dto.setUsername(br.getUsername());
        }

        dto.setAmount(fine.getAmount());
        dto.setStatus(fine.getStatus());
        dto.setIssuedDate(fine.getIssuedDate());
        dto.setLateDays(fine.getLateDays());
        dto.setReason(fine.getReason());
        return dto;
    }
}