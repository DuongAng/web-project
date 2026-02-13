package com.library.repository;

import com.library.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {

    List<Fine> findByBorrowRecordId(Long borrowRecordId);

    List<Fine> findByStatus(String status);

    @Query("SELECT f FROM Fine f WHERE f.borrowRecord.user.id = :userId")
    List<Fine> findByUserId(@Param("userId") Long userId);

    @Query("SELECT f FROM Fine f WHERE f.borrowRecord.user.id = :userId AND f.status = :status")
    List<Fine> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.borrowRecord.user.id = :userId AND f.status = 'PENDING'")
    java.math.BigDecimal getTotalPendingFinesByUser(@Param("userId") Long userId);
}