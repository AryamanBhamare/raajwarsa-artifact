package com.raajwarasa.controller;

import com.raajwarasa.dto.JournalRequest;
import com.raajwarasa.dto.JournalResponse;
import com.raajwarasa.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/journal")
@RequiredArgsConstructor
public class AdminJournalController {

    private final JournalService journalService;

    @GetMapping
    public Map<String, Object> list(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "50") int size) {
        Page<JournalResponse> result = journalService.adminList(page, size);
        return Map.of("items", result.getContent(), "totalElements", result.getTotalElements());
    }

    @GetMapping("/{slug}")
    public JournalResponse bySlug(@PathVariable String slug) {
        return journalService.adminBySlug(slug).orElseThrow(() -> new IllegalArgumentException("Article not found"));
    }

    @PostMapping
    public JournalResponse create(@Valid @RequestBody JournalRequest request) {
        return journalService.create(request);
    }

    @PutMapping("/{id}")
    public JournalResponse update(@PathVariable Long id, @Valid @RequestBody JournalRequest request) {
        return journalService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        journalService.delete(id);
        return Map.of("success", true);
    }
}