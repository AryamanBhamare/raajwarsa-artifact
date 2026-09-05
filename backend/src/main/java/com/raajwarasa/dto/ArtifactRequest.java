package com.raajwarasa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ArtifactRequest(
        @NotBlank(message = "Artifact name is required")
        @Size(max = 200)
        String name,

        @Size(max = 220)
        String slug,

        @NotNull(message = "Category is required")
        Long categoryId,

        @Size(max = 1000)
        String description,

        String historicalContext,

        String craftsmanship,

        @Size(max = 150)
        String material,

        @Size(max = 150)
        String period,

        @Size(max = 150)
        String origin,

        @Size(max = 250)
        String region,

        @Size(max = 200)
        String size,

        @Size(max = 250)
        String condition,

        String preservation,

        String provenance,

        @Size(max = 50)
        String availability,

        Boolean featured,

        Boolean active,

        Integer sortOrder,

        List<ImageEntry> images
) {
    public record ImageEntry(String url, String altText, Integer sortOrder) {
    }
}