package com.raajwarasa.controller;

import com.raajwarasa.dto.ArtifactRequest;
import com.raajwarasa.dto.ArtifactResponse;
import com.raajwarasa.service.ArtifactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/artifacts")
@RequiredArgsConstructor
public class AdminArtifactController {

    private final ArtifactService artifactService;

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) String search,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "50") int size) {
        Page<ArtifactResponse> result = artifactService.search(search, null, null, null, null, null, null, page, size);
        return Map.of("items", result.getContent(), "totalElements", result.getTotalElements());
    }

    @GetMapping("/{id}")
    public ArtifactResponse byId(@PathVariable Long id) {
        return artifactService.byId(id).orElseThrow(() -> new IllegalArgumentException("Artifact not found"));
    }

    @PostMapping
    public ArtifactResponse create(@Valid @RequestBody ArtifactRequest request) {
        return artifactService.create(request);
    }

    @PutMapping("/{id}")
    public ArtifactResponse update(@PathVariable Long id, @Valid @RequestBody ArtifactRequest request) {
        return artifactService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        artifactService.delete(id);
        return Map.of("success", true);
    }
}