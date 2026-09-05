package com.raajwarasa;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
class OrderIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void seededSaleArtifactsArePricedAndCanBeOrdered() throws Exception {
        JsonNode artifacts = mapper.readTree(mvc.perform(get("/api/public/artifacts"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).path("items");
        JsonNode sale = null;
        for (JsonNode a : artifacts) {
            if (a.path("saleAvailable").asBoolean() && !a.path("price").isNull()) {
                sale = a;
                break;
            }
        }
        assertThat(sale).isNotNull();

        String body = mapper.writeValueAsString(Map.of(
                "customerName", "Order Test Customer",
                "email", "order@example.com",
                "phone", "7030751155",
                "address", "Deo Wada, Keshav Nagar, Chinchwad",
                "city", "Pimpri-Chinchwad",
                "state", "Maharashtra",
                "pincode", "411033",
                "deliveryMode", "STANDARD",
                "paymentMethod", "UPI",
                "items", List.of(Map.of("artifactId", sale.path("id").asLong(), "quantity", 2))
        ));

        MvcResult created = mvc.perform(post("/api/public/orders")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").exists())
                .andExpect(jsonPath("$.totalAmount").exists())
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andReturn();

        JsonNode order = mapper.readTree(created.getResponse().getContentAsString());
        double expected = sale.path("price").asDouble() * 2;
        assertThat(order.path("totalAmount").asDouble()).isEqualTo(expected);
        assertThat(order.path("orderNumber").asText()).startsWith("RW-");
        long orderId = order.path("id").asLong();

        mvc.perform(get("/api/admin/orders")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orderId));

        mvc.perform(patch("/api/admin/orders/" + orderId + "/status?status=CONFIRMED")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mvc.perform(patch("/api/admin/orders/" + orderId + "/status?status=PAID")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));

        mvc.perform(patch("/api/admin/orders/" + orderId + "/status?status=NOT_A_STATUS")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ordersAreRejectedWhenValidationFails() throws Exception {
        String body = mapper.writeValueAsString(Map.of(
                "customerName", "Bad Order",
                "email", "not-an-email",
                "phone", "12",
                "address", "",
                "city", "",
                "state", "",
                "pincode", "123",
                "deliveryMode", "STANDARD",
                "paymentMethod", "COD",
                "items", List.of(Map.of("artifactId", 999999, "quantity", 1))
        ));
        mvc.perform(post("/api/public/orders")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    private String adminToken() throws Exception {
        String body = mapper.writeValueAsString(Map.of("username", "admin", "password", "rajvarsa@123"));
        MvcResult res = mvc.perform(post("/api/auth/admin/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn();
        return mapper.readTree(res.getResponse().getContentAsString()).path("token").asText();
    }
}