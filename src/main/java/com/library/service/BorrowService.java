package com.library.service;

import com.library.dto.request.BorrowRequest;
import com.library.dto.response.BorrowRecordDTO;
import com.library.entity.*;
import com.library.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final FineRepository fineRepository;
    private final ActivityLogRepository activityLogRepository;

    private static final BigDecimal DEFAULT_DAILY_FINE_RATE = new BigDecimal("5"); // 5 đô 1 ngày -))
    private static final int DEFAULT_BORROW_DAYS = 14; // cho cố định là 14 tuy nhiên thay đổi được

    private void logActivity(User user, String action) {
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setUsername(user.getUsername());
        log.setUserRole(user.getRole().getName());
        log.setAction(action);
        activityLogRepository.save(log);
    }

    public List<BorrowRecordDTO> getAllBorrowRecords() {
        return borrowRecordRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BorrowRecordDTO> getBorrowRecordsByUser(Long userId) {
        return borrowRecordRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BorrowRecordDTO> getCurrentBorrowsByUser(Long userId) {
        return borrowRecordRepository.findCurrentBorrowsByUser(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BorrowRecordDTO getBorrowRecordById(Long id) {
        BorrowRecord record = borrowRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        return convertToDTO(record);
    }

    /*
     * User yêu cầu mượn sách - Status = PENDING (chờ duyệt)
     * Chưa thay đổi số lượng sách, chưa đổi trạng thái book copy
     */
    @Transactional
    public BorrowRecordDTO borrowBook(Long userId, BorrowRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("No user found"));

        BookCopy bookCopy = bookCopyRepository.findById(request.getBookCopyId())
                .orElseThrow(() -> new RuntimeException("No copy of the book found."));

        if (!"AVAILABLE".equals(bookCopy.getStatus())) {
            throw new RuntimeException("This book is currently not available for loan.");
        }

        // Kiểm tra user đã có yêu cầu PENDING cho sách này chưa
        boolean alreadyRequested = borrowRecordRepository.findByUserId(userId).stream()
                .filter(br -> br.getBookCopy() != null)
                .anyMatch(br -> br.getBookCopy().getBook().getId().equals(bookCopy.getBook().getId())
                        && "PENDING".equals(br.getStatus()));
        if (alreadyRequested) {
            throw new RuntimeException("You have already requested to borrow this book, please wait for approval.");
        }

        // Create borrow record với status PENDING
        BorrowRecord borrowRecord = new BorrowRecord();
        borrowRecord.setUser(user);
        borrowRecord.setUsername(user.getUsername());
        borrowRecord.setBookCopy(bookCopy);
        borrowRecord.setBookTitle(bookCopy.getBook().getTitle());
        borrowRecord.setBorrowDate(LocalDate.now()); // Ngày yêu cầu
        borrowRecord.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(DEFAULT_BORROW_DAYS));
        borrowRecord.setStatus("PENDING"); // Chờ duyệt
        borrowRecord.setDailyFineRate(DEFAULT_DAILY_FINE_RATE);

        /*
        // KHÔNG thay đổi book copy status và available quantity ở đây
        // Chỉ thay đổi khi Staff/Admin duyệt
        */
        BorrowRecord savedRecord = borrowRecordRepository.save(borrowRecord);

        // Log lại
        logActivity(user, "Request to borrow a book: " + bookCopy.getBook().getTitle());

        return convertToDTO(savedRecord);
    }

    /*
     * Staff/Admin duyệt yêu cầu mượn - Status PENDING sẽ chuyển qua BORROWING
     * Lúc này mới giảm số lượng sách và đổi trạng thái book copy
     */
    @Transactional
    public BorrowRecordDTO approveBorrow(Long borrowRecordId, User approver) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("No loan requests found."));

        if (!"PENDING".equals(borrowRecord.getStatus())) {
            throw new RuntimeException("This request has already been processed.");
        }

        BookCopy bookCopy = borrowRecord.getBookCopy();

        // Kiểm tra sách còn available không
        if (!"AVAILABLE".equals(bookCopy.getStatus())) {
            throw new RuntimeException("This book is currently unavailable.");
        }

        // Cập nhật ngày mượn thực tế và hạn trả
        borrowRecord.setBorrowDate(LocalDate.now());
        borrowRecord.setDueDate(LocalDate.now().plusDays(DEFAULT_BORROW_DAYS));
        borrowRecord.setStatus("BORROWING");

        bookCopy.setStatus("BORROWED");
        bookCopyRepository.save(bookCopy);

        Book book = bookCopy.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        bookRepository.save(book);

        BorrowRecord savedRecord = borrowRecordRepository.save(borrowRecord);

        // Log
        logActivity(approver, "Approve book lending '" + book.getTitle() + "'  " + borrowRecord.getUser().getUsername());

        return convertToDTO(savedRecord);
    }

    /*
     * Staff/Admin từ chối yêu cầu mượn - Status PENDING chuyển trạng thái thành REJECTED
     */
    @Transactional
    public BorrowRecordDTO rejectBorrow(Long borrowRecordId, User rejector) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("No loan requests found."));

        if (!"PENDING".equals(borrowRecord.getStatus())) {
            throw new RuntimeException("This request has already been processed.");
        }

        borrowRecord.setStatus("REJECTED");
        BorrowRecord savedRecord = borrowRecordRepository.save(borrowRecord);

        // Log
        String bookTitle = borrowRecord.getBookCopy().getBook().getTitle();
        logActivity(rejector, "Refuse the book borrowing request. '" + bookTitle + "' " + borrowRecord.getUser().getUsername());

        return convertToDTO(savedRecord);
    }

    @Transactional
    public BorrowRecordDTO returnBook(Long borrowRecordId, User staff) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("No borrowing record found."));

        if (!"BORROWING".equals(borrowRecord.getStatus()) && !"OVERDUE".equals(borrowRecord.getStatus())) {
            throw new RuntimeException("This book has either not been borrowed or has already been returned.");
        }

        LocalDate today = LocalDate.now();
        borrowRecord.setReturnDate(today);
        borrowRecord.setStatus("RETURNED");

        BookCopy bookCopy = borrowRecord.getBookCopy();
        bookCopy.setStatus("AVAILABLE");
        bookCopyRepository.save(bookCopy);

        Book book = bookCopy.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookRepository.save(book);

        if (today.isAfter(borrowRecord.getDueDate())) {
            long lateDays = ChronoUnit.DAYS.between(borrowRecord.getDueDate(), today);
            BigDecimal fineAmount = borrowRecord.getDailyFineRate().multiply(BigDecimal.valueOf(lateDays));

            Fine fine = new Fine();
            fine.setBorrowRecord(borrowRecord);
            fine.setAmount(fineAmount);
            fine.setStatus("PENDING");
            fine.setIssuedDate(today);
            fine.setLateDays((int) lateDays);
            fine.setReason("Return books late " + lateDays + " day");

            fineRepository.save(fine);

            // Log trả nếu bị phạt
            logActivity(staff, "Confirm book return '" + book.getTitle() + "' " + borrowRecord.getUser().getUsername() + " (late " + lateDays + " day, punish " + fineAmount + "$)");
        } else {
            // Log đếch bị phạt
            logActivity(staff, "Confirm book return '" + book.getTitle() + "' " + borrowRecord.getUser().getUsername());
        }

        BorrowRecord savedRecord = borrowRecordRepository.save(borrowRecord);
        return convertToDTO(savedRecord);
    }

    public List<BorrowRecordDTO> getOverdueRecords() {
        return borrowRecordRepository.findOverdueRecords(LocalDate.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BorrowRecordDTO> getPendingRecords() {
        return borrowRecordRepository.findByStatus("PENDING").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private BorrowRecordDTO convertToDTO(BorrowRecord record) {
        LocalDate today = LocalDate.now();
        boolean isOverdue = "BORROWING".equals(record.getStatus()) &&
                record.getReturnDate() == null &&
                today.isAfter(record.getDueDate());
        int overdueDays = isOverdue ? (int) ChronoUnit.DAYS.between(record.getDueDate(), today) : 0;

        BorrowRecordDTO dto = new BorrowRecordDTO();
        dto.setId(record.getId());

        if (record.getUser() != null) {
            dto.setUserId(record.getUser().getId());
            dto.setUsername(record.getUser().getUsername());
        } else {
            dto.setUserId(null);
            dto.setUsername(record.getUsername());
        }

        if (record.getBookCopy() != null) {
            dto.setBookCopyId(record.getBookCopy().getId());
            dto.setBookTitle(record.getBookCopy().getBook().getTitle());
            dto.setLibraryName(record.getBookCopy().getLibrary().getName());
        } else {
            dto.setBookCopyId(null);
            dto.setBookTitle(record.getBookTitle());
            dto.setLibraryName(null);
        }

        dto.setBorrowDate(record.getBorrowDate());
        dto.setDueDate(record.getDueDate());
        dto.setReturnDate(record.getReturnDate());
        dto.setStatus(record.getStatus());
        dto.setDailyFineRate(record.getDailyFineRate());
        dto.setOverdue(isOverdue);
        dto.setOverdueDays(overdueDays);
        return dto;
    }
}