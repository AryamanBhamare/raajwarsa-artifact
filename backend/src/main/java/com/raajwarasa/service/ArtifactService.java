package com.raajwarasa.service;

import com.raajwarasa.dto.ArtifactRequest;
import com.raajwarasa.dto.ArtifactResponse;
import com.raajwarasa.entity.Artifact;
import com.raajwarasa.entity.ArtifactImage;
import com.raajwarasa.entity.Category;
import com.raajwarasa.repository.ArtifactRepository;
import com.raajwarasa.repository.CategoryRepository;
import com.raajwarasa.util.Slugs;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ArtifactService {

    private final ArtifactRepository artifactRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<ArtifactResponse> search(String search, String category, String period,
                                         String material, String region, Boolean featured,
                                         String availability, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 48));
        String normalized = (search == null || search.isBlank()) ? null : search.trim();
        String cat = (category == null || category.isBlank()) ? null : category;
        String per = (period == null || period.isBlank()) ? null : period;
        String mat = (material == null || material.isBlank()) ? null : material;
        String reg = (region == null || region.isBlank()) ? null : region;
        String avail = (availability == null || availability.isBlank()) ? null : availability;

        Page<Artifact> results = artifactRepository.search(normalized, cat, per, mat, reg, featured, avail, pageable);
        List<ArtifactResponse> items = results.getContent().stream().map(ArtifactResponse::thumb).toList();
        return new PageImpl<>(items, pageable, results.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<ArtifactResponse> featured() {
        return artifactRepository.findByFeaturedTrueAndActiveTrueOrderBySortOrderAsc()
                .stream().map(ArtifactResponse::thumb).toList();
    }

    @Transactional(readOnly = true)
    public Optional<ArtifactResponse> bySlug(String slug) {
        return artifactRepository.findBySlugAndActiveTrue(slug).map(ArtifactResponse::from);
    }

    @Transactional(readOnly = true)
    public Optional<ArtifactResponse> byId(Long id) {
        return artifactRepository.findById(id).map(ArtifactResponse::from);
    }

    @Transactional(readOnly = true)
    public List<String> periods() {
        return artifactRepository.findDistinctPeriods();
    }

    @Transactional(readOnly = true)
    public List<String> materials() {
        return artifactRepository.findDistinctMaterials();
    }

    @Transactional(readOnly = true)
    public List<String> regions() {
        return artifactRepository.findDistinctRegions();
    }

    @Transactional
    public ArtifactResponse create(ArtifactRequest req) {
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        Artifact artifact = new Artifact();
        artifact.setCategory(category);
        applyFields(artifact, req);
        artifact.setSlug(uniqueSlug(req.slug(), req.name(), null));
        applyImages(artifact, req);
        return ArtifactResponse.from(artifactRepository.save(artifact));
    }

    @Transactional
    public ArtifactResponse update(Long id, ArtifactRequest req) {
        Artifact artifact = artifactRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Artifact not found"));
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        artifact.setCategory(category);
        applyFields(artifact, req);
        artifact.setSlug(uniqueSlug(req.slug(), req.name(), id));
        replaceImages(artifact, req);
        return ArtifactResponse.from(artifactRepository.save(artifact));
    }

    @Transactional
    public void delete(Long id) {
        if (!artifactRepository.existsById(id)) {
            throw new IllegalArgumentException("Artifact not found");
        }
        artifactRepository.deleteById(id);
    }

    private void applyFields(Artifact a, ArtifactRequest req) {
        a.setName(req.name().trim());
        a.setDescription(req.description());
        a.setHistoricalContext(req.historicalContext());
        a.setCraftsmanship(req.craftsmanship());
        a.setMaterial(req.material());
        a.setPeriod(req.period());
        a.setOrigin(req.origin());
        a.setRegion(req.region());
        a.setSize(req.size());
        a.setCondition(req.condition());
        a.setPreservation(req.preservation());
        a.setProvenance(req.provenance());
        a.setAvailability(req.availability() == null || req.availability().isBlank() ? "ON_REQUEST" : req.availability());
        a.setPrice(req.price());
        a.setSaleAvailable(!Boolean.FALSE.equals(req.saleAvailable()) && req.price() != null);
        a.setFeatured(Boolean.TRUE.equals(req.featured()));
        a.setActive(!Boolean.FALSE.equals(req.active()));
        a.setSortOrder(req.sortOrder() == null ? 0 : req.sortOrder());
    }

    private void applyImages(Artifact a, ArtifactRequest req) {
        if (req.images() == null || req.images().isEmpty()) return;
        List<ArtifactImage> images = new ArrayList<>();
        for (int i = 0; i < req.images().size(); i++) {
            ArtifactRequest.ImageEntry entry = req.images().get(i);
            ArtifactImage image = new ArtifactImage();
            image.setUrl(entry.url());
            image.setAltText(entry.altText());
            image.setSortOrder(entry.sortOrder() == null ? i : entry.sortOrder());
            images.add(image);
        }
        for (ArtifactImage image : images) {
            a.addImage(image);
        }
    }

    private void replaceImages(Artifact a, ArtifactRequest req) {
        a.getImages().clear();
        applyImages(a, req);
    }

    private String uniqueSlug(String requested, String name, Long ignoreId) {
        String base = Slugs.slugify(requested != null && !requested.isBlank() ? requested : name);
        if (base.isBlank()) base = "artifact";
        String candidate = base;
        int n = 2;
        while (true) {
            Optional<Artifact> existing = artifactRepository.findBySlug(candidate);
            boolean taken = existing.isPresent() && !existing.get().getId().equals(ignoreId);
            if (taken) {
                candidate = base + "-" + n++;
            } else {
                return candidate;
            }
        }
    }
}