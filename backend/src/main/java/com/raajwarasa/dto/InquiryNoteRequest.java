package com.raajwarasa.dto;

import jakarta.validation.constraints.NotBlank;

public record InquiryNoteRequest(
        @NotBlank(message = "Note cannot be empty")
        String note
) {
}