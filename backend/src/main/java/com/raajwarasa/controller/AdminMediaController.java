package com.raajwarasa.controller;

import com.raajwarasa.entity.MediaItem;
import com.raajwarasa.repository.MediaItemRepository;
import com.raajwarasa.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {

    private final MediaService mediaService;
    private final MediaItemRepository mediaItemRepository;

    @GetMapping
    public List<MediaItem> list() {
        return mediaItemRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @PostMapping("/upload")
    public MediaItem upload(@RequestParam("file") MultipartFile file,
                            @RequestParam(required = false) Long artifactId,
                            @RequestParam(required = false) String altText,
                            @RequestParam(required = false) String kind) throws IOException {
        return mediaService.store(file, artifactId, altText, kind);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        MediaItem item = mediaItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media not found"));
        mediaService.deleteFile(item.getUrl());
        mediaItemRepository.delete(item);
        return Map.of("success", true);
    }
}