package com.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class BookRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private Long publisherId;

    private Long categoryId;

    private String description;

    private LocalDate publisherDate;

    private String isbn;

    @NotNull(message = "Total quantity is required")
    private Integer totalQuantity;

    private String status;

    private List<Long> authorIds;
}