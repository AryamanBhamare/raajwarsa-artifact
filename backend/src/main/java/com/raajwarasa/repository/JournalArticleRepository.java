package com.raajwarasa.repository;

import com.raajwarasa.entity.JournalArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JournalArticleRepository extends JpaRepository<JournalArticle, Long> {

    Optional<JournalArticle> findBySlug(String slug);

    List<JournalArticle> findTop6ByStatusOrderByPublishDateDesc(JournalArticle.Status status);

    Page<JournalArticle> findByStatusOrderByPublishDateDesc(JournalArticle.Status status, Pageable pageable);

    Page<JournalArticle> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(JournalArticle.Status status);
}