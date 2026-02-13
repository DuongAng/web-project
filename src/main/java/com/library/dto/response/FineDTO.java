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
public class FineDTO {
    private Long id;
    private Long borrowRecordId;
    private String bookTitle;
    private String username;
    private String libraryName;
    private BigDecimal amount;
    private String status;
    private LocalDate issuedDate;
    private Integer lateDays;
    private String reason;
}