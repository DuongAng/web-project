package com.library.repository;

import com.library.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    List<BookCopy> findByBookId(Long bookId);
    List<BookCopy> findByLibraryId(Long libraryId);
    List<BookCopy> findByBookIdAndStatus(Long bookId, String status);
    void deleteByBookId(Long bookId);
}