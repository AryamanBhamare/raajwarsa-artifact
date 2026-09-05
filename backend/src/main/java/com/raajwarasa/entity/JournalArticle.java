package com.raajwarasa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "journal_articles")
@Getter
@Setter
public class JournalArticle {

    public enum Status {
        DRAFT, PUBLISHED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 250)
    private String title;

    @Column(nullable = false, unique = true, length = 260)
    private String slug;

    @Column(length = 120)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(length = 150)
    private String author;

    @Column(name = "publish_date")
    private Instant publishDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.DRAFT;

    @Column(name = "seo_title", length = 200)
    private String seoTitle;

    @Column(name = "seo_description", length = 500)
    private String seoDescription;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}