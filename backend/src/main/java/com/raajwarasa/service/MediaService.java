package com.raajwarasa.service;

import com.raajwarasa.entity.Artifact;
import com.raajwarasa.entity.MediaItem;
import com.raajwarasa.repository.ArtifactRepository;
import com.raajwarasa.repository.MediaItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class MediaService {

    /**
     * Uploads are served from the site's own origin, so anything executable in a
     * browser (.html, .svg, .js, ...) would be a stored-XSS / malware-hosting
     * vector. Only real raster images are accepted, and the bytes must actually
     * look like the extension claims.
     */
    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            ".png", "image/png",
            ".jpg", "image/jpeg",
            ".jpeg", "image/jpeg",
            ".webp", "image/webp",
            ".gif", "image/gif",
            ".avif", "image/avif"
    );

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
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file was provided.");
        }
        String extension = extensionOf(file.getOriginalFilename());
        String canonicalType = extension == null ? null : ALLOWED_TYPES.get(extension);
        if (canonicalType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only image uploads are allowed (PNG, JPEG, WEBP, GIF, AVIF).");
        }
        String declared = file.getContentType();
        if (declared != null && !declared.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image uploads are allowed.");
        }
        String sniffed = sniffImageType(file);
        if (sniffed == null || !sniffed.equals(canonicalType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "File contents do not match a supported image format.");
        }

        Files.createDirectories(uploadDir);
        String stamp = Instant.now().atZone(ZoneOffset.UTC)
                .format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String filename = stamp + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path target = uploadDir.resolve(filename).normalize();
        if (!target.startsWith(uploadDir)) {
            throw new IOException("Invalid file path");
        }
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        MediaItem item = new MediaItem();
        item.setOriginalName(file.getOriginalFilename());
        item.setUrl("/uploads/" + filename);
        item.setMimeType(canonicalType);
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

    /** Returns the lower-cased extension only when it is an allowed image type, else null. */
    private String extensionOf(String original) {
        if (original == null) return null;
        int dot = original.lastIndexOf('.');
        if (dot < 0) return null;
        String ext = original.substring(dot).toLowerCase(Locale.ROOT);
        return ALLOWED_TYPES.containsKey(ext) ? ext : null;
    }

    /**
     * Identifies the image format from the leading bytes. Guards against a
     * dangerous file (or a renamed executable) being stored under an image
     * extension, which browsers/nginx would happily serve.
     */
    private String sniffImageType(MultipartFile file) {
        byte[] head = new byte[16];
        int read;
        try (InputStream in = file.getInputStream()) {
            read = in.readNBytes(head, 0, head.length);
        } catch (IOException e) {
            return null;
        }
        if (read < 12) return null;
        if ((head[0] & 0xFF) == 0x89 && head[1] == 'P' && head[2] == 'N' && head[3] == 'G') {
            return "image/png";
        }
        if ((head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8 && (head[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (head[0] == 'G' && head[1] == 'I' && head[2] == 'F' && head[3] == '8') {
            return "image/gif";
        }
        if (head[0] == 'R' && head[1] == 'I' && head[2] == 'F' && head[3] == 'F'
                && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P') {
            return "image/webp";
        }
        if (head[4] == 'f' && head[5] == 't' && head[6] == 'y' && head[7] == 'p') {
            String brand = new String(head, 8, 4, java.nio.charset.StandardCharsets.US_ASCII).toLowerCase(Locale.ROOT);
            if (brand.startsWith("avi")) {
                return "image/avif";
            }
        }
        return null;
    }
}