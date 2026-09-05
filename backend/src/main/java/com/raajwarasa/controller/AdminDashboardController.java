package com.raajwarasa.controller;

import com.raajwarasa.dto.DashboardResponse;
import com.raajwarasa.dto.InquiryNoteRequest;
import com.raajwarasa.dto.InquiryResponse;
import com.raajwarasa.dto.InquiryStatusRequest;
import com.raajwarasa.entity.Inquiry;
import com.raajwarasa.entity.Inquiry.Status;
import com.raajwarasa.repository.ArtifactRepository;
import com.raajwarasa.repository.InquiryRepository;
import com.raajwarasa.repository.JournalArticleRepository;
import com.raajwarasa.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final ArtifactRepository artifactRepository;
    private final InquiryRepository inquiryRepository;
    private final JournalArticleRepository journalRepository;
    private final InquiryService inquiryService;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        long total = artifactRepository.count();
        long featured = artifactRepository.findByFeaturedTrueAndActiveTrueOrderBySortOrderAsc().size();
        long journalPublished = journalRepository.countByStatus(com.raajwarasa.entity.JournalArticle.Status.PUBLISHED);

        Map<Status, Long> byStatus = new LinkedHashMap<>();
        for (Status s : Status.values()) {
            byStatus.put(s, inquiryRepository.countByStatus(s));
        }

        List<Map<String, Object>> recent = inquiryRepository.findTop6ByOrderByCreatedAtDesc().stream()
                .map(i -> Map.<String, Object>of(
                        "id", i.getId(),
                        "name", i.getName(),
                        "artifactName", i.getArtifactName() == null ? "" : i.getArtifactName(),
                        "status", i.getStatus().name(),
                        "createdAt", i.getCreatedAt()
                ))
                .toList();

        List<Map<String, Object>> bySource = inquiryRepository.findAll().stream()
                .filter(i -> i.getSource() != null && !i.getSource().isBlank())
                .collect(java.util.stream.Collectors.groupingBy(Inquiry::getSource, java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .map(e -> Map.<String, Object>of("source", e.getKey(), "count", e.getValue()))
                .sorted((a, b) -> Long.compare(((Number) b.get("count")).longValue(), ((Number) a.get("count")).longValue()))
                .toList();

        List<Map<String, Object>> overTime = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d").withZone(ZoneOffset.UTC);
        for (int i = 13; i >= 0; i--) {
            Instant start = Instant.now().minus(i, java.time.temporal.ChronoUnit.DAYS);
            Instant end = start.plus(1, java.time.temporal.ChronoUnit.DAYS);
            long count = inquiryRepository.findAll().stream()
                    .filter(q -> !q.getCreatedAt().isBefore(start) && q.getCreatedAt().isBefore(end))
                    .count();
            overTime.add(Map.of("date", fmt.format(start), "count", count));
        }

        return new DashboardResponse(
                total,
                featured,
                byStatus.getOrDefault(Status.NEW, 0L),
                byStatus.getOrDefault(Status.CONTACTED, 0L),
                byStatus.getOrDefault(Status.FOLLOW_UP, 0L),
                byStatus.getOrDefault(Status.RESOLVED, 0L),
                recent,
                byStatus.entrySet().stream()
                        .collect(java.util.stream.Collectors.toMap(e -> e.getKey().name(), Map.Entry::getValue)),
                bySource,
                overTime,
                journalPublished
        );
    }

    @GetMapping("/inquiries")
    public Page<InquiryResponse> inquiries(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return inquiryService.list(page, size);
    }

    @GetMapping("/inquiries/{id}")
    public InquiryResponse inquiry(@PathVariable Long id) {
        return inquiryService.byId(id);
    }

    @PutMapping("/inquiries/{id}/status")
    public InquiryResponse changeStatus(@PathVariable Long id, @RequestBody InquiryStatusRequest request) {
        return inquiryService.updateStatus(id, request.status());
    }

    @PutMapping("/inquiries/{id}/notes")
    public InquiryResponse updateNotes(@PathVariable Long id, @RequestBody InquiryNoteRequest request) {
        return inquiryService.updateAdminNotes(id, request.note());
    }

    @PostMapping("/inquiries/{id}/notes")
    public InquiryResponse addNote(@PathVariable Long id,
                                   @RequestBody InquiryNoteRequest request,
                                   @RequestHeader(value = "X-Admin-User", required = false) String adminUser) {
        return inquiryService.addNote(id, request.note(), adminUser == null ? "admin" : adminUser);
    }
}