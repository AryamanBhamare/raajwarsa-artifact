package com.raajwarasa.dto;

import jakarta.validation.constraints.NotBlank;

public record InquiryStatusRequest(
        @NotBlank(message = "Status is required")
        String status
) {
}