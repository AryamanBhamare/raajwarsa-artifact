package com.raajwarasa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JournalRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 250)
        String title,

        @Size(max = 260)
        String slug,

        @Size(max = 120)
        String category,

        String content,

        @Size(max = 500)
        String coverImage,

        @Size(max = 150)
        String author,

        Long publishDate,

        String status,

        @Size(max = 200)
        String seoTitle,

        @Size(max = 500)
        String seoDescription
) {
}