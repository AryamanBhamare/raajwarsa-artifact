package com.raajwarasa.controller;

import com.raajwarasa.dto.ArtifactResponse;
import com.raajwarasa.dto.CategoryResponse;
import com.raajwarasa.dto.ContactRequest;
import com.raajwarasa.dto.InquiryRequest;
import com.raajwarasa.dto.InquiryResponse;
import com.raajwarasa.dto.JournalResponse;
import com.raajwarasa.entity.Category;
import com.raajwarasa.repository.CategoryRepository;
import com.raajwarasa.service.ArtifactService;
import com.raajwarasa.service.InquiryService;
import com.raajwarasa.service.JournalService;
import com.raajwarasa.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final ArtifactService artifactService;
    private final CategoryRepository categoryRepository;
    private final JournalService journalService;
    private final InquiryService inquiryService;
    private final NotificationService notificationService;

    @GetMapping("/artifacts")
    public Map<String, Object> artifacts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String availability,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<ArtifactResponse> result = artifactService.search(search, category, period, material, region, featured, availability, page, size);
        return Map.of(
                "items", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "page", result.getNumber(),
                "size", result.getSize()
        );
    }

    @GetMapping("/artifacts/featured")
    public List<ArtifactResponse> featuredArtifacts() {
        return artifactService.featured();
    }

    @GetMapping("/artifacts/{slug}")
    public ArtifactResponse artifact(@PathVariable String slug) {
        return artifactService.bySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Artifact not found"));
    }

    @GetMapping("/artifacts/filters/periods")
    public List<String> periods() {
        return artifactService.periods();
    }

    @GetMapping("/artifacts/filters/materials")
    public List<String> materials() {
        return artifactService.materials();
    }

    @GetMapping("/artifacts/filters/regions")
    public List<String> regions() {
        return artifactService.regions();
    }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return categoryRepository.findAll().stream().map(CategoryResponse::from).toList();
    }

    @GetMapping("/journal")
    public Page<JournalResponse> journal(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "9") int size) {
        return journalService.published(page, size);
    }

    @GetMapping("/journal/latest")
    public List<JournalResponse> journalLatest() {
        return journalService.latest();
    }

    @GetMapping("/journal/{slug}")
    public JournalResponse journalArticle(@PathVariable String slug) {
        return journalService.bySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));
    }

    @PostMapping("/inquiries")
    public Map<String, Object> createInquiry(@Valid @RequestBody InquiryRequest request) {
        InquiryResponse response = inquiryService.create(
                request.name(), request.email(), request.phone(), request.city(),
                request.artifactId(), request.artifactName(), request.message(),
                request.source(), request.preferredContact());
        notificationService.notifyNewInquiry(Map.of(
                "name", response.name(),
                "artifactName", response.artifactName() == null ? "" : response.artifactName(),
                "id", response.id()
        ));
        return Map.of("success", true, "message", "Thank you. Our team will get in touch with you.", "id", response.id());
    }

    @PostMapping("/contact")
    public Map<String, Object> contact(@Valid @RequestBody ContactRequest request) {
        // Store contact as an inquiry record so the team never loses a message.
        InquiryResponse response = inquiryService.create(
                request.name(), request.email(), request.phone(), null,
                null, null, request.message(), "WEBSITE_CONTACT", "EMAIL");
        notificationService.notifyNewInquiry(Map.of(
                "name", response.name(),
                "artifactName", "General contact",
                "id", response.id()
        ));
        return Map.of("success", true, "message", "Thank you. Our team will get in touch with you.");
    }
}