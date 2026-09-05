package com.raajwarasa.dto;

import com.raajwarasa.entity.MediaItem;

import java.time.Instant;

public record MediaItemResponse(
        Long id,
        String originalName,
        String url,
        String mimeType,
        String kind,
        String altText,
        Long artifactId,
        Instant createdAt
) {
    public static MediaItemResponse from(MediaItem item) {
        return new MediaItemResponse(
                item.getId(),
                item.getOriginalName(),
                item.getUrl(),
                item.getMimeType(),
                item.getKind(),
                item.getAltText(),
                item.getArtifact() == null ? null : item.getArtifact().getId(),
                item.getCreatedAt()
        );
    }
}