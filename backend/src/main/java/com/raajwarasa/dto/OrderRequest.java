package com.raajwarasa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OrderRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 150)
        String customerName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        String email,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^[0-9]{10,12}$", message = "Enter a valid phone number")
        String phone,

        @Size(max = 500)
        String address,

        @Size(max = 120)
        String city,

        @Size(max = 120)
        String state,

        @Size(max = 10)
        String pincode,

        @NotNull(message = "Delivery mode is required")
        String deliveryMode,

        @NotNull(message = "Payment method is required")
        String paymentMethod,

        @NotNull(message = "Cart cannot be empty")
        @Size(min = 1, message = "Cart cannot be empty")
        List<ItemEntry> items
) {
    public record ItemEntry(@NotNull(message = "Artifact is required") Long artifactId,
                            @NotNull(message = "Quantity is required") Integer quantity) {
    }
}