package com.raajwarasa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "artifacts")
@Getter
@Setter
public class Artifact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 1000)
    private String description;

    @Column(name = "historical_context", columnDefinition = "TEXT")
    private String historicalContext;

    @Column(columnDefinition = "TEXT")
    private String craftsmanship;

    @Column(length = 150)
    private String material;

    @Column(length = 150)
    private String period;

    @Column(length = 150)
    private String origin;

    @Column(length = 250)
    private String region;

    @Column(length = 200)
    private String size;

    @Column(name = "`condition`", length = 250)
    private String condition;

    @Column(length = 1000)
    private String preservation;

    @Column(length = 500)
    private String provenance;

    @Column(length = 50)
    private String availability = "ON_REQUEST";

    @Column(nullable = false)
    private boolean featured = false;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "artifact", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<ArtifactImage> images = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void addImage(ArtifactImage image) {
        images.add(image);
        image.setArtifact(this);
    }
}