package com.raajwarasa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inquiries")
@Getter
@Setter
public class Inquiry {

    public enum Status {
        NEW, CONTACTED, FOLLOW_UP, RESOLVED, CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(length = 120)
    private String city;

    @Column(name = "artifact_id")
    private Long artifactId;

    @Column(name = "artifact_name", length = 220)
    private String artifactName;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(length = 50)
    private String source;

    @Column(name = "preferred_contact", length = 50)
    private String preferredContact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.NEW;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<InquiryNote> notes = new ArrayList<>();

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