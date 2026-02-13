package com.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookCopyDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private Long libraryId;
    private String libraryName;
    private String status;
}