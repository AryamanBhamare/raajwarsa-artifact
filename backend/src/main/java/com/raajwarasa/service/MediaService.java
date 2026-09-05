package com.raajwarasa.service;

import com.raajwarasa.entity.Artifact;
import com.raajwarasa.entity.MediaItem;
import com.raajwarasa.repository.ArtifactRepository;
import com.raajwarasa.repository.MediaItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class MediaService {

    private final Path uploadDir;
    private final MediaItemRepository mediaItemRepository;
    private final ArtifactRepository artifactRepository;

    public MediaService(@Value("${raajwarasa.upload.dir}") String uploadDir,
                        MediaItemRepository mediaItemRepository,
                        ArtifactRepository artifactRepository) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.mediaItemRepository = mediaItemRepository;
        this.artifactRepository = artifactRepository;
    }

    public MediaItem store(MultipartFile file, Long artifactId, String altText, String kind) throws IOException {
        Files.createDirectories(uploadDir);
        String extension = extensionOf(file.getOriginalFilename());
        String stamp = Instant.now().atZone(ZoneOffset.UTC)
                .format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String filename = stamp + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path target = uploadDir.resolve(filename).normalize();
        if (!target.startsWith(uploadDir)) {
            throw new IOException("Invalid file path");
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        MediaItem item = new MediaItem();
        item.setOriginalName(file.getOriginalFilename());
        item.setUrl("/uploads/" + filename);
        item.setMimeType(file.getContentType());
        item.setAltText(altText);
        item.setKind(kind == null || kind.isBlank() ? "image" : kind);
        if (artifactId != null) {
            artifactRepository.findById(artifactId).ifPresent(item::setArtifact);
        }
        return mediaItemRepository.save(item);
    }

    public void deleteFile(String url) {
        if (url == null) return;
        try {
            int idx = url.indexOf("/uploads/");
            if (idx >= 0) {
                String filename = url.substring(idx + "/uploads/".length());
                if (filename.contains("/") || filename.contains("\\") || filename.contains("..")) return;
                Files.deleteIfExists(uploadDir.resolve(filename));
            }
        } catch (IOException ignored) {
        }
    }

    private String extensionOf(String original) {
        if (original == null) return ".jpg";
        int dot = original.lastIndexOf('.');
        if (dot < 0) return ".jpg";
        String ext = original.substring(dot).toLowerCase();
        if (!ext.matches("\\.[a-z0-9]{1,5}")) return ".jpg";
        return ext;
    }
}