package com.raajwarasa.repository;

import com.raajwarasa.entity.Inquiry;
import com.raajwarasa.entity.Inquiry.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Inquiry> findByStatusOrderByCreatedAtDesc(Status status);

    long countByStatus(Status status);

    long countByCreatedAtAfter(Instant after);

    List<Inquiry> findTop6ByOrderByCreatedAtDesc();
}