package com.raajwarasa.dto;

import com.raajwarasa.entity.JournalArticle;

import java.time.Instant;

public record JournalResponse(
        Long id,
        String title,
        String slug,
        String category,
        String content,
        String coverImage,
        String author,
        Instant publishDate,
        String status,
        String seoTitle,
        String seoDescription,
        Instant createdAt,
        Instant updatedAt
) {
    public static JournalResponse from(JournalArticle a, boolean includeContent) {
        return new JournalResponse(
                a.getId(),
                a.getTitle(),
                a.getSlug(),
                a.getCategory(),
                includeContent ? a.getContent() : null,
                a.getCoverImage(),
                a.getAuthor(),
                a.getPublishDate(),
                a.getStatus().name(),
                a.getSeoTitle(),
                a.getSeoDescription(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}