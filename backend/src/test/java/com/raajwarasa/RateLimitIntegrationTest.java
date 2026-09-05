package com.raajwarasa;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class RateLimitIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @DynamicPropertySource
    static void lowRateLimit(DynamicPropertyRegistry registry) {
        registry.add("raajwarasa.rate-limit.per-minute", () -> "5");
    }

    @Test
    void floodOfPublicPostsIsThrottledWith429() throws Exception {
        String body = mapper.writeValueAsString(Map.of(
                "name", "Flood", "email", "flood@example.com", "message", "burst test"));

        int allowed = 0;
        int throttled = 0;
        for (int i = 0; i < 20; i++) {
            var res = mvc.perform(post("/api/public/contact")
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andReturn();
            if (res.getResponse().getStatus() == 429) {
                throttled++;
            } else if (res.getResponse().getStatus() == 200) {
                allowed++;
            }
        }

        if (throttled < 1) {
            throw new AssertionError("expected at least one 429 from the rate limiter");
        }
        if (allowed < 1) {
            throw new AssertionError("rate limiter blocked the very first request; expected some to pass");
        }
    }
}