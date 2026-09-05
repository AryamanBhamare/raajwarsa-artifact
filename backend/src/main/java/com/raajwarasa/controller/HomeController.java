package com.raajwarasa.controller;

import com.raajwarasa.dto.ArtifactResponse;
import com.raajwarasa.service.ArtifactService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Aggregated endpoint for the homepage so the frontend makes a single round-trip.
 */
@RestController
@RequestMapping("/api/public/home")
@RequiredArgsConstructor
public class HomeController {

    private final ArtifactService artifactService;

    @GetMapping
    public Map<String, Object> home() {
        return Map.of("featured", artifactService.featured());
    }
}