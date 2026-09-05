package com.raajwarasa.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Lightweight notification dispatcher. Currently logs new-enquiry alerts;
 * swap in email providers (SMTP/Resend/SES) via env config without touching callers.
 */
@Service
@Slf4j
public class NotificationService {

    public void notifyNewInquiry(Map<String, Object> inquiry) {
        String name = String.valueOf(inquiry.getOrDefault("name", ""));
        String artifact = String.valueOf(inquiry.getOrDefault("artifactName", ""));
        log.info("[NEW ENQUIRY] from {} about '{}'", name, artifact);
        // Future: send email if SMTP configured
    }
}