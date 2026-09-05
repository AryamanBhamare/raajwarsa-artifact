package com.raajwarasa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "media")
@Getter
@Setter
public class MediaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_name", length = 300)
    private String originalName;

    @Column(nullable = false, length = 600)
    private String url;

    @Column(length = 50)
    private String mimeType;

    @Column(length = 20)
    private String kind = "image";

    @Column(length = 300)
    private String altText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artifact_id")
    private Artifact artifact;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}