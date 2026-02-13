package com.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRecordDTO {
    private Long id;
    private Long userId;
    private String username;
    private Long bookCopyId;
    private String bookTitle;
    private String libraryName;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private String status;
    private BigDecimal dailyFineRate;
    private boolean isOverdue;
    private int overdueDays;
}