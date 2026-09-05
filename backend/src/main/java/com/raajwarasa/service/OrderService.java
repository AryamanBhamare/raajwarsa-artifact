package com.raajwarasa.service;

import com.raajwarasa.dto.OrderRequest;
import com.raajwarasa.dto.OrderResponse;
import com.raajwarasa.entity.Artifact;
import com.raajwarasa.entity.Order;
import com.raajwarasa.entity.OrderItem;
import com.raajwarasa.repository.ArtifactRepository;
import com.raajwarasa.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Set<String> ORDER_STATUSES = Set.of(
            "NEW", "CONFIRMED", "PAID", "CANCELLED", "DISPATCHED", "DELIVERED");
    private static final Set<String> DELIVERY_MODES = Set.of("STANDARD", "PICKUP");
    private static final Set<String> PAYMENT_METHODS = Set.of("UPI", "CARD", "NETBANKING", "COD");
    private static final int MAX_QUANTITY = 99;

    private final OrderRepository orderRepository;
    private final ArtifactRepository artifactRepository;

    @Transactional
    public OrderResponse create(OrderRequest req) {
        List<OrderRequest.ItemEntry> entries = req.items();
        if (entries == null || entries.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        String deliveryMode = normalize(req.deliveryMode(), null);
        if (!DELIVERY_MODES.contains(deliveryMode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid delivery mode");
        }
        String paymentMethod = normalize(req.paymentMethod(), null);
        if (!PAYMENT_METHODS.contains(paymentMethod)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment method");
        }

        boolean pickup = "PICKUP".equals(deliveryMode);
        if (!pickup) {
            requireNotBlank(req.address(), "Delivery address is required");
            requireNotBlank(req.city(), "City is required");
            requireNotBlank(req.state(), "State is required");
            requireNotBlank(req.pincode(), "PIN code is required");
            if (!req.pincode().trim().matches("^[0-9]{6}$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PIN code must be 6 digits");
            }
        }

        Order order = new Order();
        order.setCustomerName(req.customerName().trim());
        order.setEmail(req.email().trim().toLowerCase());
        order.setPhone(req.phone().trim());
        order.setAddress(pickup ? blankToNull(req.address()) : req.address().trim());
        order.setCity(pickup ? blankToNull(req.city()) : req.city().trim());
        order.setState(pickup ? blankToNull(req.state()) : req.state().trim());
        order.setPincode(pickup ? blankToNull(req.pincode()) : req.pincode().trim());
        order.setDeliveryMode(deliveryMode);
        order.setPaymentMethod(paymentMethod);

        BigDecimal total = BigDecimal.ZERO;
        Set<Long> seen = new java.util.HashSet<>();
        for (OrderRequest.ItemEntry entry : entries) {
            if (entry.quantity() == null || entry.quantity() < 1 || entry.quantity() > MAX_QUANTITY) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Quantity per piece must be between 1 and " + MAX_QUANTITY);
            }
            if (entry.artifactId() == null || !seen.add(entry.artifactId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate item in cart");
            }
            Artifact artifact = artifactRepository.findById(entry.artifactId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Artifact not available"));
            if (!artifact.isActive() || !artifact.isSaleAvailable() || artifact.getPrice() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        artifact.getName() + " is not available for purchase");
            }
            BigDecimal line = artifact.getPrice().multiply(BigDecimal.valueOf(entry.quantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            total = total.add(line);

            OrderItem item = new OrderItem();
            item.setArtifactId(artifact.getId());
            item.setArtifactName(artifact.getName());
            item.setArtifactUrl(artifact.getImages().isEmpty() ? null : artifact.getImages().get(0).getUrl());
            item.setUnitPrice(artifact.getPrice());
            item.setQuantity(entry.quantity());
            item.setLineTotal(line);
            order.addItem(item);
        }
        order.setTotalAmount(total);
        order.setOrderNumber("RW-TMP-" + java.util.UUID.randomUUID().toString().substring(0, 8));
        orderRepository.save(order);
        order.setOrderNumber("RW-" + String.format("%06d", order.getId()));
        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findAll() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        if (status == null || !ORDER_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status");
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(status);
        if ("PAID".equals(status)) {
            order.setPaymentStatus("PAID");
        }
        if ("CANCELLED".equals(status)) {
            order.setPaymentStatus("REFUNDED");
        }
        return OrderResponse.from(orderRepository.save(order));
    }

    private String normalize(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim().toUpperCase();
    }

    private void requireNotBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}