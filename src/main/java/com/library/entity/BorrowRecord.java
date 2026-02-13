package com.library.entity;

import jakarta.persistence.*;
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
@Entity
@Table(name = "borrow_records")
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    // Cho phép null khi user bị xóa
    private User user;

    // Lưu username riêng để giữ lại khi user bị xóa
    @Column(name = "username")
    private String username;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_copy_id", nullable = true)
    // Cho phép null khi sách bị xóa
    private BookCopy bookCopy;

    // Lưu book title riêng để giữ lại khi sách bị xóa
    @Column(name = "book_title")
    private String bookTitle;

    @Column(name = "borrow_date", nullable = false)
    private LocalDate borrowDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(length = 50)
    private String status; // PENDING, BORROWING, RETURNED, OVERDUE, REJECTED

    @Column(name = "daily_fine_rate", precision = 10, scale = 2)
    private BigDecimal dailyFineRate;
}