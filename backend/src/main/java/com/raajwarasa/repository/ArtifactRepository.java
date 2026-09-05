package com.raajwarasa.repository;

import com.raajwarasa.entity.Artifact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArtifactRepository extends JpaRepository<Artifact, Long> {

    Optional<Artifact> findBySlug(String slug);

    Optional<Artifact> findBySlugAndActiveTrue(String slug);

    List<Artifact> findByFeaturedTrueAndActiveTrueOrderBySortOrderAsc();

    @Query("""
        SELECT a FROM Artifact a
        WHERE a.active = true
          AND (:search IS NULL
               OR LOWER(a.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(a.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(a.material) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(a.period) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(a.origin) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(a.category.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
          AND (:category IS NULL OR a.category.slug = :category)
          AND (:period IS NULL OR a.period = :period)
          AND (:material IS NULL OR a.material = :material)
          AND (:region IS NULL OR a.region = :region)
          AND (:featured IS NULL OR a.featured = :featured)
          AND (:availability IS NULL OR a.availability = :availability)
    """)
    Page<Artifact> search(@Param("search") String search,
                          @Param("category") String category,
                          @Param("period") String period,
                          @Param("material") String material,
                          @Param("region") String region,
                          @Param("featured") Boolean featured,
                          @Param("availability") String availability,
                          Pageable pageable);

    @Query("SELECT DISTINCT a.period FROM Artifact a WHERE a.active = true AND a.period IS NOT NULL AND a.period <> '' ORDER BY a.period")
    List<String> findDistinctPeriods();

    @Query("SELECT DISTINCT a.material FROM Artifact a WHERE a.active = true AND a.material IS NOT NULL AND a.material <> '' ORDER BY a.material")
    List<String> findDistinctMaterials();

    @Query("SELECT DISTINCT a.region FROM Artifact a WHERE a.active = true AND a.region IS NOT NULL AND a.region <> '' ORDER BY a.region")
    List<String> findDistinctRegions();
}