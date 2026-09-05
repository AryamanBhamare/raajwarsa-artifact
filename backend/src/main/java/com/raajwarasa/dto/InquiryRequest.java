package com.raajwarasa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InquiryRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 150)
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        @Size(max = 180)
        String email,

        @Size(max = 40)
        String phone,

        @Size(max = 120)
        String city,

        Long artifactId,

        String artifactName,

        @Size(max = 4000)
        String message,

        @Size(max = 50)
        String source,

        @Size(max = 50)
        String preferredContact
) {
}