package com.library.repository;

import com.library.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUserId(Long userId);


    List<BorrowRecord> findByBookCopyId(Long bookCopyId);

    List<BorrowRecord> findByStatus(String status);

    @Query("SELECT br FROM BorrowRecord br WHERE br.dueDate < :today AND br.status = 'BORROWING'")
    List<BorrowRecord> findOverdueRecords(@Param("today") LocalDate today);

    @Query("SELECT br FROM BorrowRecord br WHERE br.user.id = :userId AND br.status = 'BORROWING'")
    List<BorrowRecord> findCurrentBorrowsByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.user.id = :userId AND br.status = 'BORROWING'")
    Long countCurrentBorrowsByUser(@Param("userId") Long userId);
}