package com.raajwarasa.service;

import com.raajwarasa.dto.JournalRequest;
import com.raajwarasa.dto.JournalResponse;
import com.raajwarasa.entity.JournalArticle;
import com.raajwarasa.repository.JournalArticleRepository;
import com.raajwarasa.util.Slugs;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalArticleRepository journalRepository;

    @Transactional(readOnly = true)
    public List<JournalResponse> latest() {
        return journalRepository.findTop6ByStatusOrderByPublishDateDesc(JournalArticle.Status.PUBLISHED)
                .stream().map(a -> JournalResponse.from(a, false)).toList();
    }

    @Transactional(readOnly = true)
    public Page<JournalResponse> published(int page, int size) {
        return journalRepository.findByStatusOrderByPublishDateDesc(
                        JournalArticle.Status.PUBLISHED,
                        PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50)))
                .map(a -> JournalResponse.from(a, false));
    }

    @Transactional(readOnly = true)
    public Optional<JournalResponse> bySlug(String slug) {
        return journalRepository.findBySlug(slug)
                .filter(a -> a.getStatus() == JournalArticle.Status.PUBLISHED)
                .map(a -> JournalResponse.from(a, true));
    }

    @Transactional(readOnly = true)
    public Page<JournalResponse> adminList(int page, int size) {
        return journalRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)))
                .map(a -> JournalResponse.from(a, false));
    }

    @Transactional(readOnly = true)
    public Optional<JournalResponse> adminBySlug(String slug) {
        return journalRepository.findBySlug(slug).map(a -> JournalResponse.from(a, true));
    }

    @Transactional
    public JournalResponse create(JournalRequest req) {
        JournalArticle article = new JournalArticle();
        applyFields(article, req);
        article.setSlug(uniqueSlug(req.slug(), req.title(), null));
        return JournalResponse.from(journalRepository.save(article), true);
    }

    @Transactional
    public JournalResponse update(Long id, JournalRequest req) {
        JournalArticle article = journalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        applyFields(article, req);
        article.setSlug(uniqueSlug(req.slug(), req.title(), id));
        return JournalResponse.from(journalRepository.save(article), true);
    }

    @Transactional
    public void delete(Long id) {
        if (!journalRepository.existsById(id)) {
            throw new IllegalArgumentException("Article not found");
        }
        journalRepository.deleteById(id);
    }

    private void applyFields(JournalArticle a, JournalRequest req) {
        a.setTitle(req.title().trim());
        a.setCategory(req.category());
        a.setContent(req.content());
        a.setCoverImage(req.coverImage());
        a.setAuthor(req.author());
        a.setPublishDate(req.publishDate() == null ? Instant.now() : Instant.ofEpochMilli(req.publishDate()));
        boolean published = "PUBLISHED".equalsIgnoreCase(req.status());
        a.setStatus(published ? JournalArticle.Status.PUBLISHED : JournalArticle.Status.DRAFT);
        a.setSeoTitle(req.seoTitle());
        a.setSeoDescription(req.seoDescription());
    }

    private String uniqueSlug(String requested, String title, Long ignoreId) {
        String base = Slugs.slugify(requested != null && !requested.isBlank() ? requested : title);
        if (base.isBlank()) base = "article";
        String candidate = base;
        int n = 2;
        while (true) {
            Optional<JournalArticle> existing = journalRepository.findBySlug(candidate);
            boolean taken = existing.isPresent() && !existing.get().getId().equals(ignoreId);
            if (taken) {
                candidate = base + "-" + n++;
            } else {
                return candidate;
            }
        }
    }
}