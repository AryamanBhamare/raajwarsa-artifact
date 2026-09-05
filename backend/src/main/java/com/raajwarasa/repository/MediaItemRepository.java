package com.raajwarasa.repository;

import com.raajwarasa.entity.MediaItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaItemRepository extends JpaRepository<MediaItem, Long> {
}