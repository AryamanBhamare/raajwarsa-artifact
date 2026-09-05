package com.raajwarasa.dto;

import com.raajwarasa.entity.Inquiry;
import com.raajwarasa.entity.InquiryNote;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record InquiryResponse(
        Long id,
        String name,
        String email,
        String phone,
        String city,
        Long artifactId,
        String artifactName,
        String message,
        String source,
        String preferredContact,
        String status,
        String adminNotes,
        List<Map<String, Object>> notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static InquiryResponse from(Inquiry i, boolean includeNotes) {
        List<Map<String, Object>> notes = includeNotes
                ? i.getNotes().stream()
                    .map(n -> Map.<String, Object>of(
                            "id", n.getId(),
                            "note", n.getNote() == null ? "" : n.getNote(),
                            "createdBy", n.getCreatedBy() == null ? "" : n.getCreatedBy(),
                            "createdAt", n.getCreatedAt()
                    ))
                    .toList()
                : List.of();
        return new InquiryResponse(
                i.getId(),
                i.getName(),
                i.getEmail(),
                i.getPhone(),
                i.getCity(),
                i.getArtifactId(),
                i.getArtifactName(),
                i.getMessage(),
                i.getSource(),
                i.getPreferredContact(),
                i.getStatus().name(),
                i.getAdminNotes(),
                notes,
                i.getCreatedAt(),
                i.getUpdatedAt()
        );
    }
}