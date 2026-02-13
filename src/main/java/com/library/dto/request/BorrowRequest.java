package com.library.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class BorrowRequest {

    @NotNull(message = "Book copy ID is required")
    private Long bookCopyId;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    public BorrowRequest() {
    }

    public BorrowRequest(Long bookCopyId, LocalDate dueDate) {
        this.bookCopyId = bookCopyId;
        this.dueDate = dueDate;
    }

    public Long getBookCopyId() {
        return bookCopyId;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setBookCopyId(Long bookCopyId) {
        this.bookCopyId = bookCopyId;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}