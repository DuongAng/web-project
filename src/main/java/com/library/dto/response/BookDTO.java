package com.library.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
    private Long id;
    private String title;
    private String publisherName;
    private Long publisherId;
    private String categoryName;
    private Long categoryId;
    private String description;
    private LocalDate publisherDate;
    private String isbn;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String status;
    private List<String> authorNames;
    private List<Long> authorIds;
    private List<String> libraryNames; // Danh sách chi nhánh có sách này (thôi dẹp mẹ -)) phức tạp vc)
}