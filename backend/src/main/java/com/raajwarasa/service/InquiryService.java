package com.raajwarasa.service;

import com.raajwarasa.dto.InquiryResponse;
import com.raajwarasa.entity.Inquiry;
import com.raajwarasa.entity.InquiryNote;
import com.raajwarasa.repository.InquiryNoteRepository;
import com.raajwarasa.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryNoteRepository inquiryNoteRepository;

    @Transactional
    public InquiryResponse create(String name, String email, String phone, String city,
                                  Long artifactId, String artifactName, String message,
                                  String source, String preferredContact) {
        Inquiry inquiry = new Inquiry();
        inquiry.setName(name);
        inquiry.setEmail(email);
        inquiry.setPhone(phone);
        inquiry.setCity(city);
        inquiry.setArtifactId(artifactId);
        inquiry.setArtifactName(artifactName);
        inquiry.setMessage(message);
        inquiry.setSource(source);
        inquiry.setPreferredContact(preferredContact);
        inquiry.setStatus(Inquiry.Status.NEW);
        return InquiryResponse.from(inquiryRepository.save(inquiry), false);
    }

    @Transactional(readOnly = true)
    public Page<InquiryResponse> list(int page, int size) {
        return inquiryRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)))
                .map(i -> InquiryResponse.from(i, false));
    }

    @Transactional(readOnly = true)
    public InquiryResponse byId(Long id) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enquiry not found"));
        return InquiryResponse.from(inquiry, true);
    }

    @Transactional
    public InquiryResponse updateStatus(Long id, String status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enquiry not found"));
        Inquiry.Status parsed;
        try {
            parsed = Inquiry.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        inquiry.setStatus(parsed);
        return InquiryResponse.from(inquiryRepository.save(inquiry), true);
    }

    @Transactional
    public InquiryResponse updateAdminNotes(Long id, String notes) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enquiry not found"));
        inquiry.setAdminNotes(notes);
        return InquiryResponse.from(inquiryRepository.save(inquiry), true);
    }

    @Transactional
    public InquiryResponse addNote(Long id, String note, String createdBy) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Enquiry not found"));
        InquiryNote inquiryNote = new InquiryNote();
        inquiryNote.setNote(note);
        inquiryNote.setCreatedBy(createdBy);
        inquiryNote.setInquiry(inquiry);
        inquiryNoteRepository.save(inquiryNote);
        inquiry.getNotes().add(inquiryNote);
        return InquiryResponse.from(inquiry, true);
    }

    @Transactional(readOnly = true)
    public long newSince(Instant instant) {
        return inquiryRepository.countByCreatedAtAfter(instant);
    }

    @Transactional(readOnly = true)
    public long countSinceLastDay() {
        return inquiryRepository.countByCreatedAtAfter(Instant.now().minus(1, ChronoUnit.DAYS));
    }
}