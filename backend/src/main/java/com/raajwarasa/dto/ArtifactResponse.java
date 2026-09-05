package com.raajwarasa.dto;

import com.raajwarasa.entity.Artifact;
import com.raajwarasa.entity.ArtifactImage;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ArtifactResponse(
        Long id,
        String name,
        String slug,
        Map<String, Object> category,
        String description,
        String historicalContext,
        String craftsmanship,
        String material,
        String period,
        String origin,
        String region,
        String size,
        String condition,
        String preservation,
        String provenance,
        String availability,
        boolean featured,
        boolean active,
        Integer sortOrder,
        List<Image> images,
        Instant createdAt,
        Instant updatedAt
) {
    public record Image(Long id, String url, String altText, Integer sortOrder) {
    }

    public static ArtifactResponse from(Artifact a) {
        return new ArtifactResponse(
                a.getId(),
                a.getName(),
                a.getSlug(),
                Map.of(
                        "id", a.getCategory().getId(),
                        "name", a.getCategory().getName(),
                        "slug", a.getCategory().getSlug()
                ),
                a.getDescription(),
                a.getHistoricalContext(),
                a.getCraftsmanship(),
                a.getMaterial(),
                a.getPeriod(),
                a.getOrigin(),
                a.getRegion(),
                a.getSize(),
                a.getCondition(),
                a.getPreservation(),
                a.getProvenance(),
                a.getAvailability(),
                a.isFeatured(),
                a.isActive(),
                a.getSortOrder(),
                a.getImages().stream()
                        .map(i -> new Image(i.getId(), i.getUrl(), i.getAltText(), i.getSortOrder()))
                        .toList(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }

    public static ArtifactResponse thumb(Artifact a) {
        return new ArtifactResponse(
                a.getId(),
                a.getName(),
                a.getSlug(),
                Map.of(
                        "id", a.getCategory().getId(),
                        "name", a.getCategory().getName(),
                        "slug", a.getCategory().getSlug()
                ),
                a.getDescription(),
                null,
                null,
                a.getMaterial(),
                a.getPeriod(),
                a.getOrigin(),
                a.getRegion(),
                null,
                null,
                null,
                null,
                a.getAvailability(),
                a.isFeatured(),
                a.isActive(),
                a.getSortOrder(),
                a.getImages().stream()
                        .map(i -> new Image(i.getId(), i.getUrl(), i.getAltText(), i.getSortOrder()))
                        .toList(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }

    public static ArtifactImage toImage(ArtifactImage i) {
        return i;
    }
}