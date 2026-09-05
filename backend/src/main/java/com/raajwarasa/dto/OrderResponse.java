package com.raajwarasa.dto;

import com.raajwarasa.entity.Order;
import com.raajwarasa.entity.OrderItem;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String customerName,
        String email,
        String phone,
        String address,
        String city,
        String state,
        String pincode,
        String deliveryMode,
        String paymentMethod,
        String paymentStatus,
        String status,
        BigDecimal totalAmount,
        List<Item> items,
        Instant createdAt
) {
    public record Item(Long artifactId, String artifactName, String artifactUrl,
                       BigDecimal unitPrice, Integer quantity, BigDecimal lineTotal) {
    }

    public static OrderResponse from(Order o) {
        return new OrderResponse(
                o.getId(),
                o.getOrderNumber(),
                o.getCustomerName(),
                o.getEmail(),
                o.getPhone(),
                o.getAddress(),
                o.getCity(),
                o.getState(),
                o.getPincode(),
                o.getDeliveryMode(),
                o.getPaymentMethod(),
                o.getPaymentStatus(),
                o.getStatus(),
                o.getTotalAmount(),
                o.getItems().stream()
                        .map(i -> new Item(i.getArtifactId(), i.getArtifactName(), i.getArtifactUrl(),
                                i.getUnitPrice(), i.getQuantity(), i.getLineTotal()))
                        .toList(),
                o.getCreatedAt()
        );
    }
}